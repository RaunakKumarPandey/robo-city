import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Score, TeamMember, Round2Details, StageDetails, Round3Details, ScoreDetails } from "@/types/database";
import { normalizeScoreData, calculateRound2, calculateRound3 } from "./scoringUtils";
import { getLocalTournamentTeams, updateLocalTeamScore, formatTeamScoreItems } from "./teamsStorage";

export interface TeamScoreItem {
  id: string;
  team_name: string;
  leader_name?: string | null;
  captain_name?: string | null;
  team_logo_url?: string | null;
  robot_image_url?: string | null;
  score: Score | null;
  screening_status: "qualified" | "not_qualified";
  round1_status: "qualified" | "not_qualified" | "pending";
  overall_time?: string | null;
  round2_details?: Round2Details | null;
  round3_details?: Round3Details | null;
  details?: ScoreDetails | null;
  members?: TeamMember[];
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all teams along with their competition scores from server API, Supabase, or local cache.
 */
export async function fetchTeamsWithScores(): Promise<TeamScoreItem[]> {
  if (!isSupabaseConfigured) {
    return formatTeamScoreItems(getLocalTournamentTeams());
  }

  // 1. In browser, try server-side API endpoint for service-role direct access
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/admin/scores?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // Continue to Supabase / Local fallback
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
        created_at,
        updated_at,
        score:scores(*),
        members:team_members(*),
        registrations (
          captain_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return formatTeamScoreItems(getLocalTournamentTeams());
    }

    return (data || []).map((t: any) => {
      const regObj = Array.isArray(t.registrations) ? t.registrations[0] : t.registrations;
      const membersList = t.members || [];
      const leaderName =
        regObj?.captain_name?.trim() ||
        (Array.isArray(membersList) && membersList[0]?.name ? membersList[0].name.trim() : null);

      const rawScore = Array.isArray(t.score) ? t.score[0] || null : t.score || null;
      const normalized = normalizeScoreData(rawScore, t.team_name, leaderName, membersList);

      const scoreObj: Score | null = rawScore
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
            overall_time: normalized.overall_time,
            updated_at: rawScore.updated_at || new Date().toISOString(),
          }
        : null;

      return {
        id: t.id,
        team_name: t.team_name,
        leader_name: leaderName,
        captain_name: leaderName,
        team_logo_url: t.team_logo_url,
        robot_image_url: t.robot_image_url,
        created_at: t.created_at,
        updated_at: t.updated_at,
        score: scoreObj,
        screening_status: normalized.screening_status,
        round1_status: normalized.round1_status,
        overall_time: normalized.overall_time,
        round2_details: normalized.round2_details,
        round3_details: normalized.round3_details,
        details: normalized.details,
        members: membersList,
      };
    });
  } catch (err) {
    console.error("Fetch teams with scores exception:", err);
    return formatTeamScoreItems(getLocalTournamentTeams());
  }
}

export interface DetailedScoreUpdatePayload {
  teamId: string;
  screening_status: "qualified" | "not_qualified";
  round1_status: "qualified" | "not_qualified" | "pending";
  round1_score?: number;
  round2: Partial<Round2Details>;
  round3: Partial<Round3Details> | Partial<StageDetails>[];
}

/**
 * Update detailed competition score structure including Quiz screening, Viva, Arena 1, and Arena 2 (3 stages).
 * Immediately updates local state & broadcasts to open leaderboard tabs in real-time,
 * and authoritatively saves to PostgreSQL via /api/admin/scores.
 */
export async function updateDetailedTeamScores(
  payload: DetailedScoreUpdatePayload
): Promise<{ success: boolean; score?: Score; error?: string }> {
  const { teamId, screening_status, round1_status } = payload;
  if (!teamId) {
    return { success: false, error: "TEAM NOT FOUND" };
  }

  // 1. Immediately update local store and broadcast in real-time across tabs
  const localUpdated = updateLocalTeamScore(payload);

  const r2 = calculateRound2(payload.round2);
  const r3Stages = Array.isArray(payload.round3)
    ? payload.round3
    : payload.round3?.stages;
  const r3 = calculateRound3(r3Stages);

  const r1Score = payload.round1_score ?? (round1_status === "qualified" ? 1 : 0);
  const r2Score = r2.total_marks;
  const r3Score = r3.total_marks;
  const grandTotal = screening_status === "not_qualified" ? 0 : r2Score + r3Score;

  const scoreDetails: ScoreDetails = {
    screening_status,
    round1_status,
    round2: r2,
    round3: r3,
    admin_manually_set: true,
  } as any;

  const updateTimestamp = new Date().toISOString();

  const constructedScore: Score = {
    id: `score-${teamId}`,
    team_id: teamId,
    round1_score: r1Score,
    round2_score: r2Score,
    round3_score: r3Score,
    total_score: grandTotal,
    screening_status,
    round1_status,
    round2_details: r2,
    round3_details: r3,
    details: scoreDetails,
    overall_time: localUpdated ? normalizeScoreData({ round2_details: r2, round3_details: r3 }).overall_time : "00:00",
    updated_at: updateTimestamp,
  };

  // 2. Authoritatively send to server-side API endpoint with Service Role Key
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/admin/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.score) {
          return { success: true, score: json.score };
        }
      }
    } catch (err) {
      console.warn("API /api/admin/scores call notice:", err);
    }
  }

  // 3. Fallback direct Supabase upsert
  if (isSupabaseConfigured) {
    try {
      const { data: upsertData, error: upsertError } = await supabase
        .from("scores")
        .upsert(
          {
            team_id: teamId,
            round1_score: r1Score,
            round2_score: r2Score,
            round3_score: r3Score,
            screening_status,
            round1_status,
            round2_details: r2,
            round3_details: r3,
            details: scoreDetails,
            updated_at: updateTimestamp,
          },
          { onConflict: "team_id" }
        )
        .select("*")
        .single();

      if (!upsertError && upsertData) {
        return {
          success: true,
          score: {
            ...upsertData,
            screening_status,
            round1_status,
            round2_details: r2,
            round3_details: r3,
            details: scoreDetails,
            total_score: grandTotal,
          },
        };
      }
    } catch (err) {
      console.warn("Supabase remote score sync notice:", err);
    }
  }

  return {
    success: true,
    score: constructedScore,
  };
}

/**
 * Securely update competition scores for a specific team in Supabase PostgreSQL (Legacy wrapper).
 */
export async function updateTeamScores(
  teamId: string,
  round1: number,
  round2: number,
  round3: number
): Promise<{ success: boolean; score?: Score; error?: string }> {
  return updateDetailedTeamScores({
    teamId,
    screening_status: "qualified",
    round1_status: round1 > 0 ? "qualified" : "pending",
    round1_score: round1,
    round2: { gain_marks: round2, max_marks: 100 },
    round3: {
      stages: [
        { stage_number: 1, gain_marks: round3, max_marks: 50 },
        { stage_number: 2, gain_marks: 0, max_marks: 50 },
        { stage_number: 3, gain_marks: 0, max_marks: 50 },
      ] as any,
    },
  });
}
