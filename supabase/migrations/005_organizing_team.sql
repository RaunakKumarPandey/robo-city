-- ==============================================================================
-- ROBO CITY — RoboVerse'26 Organizing Team Schema & Public Permissions
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. TABLE: organizing_team
CREATE TABLE IF NOT EXISTS organizing_team (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Core Squad',
  year TEXT DEFAULT 'Final Year',
  photo_url TEXT,
  phone TEXT,
  email TEXT,
  linkedin TEXT,
  instagram TEXT,
  github TEXT,
  bio TEXT,
  display_order INT DEFAULT 99,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Index for ordering and filtering
CREATE INDEX IF NOT EXISTS idx_organizing_team_order ON organizing_team(display_order);
CREATE INDEX IF NOT EXISTS idx_organizing_team_category ON organizing_team(category);

-- 3. Row Level Security (RLS)
ALTER TABLE organizing_team ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE (public visitors) to view the organizing team
DROP POLICY IF EXISTS "Allow public read on organizing_team" ON organizing_team;
CREATE POLICY "Allow public read on organizing_team" ON organizing_team
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow authenticated users & admins to insert/update/delete
DROP POLICY IF EXISTS "Allow write access on organizing_team" ON organizing_team;
CREATE POLICY "Allow write access on organizing_team" ON organizing_team
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Seed default team members if table is empty
INSERT INTO organizing_team (id, name, role, category, year, photo_url, email, phone, bio, display_order)
VALUES
  ('org-1', 'Dr. B. S. Rai', 'Branch Counselor & Patron', 'Faculty & Advisors', 'Faculty / Advisor', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'counselor@mmmut.ac.in', '+91 94152 44444', 'Guiding the technological vision and innovation standards for IEEE-SB MMMUT.', 1),
  ('org-2', 'Raunak Kumar Pandey', 'Festival Lead & Convener', 'Core Squad', 'Final Year', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80', 'raunak@ieee-mmmut.org', '+91 98765 43210', 'Directing festival execution, arena operations, and digital experience for RoboVerse ''26.', 2),
  ('org-3', 'Aryan Gupta', 'Technical Operations Head', 'Technical Leads', 'Final Year', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', 'aryan.tech@ieee-mmmut.org', '+91 98765 43211', 'Leading robot arena telemetry, sensor gates, and real-time leaderboard scoring engines.', 3),
  ('org-4', 'Sneha Mishra', 'Event & Arena Coordinator', 'Core Squad', '3rd Year', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', 'sneha.events@ieee-mmmut.org', '+91 98765 43212', 'Managing race track scheduling, squad briefs, and referee scoring protocols.', 4),
  ('org-5', 'Vikramaditya Singh', 'Robotics Hardware & Inspection', 'Technical Leads', '3rd Year', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', 'vikram.mech@ieee-mmmut.org', '+91 98765 43213', 'Chief scrutineer for bot dimensions, weight constraints, and safety failsafes.', 5),
  ('org-6', 'Ananya Verma', 'Logistics & Public Relations', 'Operations & Logistics', '2nd Year', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', 'ananya.pr@ieee-mmmut.org', '+91 98765 43214', 'Handling hospitality, registration clearances, participant outreach, and event comms.', 6)
ON CONFLICT (id) DO NOTHING;
