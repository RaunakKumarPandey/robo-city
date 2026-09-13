-- ==============================================================================
-- ROBO CITY — RoboVerse'26 Master Database Schema & Functions
-- Organizer: IEEE Student Branch, MMMUT Gorakhpur
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SEQUENCE: registration_number_seq (RBV-0001, RBV-0002, ...)
CREATE SEQUENCE IF NOT EXISTS registration_number_seq START WITH 1;

-- 3. TABLE: teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL UNIQUE,
  team_logo_url TEXT,
  robot_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABLE: team_members (3-5 members per team officially)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  branch TEXT,
  year TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABLE: scores (1-to-1 with teams, non-negative scores, PostgreSQL computed total)
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  round1_score NUMERIC NOT NULL DEFAULT 0 CHECK (round1_score >= 0),
  round2_score NUMERIC NOT NULL DEFAULT 0 CHECK (round2_score >= 0),
  round3_score NUMERIC NOT NULL DEFAULT 0 CHECK (round3_score >= 0),
  total_score NUMERIC GENERATED ALWAYS AS (round1_score + round2_score + round3_score) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TABLE: workshops
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

-- 7. TABLE: announcements (Robo Radio ticker feed)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('live', 'update', 'alert')),
  message TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. TABLE: admin_users (Authorized competition administrators)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. TABLE: registrations (Web and Google Form registrations)
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT NOT NULL UNIQUE DEFAULT ('RBV-' || lpad(nextval('registration_number_seq')::text, 4, '0')),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  captain_name TEXT NOT NULL,
  captain_email TEXT NOT NULL,
  captain_phone TEXT NOT NULL,
  college_name TEXT,
  course TEXT,
  branch TEXT,
  year TEXT,
  responder_email TEXT,
  declared_team_size INT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'google_form', 'manual')),
  external_response_id TEXT,
  synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'failed', 'needs_review')),
  sync_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. TABLE: registration_members (3 to 5 crew members per registration)
CREATE TABLE IF NOT EXISTS registration_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  branch TEXT,
  year TEXT,
  role TEXT DEFAULT 'Member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. TABLE: robots (One primary robot record per team)
CREATE TABLE IF NOT EXISTS robots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  robot_name TEXT NOT NULL,
  robot_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR HIGH PERFORMANCE (400+ Concurrent Leaderboard Viewers)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_scores_team_id ON scores(team_id);
CREATE INDEX IF NOT EXISTS idx_scores_total_score ON scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published_created_at ON announcements(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workshops_published ON workshops(published);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_team_id ON registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_registrations_source ON registrations(source);
CREATE INDEX IF NOT EXISTS idx_registrations_sync_status ON registrations(sync_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_source_external_id ON registrations(source, external_response_id) WHERE external_response_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_registration_members_registration_id ON registration_members(registration_id);
CREATE INDEX IF NOT EXISTS idx_robots_team_id ON robots(team_id);

-- ==============================================================================
-- REALTIME REPLICATION (For Live Leaderboard & Live Signals)
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'scores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE scores;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'teams'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE teams;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Fallback if publication does not exist
  NULL;
END $$;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE robots ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Allow public read access for teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access for team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Allow public read access for scores" ON scores FOR SELECT USING (true);
CREATE POLICY "Allow public read access for robots" ON robots FOR SELECT USING (true);
CREATE POLICY "Allow public read access for published workshops" ON workshops FOR SELECT USING (published = true);
CREATE POLICY "Allow public read access for published announcements" ON announcements FOR SELECT USING (published = true);

-- Admin Management Policies
CREATE POLICY "Allow admins to manage teams" ON teams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admins to manage team_members" ON team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admins to manage scores" ON scores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admins to manage workshops" ON workshops FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admins to manage announcements" ON announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admins to view admin_users" ON admin_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to manage registrations" ON registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admins to manage registration_members" ON registration_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admins to manage robots" ON robots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- ATOMIC RPC FUNCTIONS (SECURITY DEFINER)
-- ==============================================================================

-- 1. Create Team with Members (Admin)
CREATE OR REPLACE FUNCTION create_team_with_members(
  p_team_name TEXT,
  p_team_logo_url TEXT DEFAULT NULL,
  p_robot_image_url TEXT DEFAULT NULL,
  p_members JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_team_id UUID;
  v_member JSONB;
  v_member_count INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an authorized administrator';
  END IF;

  IF p_team_name IS NULL OR trim(p_team_name) = '' THEN
    RAISE EXCEPTION 'Team name is required';
  END IF;

  v_member_count := jsonb_array_length(p_members);
  IF v_member_count < 3 OR v_member_count > 5 THEN
    RAISE EXCEPTION 'A team must consist of 3 to 5 members (found %)', v_member_count;
  END IF;

  INSERT INTO teams (team_name, team_logo_url, robot_image_url)
  VALUES (trim(p_team_name), p_team_logo_url, p_robot_image_url)
  RETURNING id INTO v_team_id;

  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
    IF v_member->>'name' IS NULL OR trim(v_member->>'name') = '' THEN
      RAISE EXCEPTION 'Member name is required for all crew members';
    END IF;

    INSERT INTO team_members (team_id, name, branch, year)
    VALUES (v_team_id, trim(v_member->>'name'), v_member->>'branch', v_member->>'year');
  END LOOP;

  INSERT INTO scores (team_id, round1_score, round2_score, round3_score)
  VALUES (v_team_id, 0, 0, 0);

  RETURN jsonb_build_object('success', true, 'team_id', v_team_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Team with Members (Admin)
CREATE OR REPLACE FUNCTION update_team_with_members(
  p_team_id UUID,
  p_team_name TEXT,
  p_team_logo_url TEXT DEFAULT NULL,
  p_robot_image_url TEXT DEFAULT NULL,
  p_members JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_member JSONB;
  v_member_count INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an authorized administrator';
  END IF;

  v_member_count := jsonb_array_length(p_members);
  IF v_member_count < 3 OR v_member_count > 5 THEN
    RAISE EXCEPTION 'A team must consist of 3 to 5 members (found %)', v_member_count;
  END IF;

  UPDATE teams
  SET team_name = trim(p_team_name), team_logo_url = p_team_logo_url, robot_image_url = p_robot_image_url, updated_at = now()
  WHERE id = p_team_id;

  DELETE FROM team_members WHERE team_id = p_team_id;

  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
    IF v_member->>'name' IS NULL OR trim(v_member->>'name') = '' THEN
      RAISE EXCEPTION 'Member name is required for all crew members';
    END IF;

    INSERT INTO team_members (team_id, name, branch, year)
    VALUES (p_team_id, trim(v_member->>'name'), v_member->>'branch', v_member->>'year');
  END LOOP;

  RETURN jsonb_build_object('success', true, 'team_id', p_team_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Team Scores (Admin)
CREATE OR REPLACE FUNCTION update_team_scores(
  p_team_id UUID,
  p_round1 NUMERIC,
  p_round2 NUMERIC,
  p_round3 NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_score_id UUID;
  v_total NUMERIC;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an authorized administrator';
  END IF;

  IF p_round1 < 0 OR p_round2 < 0 OR p_round3 < 0 THEN
    RAISE EXCEPTION 'Scores must be non-negative values';
  END IF;

  INSERT INTO scores (team_id, round1_score, round2_score, round3_score, updated_at)
  VALUES (p_team_id, p_round1, p_round2, p_round3, now())
  ON CONFLICT (team_id) DO UPDATE
  SET round1_score = p_round1, round2_score = p_round2, round3_score = p_round3, updated_at = now()
  RETURNING id, total_score INTO v_score_id, v_total;

  RETURN jsonb_build_object('success', true, 'score_id', v_score_id, 'team_id', p_team_id, 'total_score', v_total);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Submit Team Registration (Web)
CREATE OR REPLACE FUNCTION submit_team_registration(
  p_team_name TEXT,
  p_captain_name TEXT,
  p_captain_email TEXT,
  p_captain_phone TEXT,
  p_robot_name TEXT,
  p_robot_image_url TEXT DEFAULT NULL,
  p_members JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_team_id UUID;
  v_registration_id UUID;
  v_registration_number TEXT;
  v_member JSONB;
  v_member_count INT;
  v_trimmed_team TEXT;
BEGIN
  v_trimmed_team := trim(p_team_name);
  IF v_trimmed_team IS NULL OR v_trimmed_team = '' THEN
    RAISE EXCEPTION 'TEAM NAME IS REQUIRED';
  END IF;

  IF EXISTS (SELECT 1 FROM teams WHERE lower(team_name) = lower(v_trimmed_team)) THEN
    RAISE EXCEPTION 'THIS CREW ALREADY EXISTS';
  END IF;

  v_member_count := jsonb_array_length(p_members);
  IF v_member_count < 3 OR v_member_count > 5 THEN
    RAISE EXCEPTION 'CREW MUST CONTAIN 3 TO 5 MEMBERS (Found %)', v_member_count;
  END IF;

  INSERT INTO teams (team_name, team_logo_url, robot_image_url)
  VALUES (v_trimmed_team, NULL, p_robot_image_url)
  RETURNING id INTO v_team_id;

  INSERT INTO scores (team_id, round1_score, round2_score, round3_score)
  VALUES (v_team_id, 0, 0, 0)
  ON CONFLICT (team_id) DO NOTHING;

  IF p_robot_name IS NOT NULL AND trim(p_robot_name) <> '' THEN
    INSERT INTO robots (team_id, robot_name, robot_image_url)
    VALUES (v_team_id, trim(p_robot_name), p_robot_image_url);
  END IF;

  INSERT INTO registrations (team_id, captain_name, captain_email, captain_phone, status, source)
  VALUES (v_team_id, trim(p_captain_name), trim(p_captain_email), trim(p_captain_phone), 'pending', 'web')
  RETURNING id, registration_number INTO v_registration_id, v_registration_number;

  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
    INSERT INTO registration_members (registration_id, name, email, phone, branch, year, role)
    VALUES (v_registration_id, trim(v_member->>'name'), trim(v_member->>'email'), v_member->>'phone', v_member->>'branch', v_member->>'year', COALESCE(v_member->>'role', 'Member'));

    INSERT INTO team_members (team_id, name, branch, year)
    VALUES (v_team_id, trim(v_member->>'name'), v_member->>'branch', v_member->>'year');
  END LOOP;

  RETURN jsonb_build_object('success', true, 'registration_id', v_registration_id, 'registration_number', v_registration_number, 'team_id', v_team_id, 'status', 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Sync Google Form Registration (Webhook)
CREATE OR REPLACE FUNCTION sync_google_form_registration(
  p_external_response_id TEXT,
  p_team_name TEXT,
  p_captain_name TEXT,
  p_captain_email TEXT,
  p_captain_phone TEXT DEFAULT NULL,
  p_college_name TEXT DEFAULT NULL,
  p_course TEXT DEFAULT NULL,
  p_branch TEXT DEFAULT NULL,
  p_year TEXT DEFAULT NULL,
  p_responder_email TEXT DEFAULT NULL,
  p_declared_team_size INT DEFAULT NULL,
  p_robot_name TEXT DEFAULT NULL,
  p_robot_image_url TEXT DEFAULT NULL,
  p_members JSONB DEFAULT '[]'::JSONB,
  p_submitted_at TIMESTAMPTZ DEFAULT now()
)
RETURNS JSONB AS $$
DECLARE
  v_team_id UUID;
  v_registration_id UUID;
  v_registration_number TEXT;
  v_member JSONB;
  v_member_count INT;
  v_trimmed_team TEXT;
  v_existing_id UUID;
  v_existing_num TEXT;
  v_is_duplicate_team BOOLEAN := false;
  v_sync_status TEXT := 'synced';
  v_sync_error TEXT := NULL;
  v_actual_members_count INT := 0;
BEGIN
  IF p_external_response_id IS NOT NULL AND p_external_response_id <> '' THEN
    SELECT id, registration_number INTO v_existing_id, v_existing_num
    FROM registrations
    WHERE source = 'google_form' AND external_response_id = p_external_response_id
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', true,
        'duplicate', true,
        'registration_id', v_existing_id,
        'registration_number', v_existing_num,
        'message', 'Registration already synchronized (Idempotent replay)'
      );
    END IF;
  END IF;

  v_trimmed_team := COALESCE(NULLIF(trim(p_team_name), ''), 'Unnamed Crew');

  IF EXISTS (SELECT 1 FROM teams WHERE lower(team_name) = lower(v_trimmed_team)) THEN
    v_is_duplicate_team := true;
    v_sync_status := 'needs_review';
    v_sync_error := 'Team name already exists in database. Pending admin review.';
  END IF;

  v_member_count := jsonb_array_length(p_members);
  IF v_member_count < 3 OR v_member_count > 5 THEN
    v_sync_status := 'needs_review';
    v_sync_error := COALESCE(v_sync_error || '; ', '') || 'Declared/Parsed members: ' || v_member_count || ' (Rule requires 3–5 members)';
  END IF;

  IF NOT v_is_duplicate_team THEN
    INSERT INTO teams (team_name, team_logo_url, robot_image_url)
    VALUES (v_trimmed_team, NULL, p_robot_image_url)
    RETURNING id INTO v_team_id;

    INSERT INTO scores (team_id, round1_score, round2_score, round3_score)
    VALUES (v_team_id, 0, 0, 0)
    ON CONFLICT (team_id) DO NOTHING;

    IF p_robot_name IS NOT NULL AND trim(p_robot_name) <> '' THEN
      INSERT INTO robots (team_id, robot_name, robot_image_url)
      VALUES (v_team_id, trim(p_robot_name), p_robot_image_url)
      ON CONFLICT (team_id) DO UPDATE 
        SET robot_name = EXCLUDED.robot_name,
            robot_image_url = EXCLUDED.robot_image_url;
    END IF;
  END IF;

  INSERT INTO registrations (
    team_id,
    captain_name,
    captain_email,
    captain_phone,
    college_name,
    course,
    branch,
    year,
    responder_email,
    declared_team_size,
    status,
    source,
    external_response_id,
    synced_at,
    sync_status,
    sync_error,
    created_at
  )
  VALUES (
    v_team_id,
    COALESCE(NULLIF(trim(p_captain_name), ''), 'Team Leader'),
    COALESCE(NULLIF(trim(p_captain_email), ''), COALESCE(p_responder_email, 'unknown@domain.com')),
    COALESCE(NULLIF(trim(p_captain_phone), ''), 'N/A'),
    p_college_name,
    p_course,
    p_branch,
    p_year,
    p_responder_email,
    p_declared_team_size,
    'pending',
    'google_form',
    p_external_response_id,
    now(),
    v_sync_status,
    v_sync_error,
    COALESCE(p_submitted_at, now())
  )
  RETURNING id, registration_number INTO v_registration_id, v_registration_number;

  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
    IF v_member->>'name' IS NOT NULL AND trim(v_member->>'name') <> '' THEN
      v_actual_members_count := v_actual_members_count + 1;

      INSERT INTO registration_members (
        registration_id,
        name,
        email,
        phone,
        branch,
        year,
        role
      )
      VALUES (
        v_registration_id,
        trim(v_member->>'name'),
        COALESCE(NULLIF(trim(v_member->>'email'), ''), 'N/A'),
        v_member->>'phone',
        COALESCE(v_member->>'branch', p_branch),
        COALESCE(v_member->>'year', p_year),
        COALESCE(v_member->>'role', 'Member')
      );

      IF v_team_id IS NOT NULL THEN
        INSERT INTO team_members (
          team_id,
          name,
          branch,
          year
        )
        VALUES (
          v_team_id,
          trim(v_member->>'name'),
          COALESCE(v_member->>'branch', p_branch),
          COALESCE(v_member->>'year', p_year)
        );
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'duplicate', false,
    'registration_id', v_registration_id,
    'registration_number', v_registration_number,
    'team_id', v_team_id,
    'status', 'pending',
    'sync_status', v_sync_status,
    'sync_error', v_sync_error,
    'members_synced', v_actual_members_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION sync_google_form_registration TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION submit_team_registration TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_team_with_members TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_team_scores TO authenticated;

-- Enable Realtime Broadcast for Live Leaderboard & Scores
ALTER PUBLICATION supabase_realtime ADD TABLE scores;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;

