import { supabase } from "@/lib/supabase";
import { LeaderboardEntry } from "@/types/database";

/**
 * Fetches real leaderboard data from PostgreSQL (teams joined with scores).
 * Calculates authoritative rank dynamically based on total_score DESC, team_name ASC.
 */
export async function fetchLeaderboardData(): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select(`
        id,
        team_name,
        team_logo_url,
        robot_image_url,
        score:scores (
          round1_score,
          round2_score,
          round3_score,
          total_score,
          updated_at
        ),
        members:team_members (
          name,
          branch,
          year
        )
      `);

    if (error) {
      console.error("Error fetching leaderboard data:", error);
      return [];
    }

    if (!data) return [];

    // Flatten score objects and members
    const list: Omit<LeaderboardEntry, "rank">[] = data.map((t: any) => {
      const scoreObj = Array.isArray(t.score) ? t.score[0] : t.score;
      return {
        id: t.id,
        team_name: t.team_name,
        team_logo_url: t.team_logo_url,
        robot_image_url: t.robot_image_url,
        round1_score: scoreObj?.round1_score ?? 0,
        round2_score: scoreObj?.round2_score ?? 0,
        round3_score: scoreObj?.round3_score ?? 0,
        total_score: scoreObj?.total_score ?? 0,
        updated_at: scoreObj?.updated_at,
        members: t.members || [],
      };
    });

    // Sort by total_score DESC, tiebreak by team_name ASC
    list.sort((a, b) => {
      if (b.total_score !== a.total_score) {
        return b.total_score - a.total_score;
      }
      return a.team_name.localeCompare(b.team_name);
    });

    // Assign dynamic ranks: 1, 2, 3...
    const rankedList: LeaderboardEntry[] = list.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return rankedList;
  } catch (err) {
    console.error("fetchLeaderboardData exception:", err);
    return [];
  }
}
