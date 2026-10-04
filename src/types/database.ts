export interface Team {
  id: string;
  team_name: string;
  team_logo_url?: string | null;
  robot_image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id?: string;
  team_id?: string;
  name: string;
  branch?: string | null;
  year?: string | null;
  created_at?: string;
}

export interface Round2Details {
  completion_time: string;
  max_marks: number;
  gain_marks: number;
  penalty_rate: number;
  penalty_count: number;
  penalty_total: number;
  total_marks: number;
}

export interface StageDetails {
  stage_number: number;
  stage_name?: string;
  completion_time: string;
  max_marks: number;
  gain_marks: number;
  penalty_rate: number;
  penalty_count: number;
  penalty_total: number;
  total_marks: number;
}

export interface Round3Details {
  stages: StageDetails[];
  total_marks: number;
}

export interface ScoreDetails {
  screening_status: "qualified" | "not_qualified";
  round1_status: "qualified" | "not_qualified" | "pending";
  round2: Round2Details;
  round3: Round3Details;
  overall_time?: string;
}

export interface Score {
  id: string;
  team_id: string;
  round1_score: number;
  round2_score: number;
  round3_score: number;
  total_score: number;
  screening_status?: "qualified" | "not_qualified" | null;
  round1_status?: "qualified" | "not_qualified" | "pending" | null;
  round2_details?: Round2Details | null;
  round3_details?: Round3Details | null;
  details?: ScoreDetails | null;
  overall_time?: string | null;
  updated_at: string;
}

export interface TeamWithDetails extends Team {
  members: TeamMember[];
  score?: Score | null;
  leader_name?: string | null;
  captain_name?: string | null;
}

export interface Workshop {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  topics: string[];
  instructor: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  type: "live" | "update" | "alert";
  message: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  team_name: string;
  leader_name?: string | null;
  team_logo_url?: string | null;
  robot_image_url?: string | null;
  screening_status: "qualified" | "not_qualified";
  round1_status: "qualified" | "not_qualified" | "pending";
  round1_score: number;
  round2_score: number;
  round3_score: number;
  total_score: number;
  overall_time?: string;
  round2_details?: Round2Details | null;
  round3_details?: Round3Details | null;
  details?: ScoreDetails | null;
  rank: number;
  updated_at?: string;
  members?: TeamMember[];
}

export interface Registration {
  id: string;
  registration_number: string;
  team_id?: string | null;
  captain_name: string;
  captain_email: string;
  captain_phone: string;
  college_name?: string | null;
  course?: string | null;
  branch?: string | null;
  year?: string | null;
  responder_email?: string | null;
  declared_team_size?: number | null;
  status: "pending" | "approved" | "rejected";
  source?: "web" | "google_form" | "manual";
  external_response_id?: string | null;
  synced_at?: string | null;
  sync_status?: "synced" | "failed" | "needs_review" | null;
  sync_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoogleFormPayload {
  source: string;
  response_id: string;
  submitted_at?: string;
  team: {
    team_name: string;
    captain_name: string;
    captain_email: string;
    captain_phone?: string;
    college_name?: string;
    course?: string;
    branch?: string;
    year?: string;
    responder_email?: string;
    declared_team_size?: number;
  };
  members: {
    name: string;
    email?: string;
    phone?: string;
    branch?: string;
    year?: string;
    role?: string;
  }[];
  robot?: {
    robot_name?: string;
    robot_image_url?: string | null;
  };
}

export interface RegistrationMember {
  id?: string;
  registration_id?: string;
  name: string;
  email: string;
  phone?: string | null;
  branch?: string | null;
  year?: string | null;
  role?: string | null;
  created_at?: string;
}

export interface Robot {
  id: string;
  team_id: string;
  robot_name: string;
  robot_image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationSubmission {
  teamName: string;
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  robotName: string;
  robotImageUrl?: string | null;
  members: {
    name: string;
    email: string;
    phone?: string;
    branch?: string;
    year?: string;
    role?: string;
  }[];
}

export interface RegistrationResult {
  success: boolean;
  registrationNumber?: string;
  registrationId?: string;
  teamId?: string;
  status?: string;
  error?: string;
}

export interface OrganizingMember {
  id: string;
  name: string;
  role: string;
  category: "Faculty & Advisors" | "Core Squad" | "Technical Leads" | "Operations & Logistics";
  year?: "Final Year" | "3rd Year" | "2nd Year" | "1st Year" | "Faculty / Advisor" | "Alumni" | string | null;
  photo_url?: string | null;
  phone?: string | null;
  email?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  github?: string | null;
  bio?: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventPoster {
  id: string;
  title: string;
  tagline?: string | null;
  image_url: string;
  download_url?: string | null;
  category?: string | null;
  release_date?: string | null;
  featured?: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventGalleryImage {
  id: string;
  title?: string | null;
  caption?: string | null;
  category: "Arena Battles" | "Workshops & Garage" | "Awards & Podium" | "Crew Moments" | "VIP & Guests" | "Scrutiny & Inspection" | string;
  image_url: string;
  photographer?: string | null;
  tag?: string | null;
  featured?: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

