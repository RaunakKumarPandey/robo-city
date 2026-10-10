import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchLeaderboardData } from "@/lib/leaderboard";
import { getLocalTournamentTeams, formatLeaderboardEntries } from "@/lib/teamsStorage";

export const dynamic = "force-dynamic";

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
  });
}

/**
 * GET /api/leaderboard
 * Returns public competition standings with strict timeout safety so it never hangs or 504s.
 */
export async function GET() {
  const fallbackList = formatLeaderboardEntries(getLocalTournamentTeams());

  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({
        success: true,
        source: "local-seed-store",
        count: fallbackList.length,
        data: fallbackList,
      });
    }

    const db = getServiceSupabase();

    // 1. Fetch live leaderboard data with a strict 3000ms timeout
    const list = await withTimeout(
      fetchLeaderboardData(db),
      3000,
      fallbackList
    );

    const finalData = list && list.length > 0 ? list : fallbackList;

    return NextResponse.json({
      success: true,
      count: finalData.length,
      data: finalData,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      source: "fallback-on-error",
      error: err?.message,
      count: fallbackList.length,
      data: fallbackList,
    });
  }
}
