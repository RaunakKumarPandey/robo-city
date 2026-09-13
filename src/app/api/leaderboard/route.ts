import { NextResponse } from "next/server";
import { fetchLeaderboardData } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

/**
 * GET /api/leaderboard
 * Returns public competition standings and registered team scores.
 */
export async function GET() {
  try {
    const list = await fetchLeaderboardData();
    return NextResponse.json({
      success: true,
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
