import {
  Round2Details,
  StageDetails,
  Round3Details,
  ScoreDetails,
  Score,
} from "@/types/database";
import { getDefaultScreeningStatus } from "@/data/qualifiedTeamsSeed";

export const DEFAULT_ROUND2_SKIP_PENALTY_COST = 50; // 50 seconds per skip
export const DEFAULT_ROUND2_TOUCH_PENALTY_COST = 10; // 10 seconds per touch
export const DEFAULT_ROUND2_MAX_VIVA = 60; // Max viva marks: 60
export const DEFAULT_ROUND2_TOTAL_TIME = 720; // 12 minutes (720 seconds - legacy fallback)
export const DEFAULT_ROUND2_PENALTY_RATE = 1;
export const DEFAULT_ROUND2_MAX_MARKS = 60;
export const DEFAULT_STAGE_MAX_MARKS = 50;
export const DEFAULT_STAGE_PENALTY_RATE = 5;

/**
 * Format total seconds into human-readable representation:
 * e.g. 210 -> "210 sec (3 min 30 sec)"
 */
export function formatSecondsToReadable(totalSeconds: number): string {
  if (!totalSeconds && totalSeconds !== 0) return "0 sec (0 min 0 sec)";
  const isNegative = totalSeconds < 0;
  const abs = Math.abs(totalSeconds);
  const minutes = Math.floor(abs / 60);
  const seconds = Math.round((abs % 60) * 10) / 10;

  if (isNegative) {
    return `${totalSeconds} sec (-${minutes} min ${seconds} sec)`;
  }
  return `${totalSeconds} sec (${minutes} min ${seconds} sec)`;
}

/**
 * Parse time string (e.g. "02:35", "2:35", "155s", "155", "01:20:15") into total seconds.
 */
export function parseTimeToSeconds(timeStr?: string | null): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().replace(/s$/i, "");
  if (!clean) return 0;

  if (clean.includes(":")) {
    const parts = clean.split(":").map((p) => parseFloat(p) || 0);
    if (parts.length === 2) {
      return Math.round(parts[0] * 60 + parts[1]);
    }
    if (parts.length === 3) {
      return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
    }
  }

  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.round(num);
}

/**
 * Format seconds into standard "MM:SS" or "HH:MM:SS"
 */
export function formatSecondsToTime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Calculate total completion time (Sum of Round 2 and Round 3 Stage 1, Stage 2, Stage 3)
 */
export function calculateOverallCompletionTime(
  r2Time?: string | null,
  stages?: StageDetails[] | null
): string {
  const r2Seconds = parseTimeToSeconds(r2Time);
  const r3Seconds = (stages || []).reduce(
    (sum, st) => sum + parseTimeToSeconds(st.completion_time),
    0
  );
  const totalSeconds = r2Seconds + r3Seconds;
  return formatSecondsToTime(totalSeconds);
}

export function createDefaultRound2(
  skipCost: number = DEFAULT_ROUND2_SKIP_PENALTY_COST,
  touchCost: number = DEFAULT_ROUND2_TOUCH_PENALTY_COST
): Round2Details {
  return {
    completion_time: "0s",
    completion_time_minutes: 0,
    completion_time_seconds: 0,
    viva_marks: 0,
    skip_penalties: 0,
    touch_penalties: 0,
    skip_penalty_cost: skipCost,
    touch_penalty_cost: touchCost,
    total_penalty_time: 0,
    overall_time_seconds: 0,
    overall_time_formatted: "0 sec (0 min 0 sec)",
    total_marks: 0,
    total_time: 720,
    time_taken_seconds: 0,
    time_score: 0,
    hand_touches: 0,
    penalty_rate: touchCost,
    penalty_total: 0,
    max_marks: DEFAULT_ROUND2_MAX_VIVA,
    gain_marks: 0,
    penalty_count: 0,
  };
}

export function createDefaultRound3(): Round3Details {
  return {
    stages: [1, 2, 3].map((num) => ({
      stage_number: num,
      stage_name: `Stage ${num}`,
      completion_time: "00:00",
      max_marks: DEFAULT_STAGE_MAX_MARKS,
      gain_marks: 0,
      penalty_rate: DEFAULT_STAGE_PENALTY_RATE,
      penalty_count: 0,
      penalty_total: 0,
      total_marks: 0,
    })),
    total_marks: 0,
  };
}

/**
 * Calculates Round 2 – Arena Evaluation based on the official formula:
 * Overall Time (seconds) = Completion Time (minutes) * 60
 *                        + (Number of Skip Penalties * Skip Penalty Cost)
 *                        + (Number of Touch Penalties * Touch Penalty Cost)
 *                        - Viva Marks
 *
 * Parameters:
 * - Viva Marks: 0 to 60 (each viva mark reduces overall time by 1 second)
 * - Completion Time: Entered in minutes (converted into seconds)
 * - Skip Penalties: Non-negative whole number (default cost: 50s/skip)
 * - Touch Penalties: Non-negative whole number (default cost: 10s/touch)
 */
export function calculateRound2Arena(
  details?: Partial<Round2Details> | null,
  activeConfig?: { skip_penalty_cost?: number; touch_penalty_cost?: number }
): Round2Details {
  // 1. Completion time: support decimal minutes and conversion to seconds
  let completion_time_minutes = 0;
  let completion_time_seconds = 0;

  if (
    details?.completion_time_minutes !== undefined &&
    details?.completion_time_minutes !== null &&
    !isNaN(Number(details.completion_time_minutes))
  ) {
    completion_time_minutes = Math.max(0, Number(details.completion_time_minutes));
    completion_time_seconds = Math.round(completion_time_minutes * 60 * 100) / 100;
  } else if (
    details?.completion_time_seconds !== undefined &&
    details?.completion_time_seconds !== null &&
    !isNaN(Number(details.completion_time_seconds))
  ) {
    completion_time_seconds = Math.max(0, Number(details.completion_time_seconds));
    completion_time_minutes = Math.round((completion_time_seconds / 60) * 1000) / 1000;
  } else if (details?.completion_time) {
    const timeStr = String(details.completion_time).trim();
    if (timeStr.includes(":")) {
      completion_time_seconds = parseTimeToSeconds(timeStr);
      completion_time_minutes = Math.round((completion_time_seconds / 60) * 1000) / 1000;
    } else {
      const clean = timeStr.replace(/s$/i, "");
      const num = parseFloat(clean);
      if (!isNaN(num)) {
        if (num <= 60 && clean.includes(".")) {
          // Entered as decimal minutes
          completion_time_minutes = Math.max(0, num);
          completion_time_seconds = Math.round(num * 60 * 100) / 100;
        } else {
          completion_time_seconds = Math.max(0, num);
          completion_time_minutes = Math.round((num / 60) * 1000) / 1000;
        }
      }
    }
  }

  // 2. Viva Marks: 0 to 60 (Validate max 60)
  const viva_marks = Math.min(
    DEFAULT_ROUND2_MAX_VIVA,
    Math.max(0, Number(details?.viva_marks ?? 0))
  );

  // 3. Skip Penalties: Non-negative whole number
  const skip_penalties = Math.max(0, Math.floor(Number(details?.skip_penalties ?? 0)));

  // 4. Touch Penalties: Non-negative whole number
  const touch_penalties = Math.max(
    0,
    Math.floor(
      Number(
        details?.touch_penalties ??
          details?.hand_touches ??
          details?.penalty_count ??
          0
      )
    )
  );

  // 5. Configurable penalty costs (default 50s/skip, 10s/touch)
  const skip_penalty_cost = Math.max(
    0,
    Number(
      details?.skip_penalty_cost ??
        activeConfig?.skip_penalty_cost ??
        DEFAULT_ROUND2_SKIP_PENALTY_COST
    )
  );
  const touch_penalty_cost = Math.max(
    0,
    Number(
      details?.touch_penalty_cost ??
        activeConfig?.touch_penalty_cost ??
        DEFAULT_ROUND2_TOUCH_PENALTY_COST
    )
  );

  // 6. Total Penalty Time = (Skips * Skip Cost) + (Touches * Touch Cost)
  const total_penalty_time =
    skip_penalties * skip_penalty_cost + touch_penalties * touch_penalty_cost;

  // 7. Overall Time = (Completion Time in Seconds) + Total Penalty Time - Viva Marks
  const overall_time_seconds =
    completion_time_seconds + total_penalty_time - viva_marks;
  const overall_time_formatted = formatSecondsToReadable(overall_time_seconds);

  const displayTime = `${completion_time_seconds}s`;

  return {
    completion_time: displayTime,
    completion_time_minutes,
    completion_time_seconds,
    viva_marks,
    skip_penalties,
    touch_penalties,
    skip_penalty_cost,
    touch_penalty_cost,
    total_penalty_time,
    overall_time_seconds,
    overall_time_formatted,
    total_marks: overall_time_seconds,
    total_time: 720,
    time_taken_seconds: completion_time_seconds,
    time_score: completion_time_seconds,
    hand_touches: touch_penalties,
    penalty_rate: touch_penalty_cost,
    penalty_total: total_penalty_time,
    max_marks: DEFAULT_ROUND2_MAX_VIVA,
    gain_marks: viva_marks,
    penalty_count: skip_penalties + touch_penalties,
  };
}

/**
 * Standard Round 2 evaluator. Uses Round 2 Arena formula when applicable.
 */
export function calculateRound2(
  details?: Partial<Round2Details> | null,
  activeConfig?: { skip_penalty_cost?: number; touch_penalty_cost?: number }
): Round2Details {
  return calculateRound2Arena(details, activeConfig);
}

/**
 * Tie-breaker comparator for Round 2 – Arena Leaderboard:
 * 1. Evaluated teams (with recorded completion time or viva or penalties) precede unevaluated teams
 * 2. Lowest Overall Time in seconds (ascending: lowest time ranks #1)
 * 3. Higher Viva Marks (descending: higher viva ranks first)
 * 4. Lower Actual Completion Time in seconds (ascending: lower time ranks first)
 * 5. Stable tie-break by team name (A-Z), then ID
 */
export function compareRound2ArenaTeams(
  a: {
    overall_time_seconds?: number | null;
    viva_marks?: number | null;
    completion_time_seconds?: number | null;
    skip_penalties?: number | null;
    touch_penalties?: number | null;
    team_name?: string | null;
    id?: string | null;
  },
  b: {
    overall_time_seconds?: number | null;
    viva_marks?: number | null;
    completion_time_seconds?: number | null;
    skip_penalties?: number | null;
    touch_penalties?: number | null;
    team_name?: string | null;
    id?: string | null;
  }
): number {
  const isAEvaluated =
    (a.completion_time_seconds !== undefined && a.completion_time_seconds !== null && a.completion_time_seconds > 0) ||
    (a.viva_marks !== undefined && a.viva_marks !== null && a.viva_marks > 0) ||
    (a.skip_penalties !== undefined && a.skip_penalties !== null && a.skip_penalties > 0) ||
    (a.touch_penalties !== undefined && a.touch_penalties !== null && a.touch_penalties > 0);

  const isBEvaluated =
    (b.completion_time_seconds !== undefined && b.completion_time_seconds !== null && b.completion_time_seconds > 0) ||
    (b.viva_marks !== undefined && b.viva_marks !== null && b.viva_marks > 0) ||
    (b.skip_penalties !== undefined && b.skip_penalties !== null && b.skip_penalties > 0) ||
    (b.touch_penalties !== undefined && b.touch_penalties !== null && b.touch_penalties > 0);

  // Evaluated teams appear before unevaluated teams
  if (isAEvaluated && !isBEvaluated) return -1;
  if (!isAEvaluated && isBEvaluated) return 1;

  const aTime = a.overall_time_seconds ?? 999999;
  const bTime = b.overall_time_seconds ?? 999999;

  // 1. Lowest Overall Time first (ascending)
  if (aTime !== bTime) {
    return aTime - bTime;
  }

  // 2. Higher Viva Marks first (descending)
  const aViva = a.viva_marks ?? 0;
  const bViva = b.viva_marks ?? 0;
  if (bViva !== aViva) {
    return bViva - aViva;
  }

  // 3. Lower Actual Completion Time first (ascending)
  const aComp = a.completion_time_seconds ?? 999999;
  const bComp = b.completion_time_seconds ?? 999999;
  if (aComp !== bComp) {
    return aComp - bComp;
  }

  // 4. Stable tie-break by team name, then ID
  const nameCompare = (a.team_name || "").localeCompare(b.team_name || "");
  if (nameCompare !== 0) return nameCompare;
  return (a.id || "").localeCompare(b.id || "");
}

/**
 * Calculates Stage Total Marks for Round 3 based on the formula:
 * penalty_total = penalty_count * penalty_rate
 * total_marks = max(0, gain_marks - penalty_total)
 */
export function calculateStage(stage?: Partial<StageDetails> | null, stageNumber: number = 1): StageDetails {
  const completion_time = stage?.completion_time || "00:00";
  const max_marks = Math.max(0, Number(stage?.max_marks ?? DEFAULT_STAGE_MAX_MARKS));
  const gain_marks = Math.max(0, Number(stage?.gain_marks ?? 0));
  const penalty_rate = Math.max(0, Number(stage?.penalty_rate ?? DEFAULT_STAGE_PENALTY_RATE));
  const penalty_count = Math.max(0, Number(stage?.penalty_count ?? 0));

  const penalty_total = penalty_count * penalty_rate;
  const total_marks = Math.max(0, gain_marks - penalty_total);

  return {
    stage_number: stageNumber,
    stage_name: stage?.stage_name || `Stage ${stageNumber}`,
    completion_time,
    max_marks,
    gain_marks,
    penalty_rate,
    penalty_count,
    penalty_total,
    total_marks,
  };
}

/**
 * Calculates Round 3 Total (Sum of all 3 stages)
 */
export function calculateRound3(stagesInput?: Partial<StageDetails>[] | null): Round3Details {
  const stages: StageDetails[] = [1, 2, 3].map((num) => {
    const existing = stagesInput?.find((s) => s.stage_number === num) || stagesInput?.[num - 1];
    return calculateStage(existing, num);
  });

  const total_marks = stages.reduce((sum, s) => sum + s.total_marks, 0);

  return {
    stages,
    total_marks,
  };
}

/**
 * Normalizes raw score object from database or JSON into standardized scoring structures.
 * If screening_status is not explicitly set in database/details, matches against the PDF qualified list.
 */
export function normalizeScoreData(
  rawScore: any,
  teamName?: string | null,
  leaderName?: string | null,
  members?: { name?: string | null }[] | null
): {
  screening_status: "qualified" | "not_qualified";
  round1_status: "qualified" | "not_qualified" | "pending";
  round1_score: number;
  round2_score: number;
  round3_score: number;
  total_score: number;
  overall_time: string;
  round2_details: Round2Details;
  round3_details: Round3Details;
  details: ScoreDetails;
} {
  const details = rawScore?.details || {};

  // If explicitly overridden by admin (flagged via admin_manually_set), respect it.
  // Otherwise, determine screening status by matching against the PDF qualified schedule.
  let screening_status: "qualified" | "not_qualified";

  if (details?.admin_manually_set === true && (rawScore?.screening_status || details?.screening_status)) {
    screening_status = (rawScore?.screening_status || details?.screening_status) as "qualified" | "not_qualified";
  } else {
    screening_status = getDefaultScreeningStatus(teamName, leaderName, members);
  }

  const round1_status: "qualified" | "not_qualified" | "pending" =
    rawScore?.round1_status || details?.round1_status || "pending";

  const r2Raw = rawScore?.round2_details || details?.round2;
  const r2 = calculateRound2(
    r2Raw && typeof r2Raw === "object"
      ? r2Raw
      : {
          gain_marks: Number(rawScore?.round2_score ?? 0),
          max_marks: DEFAULT_ROUND2_MAX_MARKS,
        }
  );

  const r3Raw = rawScore?.round3_details || details?.round3;
  const stagesRaw = Array.isArray(r3Raw?.stages)
    ? r3Raw.stages
    : Array.isArray(r3Raw)
    ? r3Raw
    : null;

  const r3 = calculateRound3(
    stagesRaw || [
      { gain_marks: Number(rawScore?.round3_score ?? 0), max_marks: DEFAULT_STAGE_MAX_MARKS },
      { gain_marks: 0, max_marks: DEFAULT_STAGE_MAX_MARKS },
      { gain_marks: 0, max_marks: DEFAULT_STAGE_MAX_MARKS },
    ]
  );

  const round1_score = Number(rawScore?.round1_score ?? 0);
  const round2_score = r2.total_marks;
  const round3_score = r3.total_marks;

  // Total tournament score is Round 2 + Round 3 (0 if not qualified)
  const total_score =
    screening_status === "not_qualified" ? 0 : round2_score + round3_score;

  // Calculate overall completion time (R2 time + R3 stages time)
  const overall_time = calculateOverallCompletionTime(r2.completion_time, r3.stages);

  const fullDetails: ScoreDetails = {
    screening_status,
    round1_status,
    round2: r2,
    round3: r3,
    overall_time,
  };

  return {
    screening_status,
    round1_status,
    round1_score,
    round2_score,
    round3_score,
    total_score,
    overall_time,
    round2_details: r2,
    round3_details: r3,
    details: fullDetails,
  };
}
