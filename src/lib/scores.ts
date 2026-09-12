import { supabase } from "@/lib/supabase";
import { Score, TeamWithDetails } from "@/types/database";

export interface TeamScoreItem {
  id: string;
  team_name: string;
  team_logo_url?: string | null;
  robot_image_url?: string | null;
  score: Score | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all teams along with their competition scores from Supabase PostgreSQL.
 */
export async function fetchTeamsWithScores(): Promise<TeamScoreItem[]> {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select(`
        id,
        team_name,
        team_logo_url,
        robot_image_url,
        created_at,
        updated_at,
        score:scores(*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching teams with scores:", error);
      return [];
    }

    return (data || []).map((t: any) => ({
      id: t.id,
      team_name: t.team_name,
      team_logo_url: t.team_logo_url,
      robot_image_url: t.robot_image_url,
      created_at: t.created_at,
      updated_at: t.updated_at,
      score: Array.isArray(t.score) ? t.score[0] || null : t.score || null,
    }));
  } catch (err) {
    console.error("Fetch teams with scores exception:", err);
    return [];
  }
}

/**
 * Securely update competition scores for a specific team in Supabase PostgreSQL.
 * Server-side integer & non-negative validation is performed.
 */
export async function updateTeamScores(
  teamId: string,
  round1: number,
  round2: number,
  round3: number
): Promise<{ success: boolean; score?: Score; error?: string }> {
  // 1. Validation: Team ID
  if (!teamId) {
    return { success: false, error: "TEAM NOT FOUND" };
  }

  // 2. Validation: Score formats
  if (
    !Number.isInteger(round1) ||
    !Number.isInteger(round2) ||
    !Number.isInteger(round3)
  ) {
    return { success: false, error: "SCORES MUST BE WHOLE NUMBERS (INTEGERS)" };
  }

  if (round1 < 0 || round2 < 0 || round3 < 0) {
    return { success: false, error: "ROUND SCORES CANNOT BE NEGATIVE" };
  }

  try {
    // 3. Attempt update via secure RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "update_team_scores",
      {
        p_team_id: teamId,
        p_round1: round1,
        p_round2: round2,
        p_round3: round3,
      }
    );

    if (!rpcError && rpcData?.success && rpcData?.score) {
      return { success: true, score: rpcData.score as Score };
    }

    // 4. Fallback: Direct Upsert targeting scores table with RLS
    const { data: upsertData, error: upsertError } = await supabase
      .from("scores")
      .upsert(
        {
          team_id: teamId,
          round1_score: round1,
          round2_score: round2,
          round3_score: round3,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "team_id" }
      )
      .select("*")
      .single();

    if (upsertError || !upsertData) {
      console.error("Direct score update error:", upsertError);
      return { success: false, error: "SCORE UPDATE FAILED. PLEASE TRY AGAIN." };
    }

    return { success: true, score: upsertData as Score };
  } catch (err) {
    console.error("Score update exception:", err);
    return { success: false, error: "SOMETHING WENT WRONG. PLEASE TRY AGAIN." };
  }
}
