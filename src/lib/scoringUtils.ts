import {
  Round2Details,
  StageDetails,
  Round3Details,
  ScoreDetails,
  Score,
} from "@/types/database";
import { getDefaultScreeningStatus } from "@/data/qualifiedTeamsSeed";

export const DEFAULT_ROUND2_TOTAL_TIME = 720; // 12 minutes (720 seconds)
export const DEFAULT_ROUND2_PENALTY_RATE = 1; // 1 point per hand touch
export const DEFAULT_ROUND2_MAX_VIVA = 10; // Viva out of 10
export const DEFAULT_ROUND2_MAX_MARKS = 720;
export const DEFAULT_STAGE_MAX_MARKS = 50;
export const DEFAULT_STAGE_PENALTY_RATE = 5;

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

export function createDefaultRound2(): Round2Details {
  return {
    completion_time: "00:00",
    total_time: DEFAULT_ROUND2_TOTAL_TIME,
    time_taken_seconds: 0,
    time_score: 0,
    viva_marks: 0,
    hand_touches: 0,
    penalty_rate: DEFAULT_ROUND2_PENALTY_RATE,
    penalty_total: 0,
    total_marks: 0,
    max_marks: DEFAULT_ROUND2_TOTAL_TIME,
    gain_marks: 0,
    penalty_count: 0,
  };
}

export function createDefaultStage(stageNumber: number): StageDetails {
  return {
    stage_number: stageNumber,
    stage_name: `Stage ${stageNumber}`,
    completion_time: "00:00",
    max_marks: DEFAULT_STAGE_MAX_MARKS,
    gain_marks: 0,
    penalty_rate: DEFAULT_STAGE_PENALTY_RATE,
    penalty_count: 0,
    penalty_total: 0,
    total_marks: 0,
  };
}

export function createDefaultRound3(): Round3Details {
  const stages = [
    createDefaultStage(1),
    createDefaultStage(2),
    createDefaultStage(3),
  ];
  return {
    stages,
    total_marks: 0,
  };
}

export function createDefaultScoreDetails(): ScoreDetails {
  return {
    screening_status: "not_qualified",
    round1_status: "pending",
    round2: createDefaultRound2(),
    round3: createDefaultRound3(),
    overall_time: "00:00",
  };
}

/**
 * Calculates Round 2 Total Marks based on the formula:
 * S = (720 - T) - H + V
 * Where:
 * T = Time taken to complete the track in seconds
 * H = Number of hand touches (penalty of 1 point per hand touch)
 * V = Viva marks obtained (out of 10)
 * Base time = 720 seconds (12 mins)
 */
export function calculateRound2(details?: Partial<Round2Details> | null): Round2Details {
  const completion_time = details?.completion_time || "00:00";
  const total_time = Math.max(0, Number(details?.total_time ?? DEFAULT_ROUND2_TOTAL_TIME));
  const time_taken_seconds = parseTimeToSeconds(completion_time);

  // Time score = (total_time - T) if a valid completion time > 0 was recorded
  const time_score = time_taken_seconds > 0 ? Math.max(0, total_time - time_taken_seconds) : 0;

  // Viva marks (V) out of 10
  const viva_marks = Math.max(0, Number(details?.viva_marks ?? 0));

  // Hand touches (H) and penalty rate (1 pt deduction per hand touch)
  const hand_touches = Math.max(0, Number(details?.hand_touches ?? details?.penalty_count ?? 0));
  const penalty_rate = Math.max(0, Number(details?.penalty_rate ?? DEFAULT_ROUND2_PENALTY_RATE));
  const penalty_total = hand_touches * penalty_rate;

  // Total Marks: S = (total_time - T) - H + V (>= 0)
  let total_marks = 0;
  if (time_taken_seconds > 0) {
    total_marks = Math.max(0, time_score - penalty_total + viva_marks);
  } else if (viva_marks > 0 || penalty_total > 0) {
    total_marks = Math.max(0, viva_marks - penalty_total);
  } else if (details?.gain_marks && !details?.viva_marks && !time_taken_seconds) {
    // Fallback for legacy score representations
    total_marks = Math.max(0, Number(details.gain_marks) - penalty_total);
  }

  return {
    completion_time,
    total_time,
    time_taken_seconds,
    time_score,
    viva_marks,
    hand_touches,
    penalty_rate,
    penalty_total,
    total_marks,
    max_marks: total_time,
    gain_marks: time_score + viva_marks,
    penalty_count: hand_touches,
  };
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
