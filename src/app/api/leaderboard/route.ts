import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchLeaderboardData } from "@/lib/leaderboard";
import { getLocalTournamentTeams, formatLeaderboardEntries } from "@/lib/teamsStorage";

export const dynamic = "force-dynamic";

/**
 * GET /api/leaderboard
 * Returns public competition standings, registered team scores, and database diagnostics.
 */
export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      const fallbackList = formatLeaderboardEntries(getLocalTournamentTeams());
      return NextResponse.json({
        success: true,
        source: "local-seed-store",
        diagnostics: {
          supabase_host: "local-store",
          has_service_role_key: false,
          total_teams_in_db: fallbackList.length,
          total_scores_in_db: fallbackList.length,
          total_registrations_in_db: fallbackList.length,
          teams_with_missing_scores_count: 0,
          teams_with_missing_scores: [],
          table_errors: {
            teams_error: null,
            scores_error: null,
            registrations_error: null,
          },
          leaderboard_rendered_count: fallbackList.length,
        },
        count: fallbackList.length,
        data: fallbackList,
      });
    }

    const db = getServiceSupabase();

    // 1. Fetch live leaderboard data
    const list = await fetchLeaderboardData(db);

    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
      : "not-configured";

    const hasServiceRoleKey = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY.length > 10
    );

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

    const finalData = list.length > 0 ? list : formatLeaderboardEntries(getLocalTournamentTeams());

    return NextResponse.json({
      success: true,
      diagnostics: {
        supabase_host: supabaseHost,
        has_service_role_key: hasServiceRoleKey,
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
        leaderboard_rendered_count: finalData.length,
      },
      count: finalData.length,
      data: finalData,
    });
  } catch (err: any) {
    const fallbackList = formatLeaderboardEntries(getLocalTournamentTeams());
    return NextResponse.json({
      success: true,
      source: "fallback-on-error",
      error: err?.message,
      count: fallbackList.length,
      data: fallbackList,
    });
  }
}
