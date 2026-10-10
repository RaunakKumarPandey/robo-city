import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { normalizeScoreData, compareRound2ArenaTeams } from "@/lib/scoringUtils";
import { LeaderboardEntry } from "@/types/database";
import { getInitialLeaderboardEntries } from "@/data/initialLeaderboardData";

export const dynamic = "force-dynamic";

/**
 * GET /api/leaderboard
 * Fetches all official tournament teams with their scores and returns live ranked leaderboard.
 */
export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      const fallback = getInitialLeaderboardEntries();
      return NextResponse.json({ success: true, count: fallback.length, data: fallback });
    }

    const db = getServiceSupabase();

    // Fetch teams, scores, members, and captain registrations in a single parallel query
    const [teamsRes, scoresRes, membersRes, regsRes] = await Promise.all([
      db.from("teams").select("id, team_name, team_logo_url, robot_image_url, created_at, updated_at").order("created_at", { ascending: false }),
      db.from("scores").select("*"),
      db.from("team_members").select("id, team_id, name, branch, year"),
      db.from("registrations").select("team_id, captain_name"),
    ]);

    const teamsData = teamsRes.data || [];
    if (teamsData.length === 0) {
      const fallback = getInitialLeaderboardEntries();
      return NextResponse.json({ success: true, count: fallback.length, data: fallback });
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

    const list: Omit<LeaderboardEntry, "rank">[] = teamsData.map((t: any) => {
      const rawScore = scoreMap.get(t.id) || null;
      const rawMembers = memberMap.get(t.id) || [];
      const leaderName = regMap.get(t.id) || (rawMembers[0]?.name ? rawMembers[0].name.trim() : null);
      const normalized = normalizeScoreData(rawScore, t.team_name, leaderName, rawMembers);

      return {
        id: t.id,
        team_name: t.team_name || "Unnamed Team",
        leader_name: leaderName,
        team_logo_url: t.team_logo_url,
        robot_image_url: t.robot_image_url,
        screening_status: normalized.screening_status,
        round1_status: normalized.round1_status,
        round1_score: normalized.round1_score,
        round2_score: normalized.round2_score,
        round3_score: normalized.round3_score,
        total_score: normalized.total_score,
        overall_time: normalized.overall_time,
        round2_details: normalized.round2_details,
        round3_details: normalized.round3_details,
        details: normalized.details,
        updated_at: rawScore?.updated_at || t.updated_at,
        members: rawMembers,
      };
    });

    // Partition into Qualified & Not Qualified
    const qualifiedTeams = list.filter((t) => t.screening_status === "qualified");
    const notQualifiedTeams = list.filter((t) => t.screening_status === "not_qualified");

    // Sort qualified teams by lowest Round 2 Arena Overall Time ASC (lowest time ranks #1)
    qualifiedTeams.sort((a, b) => {
      const aR2 = a.round2_details;
      const bR2 = b.round2_details;

      return compareRound2ArenaTeams(
        {
          overall_time_seconds: aR2?.overall_time_seconds ?? a.round2_score,
          viva_marks: aR2?.viva_marks ?? 0,
          completion_time_seconds: aR2?.completion_time_seconds ?? (aR2?.time_taken_seconds ?? 0),
          skip_penalties: aR2?.skip_penalties ?? 0,
          touch_penalties: aR2?.touch_penalties ?? aR2?.hand_touches ?? 0,
          team_name: a.team_name,
          id: a.id,
        },
        {
          overall_time_seconds: bR2?.overall_time_seconds ?? b.round2_score,
          viva_marks: bR2?.viva_marks ?? 0,
          completion_time_seconds: bR2?.completion_time_seconds ?? (bR2?.time_taken_seconds ?? 0),
          skip_penalties: bR2?.skip_penalties ?? 0,
          touch_penalties: bR2?.touch_penalties ?? bR2?.hand_touches ?? 0,
          team_name: b.team_name,
          id: b.id,
        }
      );
    });

    // Sort not qualified teams by name ASC
    notQualifiedTeams.sort((a, b) => {
      const nameCompare = (a.team_name || "").localeCompare(b.team_name || "");
      if (nameCompare !== 0) return nameCompare;
      return (a.id || "").localeCompare(b.id || "");
    });

    const rankedQualified: LeaderboardEntry[] = qualifiedTeams.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    const rankedNotQualified: LeaderboardEntry[] = notQualifiedTeams.map((entry, index) => ({
      ...entry,
      rank: qualifiedTeams.length + index + 1,
    }));

    const results = [...rankedQualified, ...rankedNotQualified];
    return NextResponse.json({ success: true, count: results.length, data: results });
  } catch (err: any) {
    console.error("GET /api/leaderboard error:", err);
    const fallback = getInitialLeaderboardEntries();
    return NextResponse.json({ success: true, count: fallback.length, data: fallback });
  }
}
