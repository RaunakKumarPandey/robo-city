import { LeaderboardEntry } from "@/types/database";
import { normalizeScoreData } from "@/lib/scoringUtils";

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

export const initialTournamentTeams: InitialTeamSeed[] = [
  {
    id: "team-cyber-vipers",
    team_name: "CYBERVIPERS",
    leader_name: "Aryan Sharma",
    captain_name: "Aryan Sharma",
    team_logo_url: null,
    robot_image_url: null,
    members: [
      { name: "Aryan Sharma", branch: "CSE", year: "3rd Year" },
      { name: "Riya Singh", branch: "ECE", year: "3rd Year" },
      { name: "Amit Kumar", branch: "ME", year: "2nd Year" },
      { name: "Sneha Verma", branch: "IT", year: "2nd Year" },
    ],
    screening_status: "qualified",
    round1_status: "qualified",
    round1_score: 1,
    round2: {
      completion_time: "150s",
      completion_time_minutes: 2.5,
      completion_time_seconds: 150,
      viva_marks: 48,
      skip_penalties: 1,
      touch_penalties: 2,
      skip_penalty_cost: 50,
      touch_penalty_cost: 10,
      total_penalty_time: 70,
      overall_time_seconds: 172,
      overall_time_formatted: "172 sec (2 min 52 sec)",
      total_marks: 172,
    },
    round3: {
      stages: [
        { stage_number: 1, completion_time: "02:15", max_marks: 50, gain_marks: 48, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 2, completion_time: "02:40", max_marks: 50, gain_marks: 45, penalty_rate: 5, penalty_count: 1 },
        { stage_number: 3, completion_time: "03:00", max_marks: 50, gain_marks: 50, penalty_rate: 5, penalty_count: 1 },
      ],
    },
    created_at: "2026-10-01T10:00:00.000Z",
    updated_at: "2026-10-04T18:00:00.000Z",
  },
  {
    id: "team-iron-titans",
    team_name: "IRON TITANS",
    leader_name: "Priya Patel",
    captain_name: "Priya Patel",
    team_logo_url: null,
    robot_image_url: null,
    members: [
      { name: "Priya Patel", branch: "ECE", year: "3rd Year" },
      { name: "Vikash Gupta", branch: "EE", year: "3rd Year" },
      { name: "Neha Yadav", branch: "CSE", year: "2nd Year" },
    ],
    screening_status: "qualified",
    round1_status: "qualified",
    round1_score: 1,
    round2: {
      completion_time: "120s",
      completion_time_minutes: 2,
      completion_time_seconds: 120,
      viva_marks: 40,
      skip_penalties: 2,
      touch_penalties: 3,
      skip_penalty_cost: 50,
      touch_penalty_cost: 10,
      total_penalty_time: 130,
      overall_time_seconds: 210,
      overall_time_formatted: "210 sec (3 min 30 sec)",
      total_marks: 210,
    },
    round3: {
      stages: [
        { stage_number: 1, completion_time: "02:30", max_marks: 50, gain_marks: 44, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 2, completion_time: "02:50", max_marks: 50, gain_marks: 42, penalty_rate: 5, penalty_count: 1 },
        { stage_number: 3, completion_time: "03:15", max_marks: 50, gain_marks: 46, penalty_rate: 5, penalty_count: 0 },
      ],
    },
    created_at: "2026-10-01T11:00:00.000Z",
    updated_at: "2026-10-04T18:00:00.000Z",
  },
  {
    id: "team-mecha-wolves",
    team_name: "MECHAWOLVES",
    leader_name: "Rohan Verma",
    captain_name: "Rohan Verma",
    team_logo_url: null,
    robot_image_url: null,
    members: [
      { name: "Rohan Verma", branch: "ME", year: "4th Year" },
      { name: "Aditya Roy", branch: "CSE", year: "3rd Year" },
      { name: "Pooja Mishra", branch: "IT", year: "3rd Year" },
      { name: "Sandeep Nair", branch: "ECE", year: "2nd Year" },
    ],
    screening_status: "qualified",
    round1_status: "qualified",
    round1_score: 1,
    round2: {
      completion_time: "180s",
      completion_time_minutes: 3,
      completion_time_seconds: 180,
      viva_marks: 52,
      skip_penalties: 1,
      touch_penalties: 1,
      skip_penalty_cost: 50,
      touch_penalty_cost: 10,
      total_penalty_time: 60,
      overall_time_seconds: 188,
      overall_time_formatted: "188 sec (3 min 8 sec)",
      total_marks: 188,
    },
    round3: {
      stages: [
        { stage_number: 1, completion_time: "02:45", max_marks: 50, gain_marks: 40, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 2, completion_time: "03:05", max_marks: 50, gain_marks: 38, penalty_rate: 5, penalty_count: 1 },
        { stage_number: 3, completion_time: "03:30", max_marks: 50, gain_marks: 44, penalty_rate: 5, penalty_count: 0 },
      ],
    },
    created_at: "2026-10-01T12:00:00.000Z",
    updated_at: "2026-10-04T18:00:00.000Z",
  },
  {
    id: "team-neon-sparks",
    team_name: "NEON SPARKS",
    leader_name: "Ananya Gupta",
    captain_name: "Ananya Gupta",
    team_logo_url: null,
    robot_image_url: null,
    members: [
      { name: "Ananya Gupta", branch: "CSE", year: "2nd Year" },
      { name: "Harshit Shukla", branch: "ECE", year: "2nd Year" },
      { name: "Divya Soni", branch: "EE", year: "2nd Year" },
    ],
    screening_status: "qualified",
    round1_status: "qualified",
    round1_score: 1,
    round2: {
      completion_time: "200s",
      completion_time_minutes: 3.33,
      completion_time_seconds: 200,
      viva_marks: 38,
      skip_penalties: 2,
      touch_penalties: 2,
      skip_penalty_cost: 50,
      touch_penalty_cost: 10,
      total_penalty_time: 120,
      overall_time_seconds: 282,
      overall_time_formatted: "282 sec (4 min 42 sec)",
      total_marks: 282,
    },
    round3: {
      stages: [
        { stage_number: 1, completion_time: "03:00", max_marks: 50, gain_marks: 36, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 2, completion_time: "03:15", max_marks: 50, gain_marks: 35, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 3, completion_time: "03:40", max_marks: 50, gain_marks: 40, penalty_rate: 5, penalty_count: 1 },
      ],
    },
    created_at: "2026-10-01T13:00:00.000Z",
    updated_at: "2026-10-04T18:00:00.000Z",
  },
  {
    id: "team-quantum-gliders",
    team_name: "QUANTUM GLIDERS",
    leader_name: "Devansh Patel",
    captain_name: "Devansh Patel",
    team_logo_url: null,
    robot_image_url: null,
    members: [
      { name: "Devansh Patel", branch: "EE", year: "3rd Year" },
      { name: "Saurabh Tiwari", branch: "ME", year: "3rd Year" },
      { name: "Richa Pandey", branch: "IT", year: "2nd Year" },
    ],
    screening_status: "qualified",
    round1_status: "not_qualified",
    round1_score: 0,
    round2: {
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
      overall_time_formatted: "0 sec (0 min 0 sec)",
      total_marks: 0,
    },
    round3: {
      stages: [
        { stage_number: 1, completion_time: "00:00", max_marks: 50, gain_marks: 0, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 2, completion_time: "00:00", max_marks: 50, gain_marks: 0, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 3, completion_time: "00:00", max_marks: 50, gain_marks: 0, penalty_rate: 5, penalty_count: 0 },
      ],
    },
    created_at: "2026-10-01T14:00:00.000Z",
    updated_at: "2026-10-04T18:00:00.000Z",
  },
  {
    id: "team-shadow-rogues",
    team_name: "SHADOW ROGUES",
    leader_name: "Sneha Reddy",
    captain_name: "Sneha Reddy",
    team_logo_url: null,
    robot_image_url: null,
    members: [
      { name: "Sneha Reddy", branch: "ECE", year: "2nd Year" },
      { name: "Karan Joshi", branch: "ME", year: "2nd Year" },
      { name: "Aniket Rao", branch: "CSE", year: "1st Year" },
    ],
    screening_status: "not_qualified",
    round1_status: "pending",
    round1_score: 0,
    round2: {
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
      overall_time_formatted: "0 sec (0 min 0 sec)",
      total_marks: 0,
    },
    round3: {
      stages: [
        { stage_number: 1, completion_time: "00:00", max_marks: 50, gain_marks: 0, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 2, completion_time: "00:00", max_marks: 50, gain_marks: 0, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 3, completion_time: "00:00", max_marks: 50, gain_marks: 0, penalty_rate: 5, penalty_count: 0 },
      ],
    },
    created_at: "2026-10-01T15:00:00.000Z",
    updated_at: "2026-10-04T18:00:00.000Z",
  },
  {
    id: "team-hyperdrift",
    team_name: "HYPERDRIFT X",
    leader_name: "Vikram Joshi",
    captain_name: "Vikram Joshi",
    team_logo_url: null,
    robot_image_url: null,
    members: [
      { name: "Vikram Joshi", branch: "CSE", year: "3rd Year" },
      { name: "Tanmay Sen", branch: "IT", year: "3rd Year" },
      { name: "Ayush Srivastava", branch: "EE", year: "2nd Year" },
    ],
    screening_status: "not_qualified",
    round1_status: "pending",
    round1_score: 0,
    round2: {
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
      overall_time_formatted: "0 sec (0 min 0 sec)",
      total_marks: 0,
    },
    round3: {
      stages: [
        { stage_number: 1, completion_time: "00:00", max_marks: 50, gain_marks: 0, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 2, completion_time: "00:00", max_marks: 50, gain_marks: 0, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 3, completion_time: "00:00", max_marks: 50, gain_marks: 0, penalty_rate: 5, penalty_count: 0 },
      ],
    },
    created_at: "2026-10-01T16:00:00.000Z",
    updated_at: "2026-10-04T18:00:00.000Z",
  },
];

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
    const norm = normalizeScoreData(rawScore);

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

  qualified.sort((a, b) => {
    if (b.total_score !== a.total_score) return b.total_score - a.total_score;
    return a.team_name.localeCompare(b.team_name);
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
