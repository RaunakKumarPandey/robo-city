import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { normalizeScoreData, calculateRound2, calculateRound3 } from "@/lib/scoringUtils";
import { DetailedScoreUpdatePayload } from "@/lib/scores";
import { ScoreDetails } from "@/types/database";
import { getLocalTournamentTeams, formatTeamScoreItems } from "@/lib/teamsStorage";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/scores
 * Fetches all teams with scores using server-side service role key (RLS bypassed).
 */
export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      const list = formatTeamScoreItems(getLocalTournamentTeams());
      return NextResponse.json({ success: true, data: list });
    }

    const db = getServiceSupabase();

    const [teamsRes, scoresRes, membersRes, regsRes] = await Promise.all([
      db.from("teams").select("id, team_name, team_logo_url, robot_image_url, created_at, updated_at"),
      db.from("scores").select("*"),
      db.from("team_members").select("id, team_id, name, branch, year"),
      db.from("registrations").select("team_id, captain_name"),
    ]);

    const teamsData = teamsRes.data || [];
    if (teamsData.length === 0) {
      const fallbackList = formatTeamScoreItems(getLocalTournamentTeams());
      return NextResponse.json({ success: true, data: fallbackList });
    }

    const scoreMap = new Map<string, any>();
    (scoresRes.data || []).forEach((s: any) => {
      if (s.team_id) scoreMap.set(s.team_id, s);
    });

    const memberMap = new Map<string, any[]>();
    (membersRes.data || []).forEach((m: any) => {
      if (m.team_id) {
        const list = memberMap.get(m.team_id) || [];
        list.push(m);
        memberMap.set(m.team_id, list);
      }
    });

    const regMap = new Map<string, string>();
    (regsRes.data || []).forEach((r: any) => {
      if (r.team_id && r.captain_name) regMap.set(r.team_id, r.captain_name);
    });

    const items = teamsData.map((t: any) => {
      const rawScore = scoreMap.get(t.id) || null;
      const membersList = memberMap.get(t.id) || [];
      const leaderName = regMap.get(t.id) || (membersList[0]?.name ? membersList[0].name.trim() : null);
      const normalized = normalizeScoreData(rawScore, t.team_name, leaderName, membersList);

      const scoreObj = rawScore
        ? {
            id: rawScore.id || `score-${t.id}`,
            team_id: t.id,
            round1_score: normalized.round1_score,
            round2_score: normalized.round2_score,
            round3_score: normalized.round3_score,
            total_score: normalized.total_score,
            screening_status: normalized.screening_status,
            round1_status: normalized.round1_status,
            round2_details: normalized.round2_details,
            round3_details: normalized.round3_details,
            details: normalized.details,
            overall_time: normalized.overall_time,
            updated_at: rawScore.updated_at || t.updated_at,
          }
        : null;

      return {
        id: t.id,
        team_name: t.team_name,
        leader_name: leaderName,
        captain_name: leaderName,
        team_logo_url: t.team_logo_url,
        robot_image_url: t.robot_image_url,
        created_at: t.created_at,
        updated_at: t.updated_at,
        score: scoreObj,
        screening_status: normalized.screening_status,
        round1_status: normalized.round1_status,
        overall_time: normalized.overall_time,
        round2_details: normalized.round2_details,
        round3_details: normalized.round3_details,
        details: normalized.details,
        members: membersList,
      };
    });

    return NextResponse.json({ success: true, count: items.length, data: items });
  } catch (err: any) {
    console.error("GET /api/admin/scores exception:", err);
    const fallbackList = formatTeamScoreItems(getLocalTournamentTeams());
    return NextResponse.json({ success: true, data: fallbackList });
  }
}

/**
 * POST /api/admin/scores
 * Authoritatively updates a team's multi-round score & qualification status via service role.
 */
export async function POST(request: Request) {
  try {
    const payload: DetailedScoreUpdatePayload = await request.json();
    const { teamId, screening_status, round1_status } = payload;

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "Missing required teamId" },
        { status: 400 }
      );
    }

    const r2 = calculateRound2(payload.round2);
    const r3Stages = Array.isArray(payload.round3)
      ? payload.round3
      : payload.round3?.stages;
    const r3 = calculateRound3(r3Stages);

    const r1Score = payload.round1_score ?? (round1_status === "qualified" ? 1 : 0);
    const r2Score = r2.total_marks;
    const r3Score = r3.total_marks;
    const grandTotal = screening_status === "not_qualified" ? 0 : r2Score + r3Score;

    const scoreDetails: ScoreDetails = {
      screening_status,
      round1_status,
      round2: r2,
      round3: r3,
    };

    const updateTimestamp = new Date().toISOString();

    if (isSupabaseConfigured) {
      const db = getServiceSupabase();

      // 1. Try upserting with full columns
      try {
        const { data: fullData, error: fullError } = await db
          .from("scores")
          .upsert(
            {
              team_id: teamId,
              round1_score: r1Score,
              round2_score: r2Score,
              round3_score: r3Score,
              screening_status,
              round1_status,
              round2_details: r2,
              round3_details: r3,
              details: scoreDetails,
              updated_at: updateTimestamp,
            },
            { onConflict: "team_id" }
          )
          .select("*")
          .single();

        if (!fullError && fullData) {
          return NextResponse.json({
            success: true,
            score: {
              ...fullData,
              screening_status,
              round1_status,
              round2_details: r2,
              round3_details: r3,
              details: scoreDetails,
              total_score: grandTotal,
            },
          });
        }
      } catch (err) {
        console.warn("Full upsert attempt notice:", err);
      }

      // 2. Fallback: Core columns upsert if custom columns are not yet in remote schema
      try {
        const { data: coreData, error: coreError } = await db
          .from("scores")
          .upsert(
            {
              team_id: teamId,
              round1_score: r1Score,
              round2_score: r2Score,
              round3_score: r3Score,
              updated_at: updateTimestamp,
            },
            { onConflict: "team_id" }
          )
          .select("*")
          .single();

        if (!coreError && coreData) {
          return NextResponse.json({
            success: true,
            score: {
              ...coreData,
              screening_status,
              round1_status,
              round2_details: r2,
              round3_details: r3,
              details: scoreDetails,
              total_score: grandTotal,
            },
          });
        }
      } catch (err) {
        console.warn("Core upsert attempt notice:", err);
      }
    }

    return NextResponse.json({
      success: true,
      score: {
        id: `score-${teamId}`,
        team_id: teamId,
        round1_score: r1Score,
        round2_score: r2Score,
        round3_score: r3Score,
        total_score: grandTotal,
        screening_status,
        round1_status,
        round2_details: r2,
        round3_details: r3,
        details: scoreDetails,
        overall_time: normalizeScoreData({ round2_details: r2, round3_details: r3 }).overall_time,
        updated_at: updateTimestamp,
      },
    });
  } catch (err: any) {
    console.error("POST /api/admin/scores error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update score" },
      { status: 500 }
    );
  }
}
