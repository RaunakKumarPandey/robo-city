import { LeaderboardEntry } from "@/types/database";
import { normalizeScoreData, compareRound2ArenaTeams } from "@/lib/scoringUtils";
import { QUALIFIED_TEAMS_PDF } from "@/data/qualifiedTeamsSeed";

export interface InitialTeamSeed {
  id: string;
  team_name: string;
  leader_name: string;
  captain_name: string;
  team_logo_url?: string | null;
  robot_image_url?: string | null;
  members: { name: string; branch: string; year: string }[];
  screening_status: "qualified" | "not_qualified";
  round1_status: "qualified" | "not_qualified" | "pending";
  round1_score: number;
  round2: {
    completion_time: string;
    completion_time_minutes?: number;
    completion_time_seconds?: number;
    viva_marks: number;
    skip_penalties?: number;
    touch_penalties?: number;
    skip_penalty_cost?: number;
    touch_penalty_cost?: number;
    total_penalty_time?: number;
    overall_time_seconds?: number;
    overall_time_formatted?: string;
    total_time?: number;
    time_taken_seconds?: number;
    time_score?: number;
    hand_touches?: number;
    penalty_rate?: number;
    penalty_total?: number;
    total_marks?: number;
    max_marks?: number;
    gain_marks?: number;
    penalty_count?: number;
  };
  round3: {
    stages: {
      stage_number: number;
      completion_time: string;
      max_marks: number;
      gain_marks: number;
      penalty_rate: number;
      penalty_count: number;
    }[];
  };
  created_at: string;
  updated_at: string;
}

// Official saved scores verified from tournament round 2 arena runs
const KNOWN_SAVED_ROUND2_SCORES: Record<
  string,
  {
    completion_time: string;
    completion_time_seconds: number;
    viva_marks: number;
    skip_penalties: number;
    touch_penalties: number;
    total_penalty_time: number;
    overall_time_seconds: number;
    overall_time_formatted: string;
  }
> = {
  "mave-x": {
    completion_time: "246s",
    completion_time_seconds: 246,
    viva_marks: 36,
    skip_penalties: 0,
    touch_penalties: 1,
    total_penalty_time: 10,
    overall_time_seconds: 220,
    overall_time_formatted: "220 sec (3 min 40 sec)",
  },
  akagn: {
    completion_time: "270s",
    completion_time_seconds: 270,
    viva_marks: 40,
    skip_penalties: 0,
    touch_penalties: 0,
    total_penalty_time: 0,
    overall_time_seconds: 230,
    overall_time_formatted: "230 sec (3 min 50 sec)",
  },
  "cyber nova": {
    completion_time: "262.2s",
    completion_time_seconds: 262.2,
    viva_marks: 36,
    skip_penalties: 0,
    touch_penalties: 3,
    total_penalty_time: 30,
    overall_time_seconds: 256.2,
    overall_time_formatted: "256.2 sec",
  },
  "automation aurors": {
    completion_time: "300s",
    completion_time_seconds: 300,
    viva_marks: 36,
    skip_penalties: 0,
    touch_penalties: 5,
    total_penalty_time: 50,
    overall_time_seconds: 314,
    overall_time_formatted: "314 sec",
  },
  turbotronics: {
    completion_time: "312s",
    completion_time_seconds: 312,
    viva_marks: 28,
    skip_penalties: 0,
    touch_penalties: 4,
    total_penalty_time: 40,
    overall_time_seconds: 324,
    overall_time_formatted: "324 sec",
  },
};

// Clean string helper for deduplication
function cleanName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

const seenTeamNames = new Set<string>();

export const initialTournamentTeams: InitialTeamSeed[] = QUALIFIED_TEAMS_PDF.map((item, idx) => {
  const normName = cleanName(item.teamName);
  const isDuplicate = seenTeamNames.has(normName);
  seenTeamNames.add(normName);

  // Exact 107 qualified and 14 not qualified matching PDF screening status
  const screening_status: "qualified" | "not_qualified" = isDuplicate ? "not_qualified" : "qualified";
  const key = item.teamName.toLowerCase().trim();
  const savedR2 = KNOWN_SAVED_ROUND2_SCORES[key];

  const round2 = savedR2
    ? {
        completion_time: savedR2.completion_time,
        completion_time_minutes: Number((savedR2.completion_time_seconds / 60).toFixed(2)),
        completion_time_seconds: savedR2.completion_time_seconds,
        viva_marks: savedR2.viva_marks,
        skip_penalties: savedR2.skip_penalties,
        touch_penalties: savedR2.touch_penalties,
        skip_penalty_cost: 50,
        touch_penalty_cost: 10,
        total_penalty_time: savedR2.total_penalty_time,
        overall_time_seconds: savedR2.overall_time_seconds,
        overall_time_formatted: savedR2.overall_time_formatted,
        total_marks: savedR2.overall_time_seconds,
        total_time: 720,
        time_taken_seconds: savedR2.completion_time_seconds,
        time_score: savedR2.completion_time_seconds,
        hand_touches: savedR2.touch_penalties,
        penalty_rate: 10,
        penalty_total: savedR2.total_penalty_time,
        max_marks: 60,
        gain_marks: savedR2.overall_time_seconds,
        penalty_count: savedR2.touch_penalties,
      }
    : {
        completion_time: "0s",
        completion_time_minutes: 0,
        completion_time_seconds: 0,
        viva_marks: 0,
        skip_penalties: 0,
        touch_penalties: 0,
        skip_penalty_cost: 50,
        touch_penalty_cost: 10,
        total_penalty_time: 0,
        overall_time_seconds: 0,
        overall_time_formatted: "0s",
        total_time: 0,
      };

  return {
    id: `seed-team-${idx + 1}-${item.teamName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    team_name: item.teamName,
    leader_name: item.leaderName,
    captain_name: item.leaderName,
    team_logo_url: null,
    robot_image_url: null,
    members: [{ name: item.leaderName, branch: "Engineering", year: "2026" }],
    screening_status,
    round1_status: "qualified" as const,
    round1_score: 1,
    round2,
    round3: {
      stages: [],
    },
    created_at: "2026-10-01T00:00:00.000Z",
    updated_at: savedR2 ? new Date().toISOString() : "2026-10-01T00:00:00.000Z",
  };
});

/**
 * Converts initial seed data into ranked leaderboard entries.
 */
export function getInitialLeaderboardEntries(): LeaderboardEntry[] {
  const normalized = initialTournamentTeams.map((t) => {
    const rawScore = {
      screening_status: t.screening_status,
      round1_status: t.round1_status,
      round1_score: t.round1_score,
      round2_details: t.round2,
      round3_details: t.round3,
    };
    const norm = normalizeScoreData(rawScore, t.team_name, t.leader_name, t.members);

    return {
      id: t.id,
      team_name: t.team_name,
      leader_name: t.leader_name,
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
      members: t.members,
    };
  });

  const qualified = normalized.filter((t) => t.screening_status === "qualified");
  const notQualified = normalized.filter((t) => t.screening_status === "not_qualified");

  // Sort qualified teams by Round 2 Arena Overall Time ASC (lowest time ranks #1)
  qualified.sort((a, b) => {
    const aR2 = a.round2_details;
    const bR2 = b.round2_details;

    return compareRound2ArenaTeams(
      {
        overall_time_seconds: aR2?.overall_time_seconds ?? a.round2_score,
        viva_marks: aR2?.viva_marks ?? 0,
        completion_time_seconds: aR2?.completion_time_seconds ?? (aR2?.time_taken_seconds ?? 0),
        skip_penalties: aR2?.skip_penalties ?? 0,
        touch_penalties: aR2?.touch_penalties ?? aR2?.hand_touches ?? 0,
        team_name: a.team_name,
        id: a.id,
      },
      {
        overall_time_seconds: bR2?.overall_time_seconds ?? b.round2_score,
        viva_marks: bR2?.viva_marks ?? 0,
        completion_time_seconds: bR2?.completion_time_seconds ?? (bR2?.time_taken_seconds ?? 0),
        skip_penalties: bR2?.skip_penalties ?? 0,
        touch_penalties: bR2?.touch_penalties ?? bR2?.hand_touches ?? 0,
        team_name: b.team_name,
        id: b.id,
      }
    );
  });

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
