-- ==============================================================================
-- ROBO CITY — RoboVerse'26 Database Schema
-- Organizer: IEEE Student Branch, MMMUT Gorakhpur
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLE: teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL UNIQUE,
  team_logo_url TEXT,
  robot_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLE: team_members (3-5 members per team officially)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  branch TEXT,
  year TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABLE: scores (1-to-1 with teams, non-negative scores, computed total)
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  round1_score NUMERIC NOT NULL DEFAULT 0 CHECK (round1_score >= 0),
  round2_score NUMERIC NOT NULL DEFAULT 0 CHECK (round2_score >= 0),
  round3_score NUMERIC NOT NULL DEFAULT 0 CHECK (round3_score >= 0),
  total_score NUMERIC GENERATED ALWAYS AS (round1_score + round2_score + round3_score) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABLE: workshops
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  instructor TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TABLE: announcements (Robo Radio ticker feed)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('live', 'update', 'alert')),
  message TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR HIGH PERFORMANCE (400+ Concurrent Viewers)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_scores_team_id ON scores(team_id);
CREATE INDEX IF NOT EXISTS idx_scores_total_score ON scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published_created_at ON announcements(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workshops_published ON workshops(published);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ ACCESS POLICIES
CREATE POLICY "Allow public read access for teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access for team_members" ON team_members
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access for scores" ON scores
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access for published workshops" ON workshops
  FOR SELECT USING (published = true);

CREATE POLICY "Allow public read access for published announcements" ON announcements
  FOR SELECT USING (published = true);

-- AUTHENTICATED ADMIN ACCESS POLICIES (No insecure public write allowed)
CREATE POLICY "Allow authenticated users to manage teams" ON teams
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage team_members" ON team_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage scores" ON scores
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage workshops" ON workshops
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage announcements" ON announcements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
