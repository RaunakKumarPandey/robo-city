import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { fetchLeaderboardData } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

/**
 * GET /api/leaderboard
 * Returns public competition standings, registered team scores, and database diagnostics.
 */
export async function GET() {
  try {
    const db = getServiceSupabase();

    // 1. Fetch live leaderboard data
    const list = await fetchLeaderboardData();

    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
      : "not-configured";

    const hasServiceRoleKey = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY.length > 10
    );

    // Test RPC availability safely
    let rpcStatus = "unknown";
    try {
      const { error: rpcErr } = await db.rpc("sync_google_form_registration", {
        p_external_response_id: "diag-check-only",
        p_team_name: "__DIAGNOSTIC_PROBE__",
        p_captain_name: "Probe",
        p_captain_email: "probe@domain.com",
      });
      if (rpcErr) {
        rpcStatus = rpcErr.message || rpcErr.code || "RPC error";
      } else {
        rpcStatus = "RPC exists & callable";
      }
    } catch (e: any) {
      rpcStatus = e?.message || "RPC exception";
    }

    // 2. Fetch diagnostic counts directly from Supabase tables
    const [teamsRes, scoresRes, regsRes] = await Promise.all([
      db.from("teams").select("id, team_name", { count: "exact" }),
      db.from("scores").select("id, team_id", { count: "exact" }),
      db.from("registrations").select("id, registration_number, sync_status", { count: "exact" }),
    ]);

    const teamCount = teamsRes.count ?? 0;
    const scoreCount = scoresRes.count ?? 0;
    const regCount = regsRes.count ?? 0;

    // Identify teams with missing scores rows
    const scoreTeamIds = new Set((scoresRes.data || []).map((s) => s.team_id));
    const teamsWithMissingScores = (teamsRes.data || [])
      .filter((t) => !scoreTeamIds.has(t.id))
      .map((t) => ({ id: t.id, team_name: t.team_name }));

    return NextResponse.json({
      success: true,
      diagnostics: {
        supabase_host: supabaseHost,
        has_service_role_key: hasServiceRoleKey,
        rpc_status: rpcStatus,
        total_teams_in_db: teamCount,
        total_scores_in_db: scoreCount,
        total_registrations_in_db: regCount,
        teams_with_missing_scores_count: teamsWithMissingScores.length,
        teams_with_missing_scores: teamsWithMissingScores,
        table_errors: {
          teams_error: teamsRes.error ? teamsRes.error.message : null,
          scores_error: scoresRes.error ? scoresRes.error.message : null,
          registrations_error: regsRes.error ? regsRes.error.message : null,
        },
        leaderboard_rendered_count: list.length,
      },
      count: list.length,
      data: list,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}

