import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { normalizeScoreData, createDefaultRound2, createDefaultRound3 } from "@/lib/scoringUtils";
import { getLocalTournamentTeams, formatTeamsWithDetails, saveLocalTournamentTeams } from "@/lib/teamsStorage";
import { isTeamPdfQualified } from "@/data/qualifiedTeamsSeed";
import { TeamWithDetails, TeamMember } from "@/types/database";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/teams
 * Fetches all teams with members, score status, and captain name using service role client.
 */
export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      const fallbackList = formatTeamsWithDetails(getLocalTournamentTeams());
      return NextResponse.json({ success: true, data: fallbackList });
    }

    const db = getServiceSupabase();

    const [teamsRes, scoresRes, membersRes, regsRes] = await Promise.all([
      db.from("teams").select("id, team_name, team_logo_url, robot_image_url, created_at, updated_at").order("created_at", { ascending: false }),
      db.from("scores").select("*"),
      db.from("team_members").select("id, team_id, name, branch, year"),
      db.from("registrations").select("team_id, captain_name"),
    ]);

    const teamsData = teamsRes.data || [];
    if (teamsData.length === 0) {
      const fallbackList = formatTeamsWithDetails(getLocalTournamentTeams());
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

    const formattedList: TeamWithDetails[] = teamsData.map((t: any) => {
      const rawScore = scoreMap.get(t.id) || null;
      const membersList: TeamMember[] = memberMap.get(t.id) || [];
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
            updated_at: rawScore.updated_at || t.updated_at,
          }
        : null;

      return {
        id: t.id,
        team_name: t.team_name,
        team_logo_url: t.team_logo_url || null,
        robot_image_url: t.robot_image_url || null,
        created_at: t.created_at,
        updated_at: t.updated_at,
        members: membersList,
        score: scoreObj,
        leader_name: leaderName,
        captain_name: leaderName,
      };
    });

    return NextResponse.json({ success: true, data: formattedList });
  } catch (err: any) {
    console.error("GET /api/admin/teams error:", err);
    const fallbackList = formatTeamsWithDetails(getLocalTournamentTeams());
    return NextResponse.json({ success: true, data: fallbackList });
  }
}

/**
 * POST /api/admin/teams
 * Authoritatively creates a new team, team members, captain registration, and initial score record.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team_name, team_logo_url, robot_image_url, members } = body;

    const trimmedName = (team_name || "").trim();
    if (!trimmedName) {
      return NextResponse.json(
        { success: false, error: "TEAM NAME IS REQUIRED" },
        { status: 400 }
      );
    }

    const validMembers: { name: string; branch?: string; year?: string }[] = (members || [])
      .filter((m: any) => m.name && m.name.trim().length > 0)
      .map((m: any) => ({
        name: m.name.trim(),
        branch: m.branch?.trim() || null,
        year: m.year?.trim() || null,
      }));

    const captainName = validMembers[0]?.name || "Captain";
    const now = new Date().toISOString();

    if (!isSupabaseConfigured) {
      const newTeamId = `team-${Date.now()}`;
      const localTeam = {
        id: newTeamId,
        team_name: trimmedName,
        leader_name: captainName,
        captain_name: captainName,
        team_logo_url: team_logo_url || null,
        robot_image_url: robot_image_url || null,
        members: validMembers.map((m) => ({
          name: m.name,
          branch: m.branch || "General",
          year: m.year || "1st Year",
        })),
        screening_status: "qualified" as const,
        round1_status: "pending" as const,
        round1_score: 0,
        round2: createDefaultRound2(),
        round3: createDefaultRound3(),
        created_at: now,
        updated_at: now,
      };

      const current = getLocalTournamentTeams();
      saveLocalTournamentTeams([localTeam, ...current], newTeamId);

      return NextResponse.json({ success: true, teamId: newTeamId });
    }

    const db = getServiceSupabase();

    // 1. Insert into teams table
    const { data: teamData, error: teamError } = await db
      .from("teams")
      .insert({
        team_name: trimmedName,
        team_logo_url: team_logo_url?.trim() || null,
        robot_image_url: robot_image_url?.trim() || null,
      })
      .select("id, team_name, created_at, updated_at")
      .single();

    if (teamError || !teamData) {
      console.error("Supabase team insert error:", teamError);
      return NextResponse.json(
        { success: false, error: teamError?.message || "Failed to create team in database" },
        { status: 500 }
      );
    }

    const generatedTeamId = teamData.id;

    // 2. Insert team members
    if (validMembers.length > 0) {
      const memberRows = validMembers.map((m) => ({
        team_id: generatedTeamId,
        name: m.name,
        branch: m.branch,
        year: m.year,
      }));
      await db.from("team_members").insert(memberRows);
    }

    // 3. Insert into registrations table to record captain name
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    try {
      await db.from("registrations").insert({
        team_id: generatedTeamId,
        captain_name: captainName,
        captain_email: `${captainName.toLowerCase().replace(/[^a-z0-9]/g, "") || "captain"}@robocity.hub`,
        captain_phone: "9999999999",
        registration_number: `RBV-${randomSuffix}`,
        status: "approved",
        source: "manual",
      });
    } catch (regErr) {
      console.warn("Registration insert warning:", regErr);
    }

    // 4. Determine qualification status & insert initial scores record
    const isQualified = isTeamPdfQualified(trimmedName, captainName, validMembers);
    const screeningStatus = isQualified ? "qualified" : "qualified"; // Default newly added teams to qualified

    const r2 = createDefaultRound2();
    const r3 = createDefaultRound3();

    try {
      await db.from("scores").insert({
        team_id: generatedTeamId,
        round1_score: 0,
        round2_score: 0,
        round3_score: 0,
        screening_status: screeningStatus,
        round1_status: "pending",
        round2_details: r2,
        round3_details: r3,
        details: {
          screening_status: screeningStatus,
          round1_status: "pending",
          round2: r2,
          round3: r3,
          admin_manually_set: true,
        },
        updated_at: now,
      });
    } catch (scoreErr) {
      console.warn("Score insert warning:", scoreErr);
    }

    // 5. Also sync to local tournament storage as backup
    const localTeam = {
      id: generatedTeamId,
      team_name: trimmedName,
      leader_name: captainName,
      captain_name: captainName,
      team_logo_url: team_logo_url || null,
      robot_image_url: robot_image_url || null,
      members: validMembers.map((m) => ({
        name: m.name,
        branch: m.branch || "General",
        year: m.year || "1st Year",
      })),
      screening_status: screeningStatus as "qualified" | "not_qualified",
      round1_status: "pending" as const,
      round1_score: 0,
      round2: r2,
      round3: r3,
      created_at: now,
      updated_at: now,
    };
    const current = getLocalTournamentTeams();
    saveLocalTournamentTeams([localTeam, ...current.filter((t) => t.id !== generatedTeamId)], generatedTeamId);

    return NextResponse.json({
      success: true,
      teamId: generatedTeamId,
      team: localTeam,
    });
  } catch (err: any) {
    console.error("POST /api/admin/teams exception:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create team" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/teams
 * Updates team metadata and replaces members.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, team_name, team_logo_url, robot_image_url, members } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing team ID" }, { status: 400 });
    }

    const trimmedName = (team_name || "").trim();
    if (!trimmedName) {
      return NextResponse.json({ success: false, error: "TEAM NAME IS REQUIRED" }, { status: 400 });
    }

    const validMembers: { name: string; branch?: string; year?: string }[] = (members || [])
      .filter((m: any) => m.name && m.name.trim().length > 0)
      .map((m: any) => ({
        name: m.name.trim(),
        branch: m.branch?.trim() || null,
        year: m.year?.trim() || null,
      }));

    const captainName = validMembers[0]?.name || "Captain";
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      const db = getServiceSupabase();

      // Update team info
      await db
        .from("teams")
        .update({
          team_name: trimmedName,
          team_logo_url: team_logo_url?.trim() || null,
          robot_image_url: robot_image_url?.trim() || null,
          updated_at: now,
        })
        .eq("id", id);

      // Re-insert members
      await db.from("team_members").delete().eq("team_id", id);
      if (validMembers.length > 0) {
        const memberRows = validMembers.map((m) => ({
          team_id: id,
          name: m.name,
          branch: m.branch,
          year: m.year,
        }));
        await db.from("team_members").insert(memberRows);
      }

      // Update registration captain_name if present
      await db
        .from("registrations")
        .update({ captain_name: captainName })
        .eq("team_id", id);
    }

    // Sync to local tournament store
    const current = getLocalTournamentTeams();
    const index = current.findIndex((t) => t.id === id);
    if (index !== -1) {
      const nextTeams = [...current];
      nextTeams[index] = {
        ...nextTeams[index],
        team_name: trimmedName,
        team_logo_url: team_logo_url || null,
        robot_image_url: robot_image_url || null,
        leader_name: captainName,
        captain_name: captainName,
        members: validMembers.map((m) => ({
          name: m.name,
          branch: m.branch || "General",
          year: m.year || "1st Year",
        })),
        updated_at: now,
      };
      saveLocalTournamentTeams(nextTeams, id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT /api/admin/teams error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update team" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/teams
 * Permanently deletes a team and all its cascading records.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing team ID" }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const db = getServiceSupabase();
      await db.from("teams").delete().eq("id", id);
    }

    const current = getLocalTournamentTeams();
    const filtered = current.filter((t) => t.id !== id);
    saveLocalTournamentTeams(filtered, id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/admin/teams error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete team" },
      { status: 500 }
    );
  }
}
