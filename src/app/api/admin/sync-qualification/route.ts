import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { isTeamPdfQualified } from "@/data/qualifiedTeamsSeed";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/sync-qualification
 * Auto-syncs screening_status across all teams in Supabase based on the official PDF.
 */
export async function POST() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({
      success: true,
      message: "Supabase not configured; using local seed matching.",
    });
  }

  try {
    const db = getServiceSupabase();

    const [teamsRes, scoresRes, membersRes, regsRes] = await Promise.all([
      db.from("teams").select("id, team_name"),
      db.from("scores").select("id, team_id, screening_status"),
      db.from("team_members").select("team_id, name"),
      db.from("registrations").select("team_id, captain_name"),
    ]);

    const teams = teamsRes.data || [];
    if (teams.length === 0) {
      return NextResponse.json({ success: true, message: "No teams to sync." });
    }

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

    let qualifiedCount = 0;
    let notQualifiedCount = 0;

    const updates = teams.map((team: any) => {
      const leaderName = regMap.get(team.id) || null;
      const members = memberMap.get(team.id) || [];
      const isQualified = isTeamPdfQualified(team.team_name, leaderName, members);

      if (isQualified) qualifiedCount++;
      else notQualifiedCount++;

      return {
        team_id: team.id,
        screening_status: isQualified ? "qualified" : "not_qualified",
        updated_at: new Date().toISOString(),
      };
    });

    // Batch upsert into Supabase scores table
    try {
      await db.from("scores").upsert(updates, { onConflict: "team_id" });
    } catch (err) {
      console.warn("Batch qualification upsert notice:", err);
    }

    return NextResponse.json({
      success: true,
      total_teams: teams.length,
      qualified_count: qualifiedCount,
      not_qualified_count: notQualifiedCount,
    });
  } catch (err: any) {
    console.error("Sync qualification error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Sync failed" },
      { status: 500 }
    );
  }
}
