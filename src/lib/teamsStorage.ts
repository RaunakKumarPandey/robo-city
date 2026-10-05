import { LeaderboardEntry, Score, TeamMember, ScoreDetails } from "@/types/database";
import { initialTournamentTeams, InitialTeamSeed } from "@/data/initialLeaderboardData";
import { normalizeScoreData, calculateRound2, calculateRound3 } from "@/lib/scoringUtils";
import { TeamScoreItem, DetailedScoreUpdatePayload } from "@/lib/scores";
import { TeamWithDetails } from "@/types/database";

const TEAMS_STORAGE_KEY = "robocity_tournament_teams_v2";
const BROADCAST_CHANNEL_NAME = "robocity_scores_realtime_channel";

// In-memory cache for instant synchronous access
let memoryTeamsCache: InitialTeamSeed[] | null = null;
let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!broadcastChannel && typeof window.BroadcastChannel !== "undefined") {
    try {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch {
      // BroadcastChannel might not be supported in some environments
    }
  }
  return broadcastChannel;
}

/**
 * Safely persist tournament teams to localStorage.
 */
function safeSetStorage(data: InitialTeamSeed[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    try {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(data.slice(0, 30)));
    } catch {}
  }
}

/**
 * Get current tournament teams (In-memory -> localStorage -> Initial Seed).
 */
export function getLocalTournamentTeams(): InitialTeamSeed[] {
  if (memoryTeamsCache && memoryTeamsCache.length > 0) {
    return memoryTeamsCache;
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(TEAMS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryTeamsCache = parsed;
          return parsed;
        }
      }
    } catch {}
  }

  memoryTeamsCache = [...initialTournamentTeams];
  safeSetStorage(memoryTeamsCache);
  return memoryTeamsCache;
}

/**
 * Save updated tournament teams to local storage, cache, and notify all tabs/windows.
 */
export function saveLocalTournamentTeams(
  teams: InitialTeamSeed[],
  updatedTeamId?: string
): void {
  memoryTeamsCache = teams;
  safeSetStorage(teams);

  if (typeof window !== "undefined") {
    // 1. Dispatch custom DOM event
    try {
      window.dispatchEvent(
        new CustomEvent("scores_updated", {
          detail: { teamId: updatedTeamId, timestamp: Date.now() },
        })
      );
    } catch {}

    // 2. Broadcast across all browser tabs
    const bc = getBroadcastChannel();
    if (bc) {
      try {
        bc.postMessage({
          type: "SCORES_UPDATED",
          teamId: updatedTeamId,
          timestamp: Date.now(),
        });
      } catch {}
    }
  }
}

/**
 * Update score and qualification status locally.
 */
export function updateLocalTeamScore(payload: DetailedScoreUpdatePayload): InitialTeamSeed | null {
  const current = getLocalTournamentTeams();
  const index = current.findIndex((t) => t.id === payload.teamId);
  if (index === -1) return null;

  const prev = current[index];
  const r2 = calculateRound2(payload.round2);
  const r3Stages = Array.isArray(payload.round3)
    ? payload.round3
    : payload.round3?.stages;
  const r3 = calculateRound3(r3Stages);

  const updatedTeam: InitialTeamSeed = {
    ...prev,
    screening_status: payload.screening_status,
    round1_status: payload.round1_status,
    round1_score: payload.round1_score ?? (payload.round1_status === "qualified" ? 1 : 0),
    round2: {
      completion_time: r2.completion_time,
      max_marks: r2.max_marks,
      gain_marks: r2.gain_marks,
      penalty_rate: r2.penalty_rate,
      penalty_count: r2.penalty_count,
    },
    round3: {
      stages: r3.stages.map((st) => ({
        stage_number: st.stage_number,
        completion_time: st.completion_time,
        max_marks: st.max_marks,
        gain_marks: st.gain_marks,
        penalty_rate: st.penalty_rate,
        penalty_count: st.penalty_count,
      })),
    },
    updated_at: new Date().toISOString(),
  };

  const nextTeams = [...current];
  nextTeams[index] = updatedTeam;
  saveLocalTournamentTeams(nextTeams, payload.teamId);

  return updatedTeam;
}

/**
 * Convert internal InitialTeamSeed array to ranked LeaderboardEntry array.
 */
export function formatLeaderboardEntries(teams: InitialTeamSeed[]): LeaderboardEntry[] {
  const normalized = teams.map((t) => {
    const rawScore = {
      screening_status: t.screening_status,
      round1_status: t.round1_status,
      round1_score: t.round1_score,
      round2_details: t.round2,
      round3_details: t.round3,
    };
    const norm = normalizeScoreData(
      rawScore,
      t.team_name,
      t.leader_name || t.captain_name,
      t.members
    );

    return {
      id: t.id,
      team_name: t.team_name,
      leader_name: t.leader_name || t.captain_name || (t.members?.[0]?.name ?? null),
      team_logo_url: t.team_logo_url || null,
      robot_image_url: t.robot_image_url || null,
      screening_status: norm.screening_status,
      round1_status: norm.round1_status,
      round1_score: norm.round1_score,
      round2_score: norm.round2_score,
      round3_score: norm.round3_score,
      total_score: norm.total_score,
      overall_time: norm.overall_time,
      round2_details: norm.round2_details,
      round3_details: norm.round3_details,
      details: norm.details,
      updated_at: t.updated_at,
      members: t.members || [],
    };
  });

  const qualified = normalized.filter((t) => t.screening_status === "qualified");
  const notQualified = normalized.filter((t) => t.screening_status === "not_qualified");

  // Sort qualified teams by total_score DESC, tiebreak by team_name ASC
  qualified.sort((a, b) => {
    if (b.total_score !== a.total_score) return b.total_score - a.total_score;
    return a.team_name.localeCompare(b.team_name);
  });

  // Sort not qualified teams by name ASC
  notQualified.sort((a, b) => a.team_name.localeCompare(b.team_name));

  const rankedQualified: LeaderboardEntry[] = qualified.map((e, idx) => ({
    ...e,
    rank: idx + 1,
  }));

  const rankedNotQualified: LeaderboardEntry[] = notQualified.map((e, idx) => ({
    ...e,
    rank: qualified.length + idx + 1,
  }));

  return [...rankedQualified, ...rankedNotQualified];
}

/**
 * Convert internal InitialTeamSeed array to TeamScoreItem array for Admin Scoring.
 */
export function formatTeamScoreItems(teams: InitialTeamSeed[]): TeamScoreItem[] {
  return teams.map((t) => {
    const rawScore = {
      screening_status: t.screening_status,
      round1_status: t.round1_status,
      round1_score: t.round1_score,
      round2_details: t.round2,
      round3_details: t.round3,
    };
    const norm = normalizeScoreData(
      rawScore,
      t.team_name,
      t.leader_name || t.captain_name,
      t.members
    );

    const scoreObj: Score = {
      id: `score-${t.id}`,
      team_id: t.id,
      round1_score: norm.round1_score,
      round2_score: norm.round2_score,
      round3_score: norm.round3_score,
      total_score: norm.total_score,
      screening_status: norm.screening_status,
      round1_status: norm.round1_status,
      overall_time: norm.overall_time,
      round2_details: norm.round2_details,
      round3_details: norm.round3_details,
      details: norm.details,
      updated_at: t.updated_at,
    };

    return {
      id: t.id,
      team_name: t.team_name,
      leader_name: t.leader_name || t.captain_name || (t.members?.[0]?.name ?? null),
      captain_name: t.captain_name || t.leader_name || (t.members?.[0]?.name ?? null),
      team_logo_url: t.team_logo_url,
      robot_image_url: t.robot_image_url,
      score: scoreObj,
      screening_status: norm.screening_status,
      round1_status: norm.round1_status,
      overall_time: norm.overall_time,
      round2_details: norm.round2_details,
      round3_details: norm.round3_details,
      details: norm.details,
      members: t.members,
      created_at: t.created_at,
      updated_at: t.updated_at,
    };
  });
}

/**
 * Convert internal InitialTeamSeed array to TeamWithDetails array for Admin Teams.
 */
export function formatTeamsWithDetails(teams: InitialTeamSeed[]): TeamWithDetails[] {
  return teams.map((t) => {
    const rawScore = {
      screening_status: t.screening_status,
      round1_status: t.round1_status,
      round1_score: t.round1_score,
      round2_details: t.round2,
      round3_details: t.round3,
    };
    const norm = normalizeScoreData(
      rawScore,
      t.team_name,
      t.leader_name || t.captain_name,
      t.members
    );

    const scoreObj: Score = {
      id: `score-${t.id}`,
      team_id: t.id,
      round1_score: norm.round1_score,
      round2_score: norm.round2_score,
      round3_score: norm.round3_score,
      total_score: norm.total_score,
      screening_status: norm.screening_status,
      round1_status: norm.round1_status,
      overall_time: norm.overall_time,
      round2_details: norm.round2_details,
      round3_details: norm.round3_details,
      details: norm.details,
      updated_at: t.updated_at,
    };

    const membersWithIds: TeamMember[] = (t.members || []).map((m, idx) => ({
      id: `mem-${t.id}-${idx}`,
      team_id: t.id,
      name: m.name,
      branch: m.branch,
      year: m.year,
      created_at: t.created_at,
    }));

    return {
      id: t.id,
      team_name: t.team_name,
      team_logo_url: t.team_logo_url || null,
      robot_image_url: t.robot_image_url || null,
      created_at: t.created_at,
      updated_at: t.updated_at,
      members: membersWithIds,
      score: scoreObj,
      leader_name: t.leader_name || t.captain_name || (t.members?.[0]?.name ?? null),
      captain_name: t.captain_name || t.leader_name || (t.members?.[0]?.name ?? null),
    };
  });
}
