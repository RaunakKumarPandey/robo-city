-- ==============================================================================
-- ROBO CITY — RoboVerse'26 Registration System Schema & RPC
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. Registration Number Sequence (RBV-0001, RBV-0002, ...)
CREATE SEQUENCE IF NOT EXISTS registration_number_seq START WITH 1;

-- 2. TABLE: registrations
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT NOT NULL UNIQUE DEFAULT ('RBV-' || lpad(nextval('registration_number_seq')::text, 4, '0')),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  captain_name TEXT NOT NULL,
  captain_email TEXT NOT NULL,
  captain_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLE: registration_members (3 to 5 crew members per registration)
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

-- 4. TABLE: robots (One primary robot record per team)
CREATE TABLE IF NOT EXISTS robots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  robot_name TEXT NOT NULL,
  robot_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR FAST QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_team_id ON registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registration_members_registration_id ON registration_members(registration_id);
CREATE INDEX IF NOT EXISTS idx_robots_team_id ON robots(team_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE robots ENABLE ROW LEVEL SECURITY;

-- robots policies: Public can read robot profiles; admins can manage
CREATE POLICY "Allow public read access for robots" ON robots
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated admins to manage robots" ON robots
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- registrations policies: Admins can view/update/delete; anonymous users cannot select/modify
CREATE POLICY "Allow authenticated admins to manage registrations" ON registrations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- registration_members policies: Admins can view/update/delete; anonymous users cannot select/modify
CREATE POLICY "Allow authenticated admins to manage registration_members" ON registration_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- ATOMIC REGISTRATION TRANSACTION RPC (SECURITY DEFINER)
-- ==============================================================================
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
  -- 1. Validate team name
  v_trimmed_team := trim(p_team_name);
  IF v_trimmed_team IS NULL OR v_trimmed_team = '' THEN
    RAISE EXCEPTION 'TEAM NAME IS REQUIRED';
  END IF;

  -- 2. Check team uniqueness
  IF EXISTS (SELECT 1 FROM teams WHERE lower(team_name) = lower(v_trimmed_team)) THEN
    RAISE EXCEPTION 'THIS CREW ALREADY EXISTS';
  END IF;

  -- 3. Validate captain
  IF p_captain_name IS NULL OR trim(p_captain_name) = '' THEN
    RAISE EXCEPTION 'CAPTAIN NAME IS REQUIRED';
  END IF;
  IF p_captain_email IS NULL OR trim(p_captain_email) = '' THEN
    RAISE EXCEPTION 'CAPTAIN EMAIL IS REQUIRED';
  END IF;
  IF p_captain_phone IS NULL OR trim(p_captain_phone) = '' THEN
    RAISE EXCEPTION 'CAPTAIN PHONE IS REQUIRED';
  END IF;

  -- 4. Validate robot
  IF p_robot_name IS NULL OR trim(p_robot_name) = '' THEN
    RAISE EXCEPTION 'ROBOT NAME IS REQUIRED';
  END IF;

  -- 5. Validate member count (3 to 5)
  v_member_count := jsonb_array_length(p_members);
  IF v_member_count < 3 OR v_member_count > 5 THEN
    RAISE EXCEPTION 'CREW MUST CONTAIN 3 TO 5 MEMBERS (Found %)', v_member_count;
  END IF;

  -- 6. Insert into teams table
  INSERT INTO teams (team_name, team_logo_url, robot_image_url)
  VALUES (v_trimmed_team, NULL, p_robot_image_url)
  RETURNING id INTO v_team_id;

  -- 7. Insert initial zero scores record
  INSERT INTO scores (team_id, round1_score, round2_score, round3_score)
  VALUES (v_team_id, 0, 0, 0)
  ON CONFLICT (team_id) DO NOTHING;

  -- 8. Insert into robots table
  INSERT INTO robots (team_id, robot_name, robot_image_url)
  VALUES (v_team_id, trim(p_robot_name), p_robot_image_url);

  -- 9. Insert into registrations table (auto-generates registration_number)
  INSERT INTO registrations (
    team_id,
    captain_name,
    captain_email,
    captain_phone,
    status
  )
  VALUES (
    v_team_id,
    trim(p_captain_name),
    trim(p_captain_email),
    trim(p_captain_phone),
    'pending'
  )
  RETURNING id, registration_number INTO v_registration_id, v_registration_number;

  -- 10. Insert all crew members into registration_members & team_members
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
    IF v_member->>'name' IS NULL OR trim(v_member->>'name') = '' THEN
      RAISE EXCEPTION 'Member name is required for all crew members';
    END IF;
    IF v_member->>'email' IS NULL OR trim(v_member->>'email') = '' THEN
      RAISE EXCEPTION 'Member email is required for all crew members';
    END IF;

    -- registration_members record
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
      trim(v_member->>'email'),
      v_member->>'phone',
      v_member->>'branch',
      v_member->>'year',
      COALESCE(v_member->>'role', 'Member')
    );

    -- team_members record
    INSERT INTO team_members (
      team_id,
      name,
      branch,
      year
    )
    VALUES (
      v_team_id,
      trim(v_member->>'name'),
      v_member->>'branch',
      v_member->>'year'
    );
  END LOOP;

  -- 11. Return atomic success response
  RETURN jsonb_build_object(
    'success', true,
    'registration_id', v_registration_id,
    'registration_number', v_registration_number,
    'team_id', v_team_id,
    'status', 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION submit_team_registration TO anon, authenticated, service_role;

