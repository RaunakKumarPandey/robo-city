import { supabase } from "@/lib/supabase";
import { LeaderboardEntry } from "@/types/database";

/**
 * Fetches real leaderboard data from PostgreSQL (teams joined with scores).
 * Calculates authoritative rank dynamically based on total_score DESC, team_name ASC.
 */
export async function fetchLeaderboardData(): Promise<LeaderboardEntry[]> {
  // If running in browser, fetch through /api/leaderboard for full service-level reliability
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Leaderboard API fetch fallback to direct query:", e);
    }
  }

  try {
    const { data, error } = await supabase
      .from("teams")
      .select(`
        id,
        team_name,
        team_logo_url,
        robot_image_url,
        scores (
          round1_score,
          round2_score,
          round3_score,
          total_score,
          updated_at
        ),
        team_members (
          name,
          branch,
          year
        )
      `);

    if (error) {
      console.error("Error fetching leaderboard data:", error);
      // Fallback query simple teams if relation join has issues
      const { data: fallbackData } = await supabase
        .from("teams")
        .select("id, team_name, team_logo_url, robot_image_url");

      if (!fallbackData) return [];

      return fallbackData.map((t, idx) => ({
        id: t.id,
        team_name: t.team_name || `Team ${idx + 1}`,
        team_logo_url: t.team_logo_url,
        robot_image_url: t.robot_image_url,
        round1_score: 0,
        round2_score: 0,
        round3_score: 0,
        total_score: 0,
        rank: idx + 1,
        members: [],
      }));
    }

    if (!data) return [];

    // Flatten score objects and members with NO filter
    const list: Omit<LeaderboardEntry, "rank">[] = (data || []).map((t: any) => {
      const rawScores = t.scores || t.score;
      const scoreObj = Array.isArray(rawScores) ? rawScores[0] : rawScores;
      const rawMembers = t.team_members || t.members || [];
      return {
        id: t.id,
        team_name: t.team_name || "Unnamed Team",
        team_logo_url: t.team_logo_url,
        robot_image_url: t.robot_image_url,
        round1_score: Number(scoreObj?.round1_score ?? 0),
        round2_score: Number(scoreObj?.round2_score ?? 0),
        round3_score: Number(scoreObj?.round3_score ?? 0),
        total_score: Number(scoreObj?.total_score ?? 0),
        updated_at: scoreObj?.updated_at,
        members: Array.isArray(rawMembers) ? rawMembers : [],
      };
    });

    // Sort by total_score DESC, tiebreak by team_name ASC
    list.sort((a, b) => {
      if (b.total_score !== a.total_score) {
        return b.total_score - a.total_score;
      }
      return (a.team_name || "").localeCompare(b.team_name || "");
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
