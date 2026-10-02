-- ==============================================================================
-- ROBO CITY — Migration 008: Allow Duplicate Team Names
-- Organizer: IEEE Student Branch, MMMUT Gorakhpur
-- Database: PostgreSQL (Supabase)
-- Description: Drops UNIQUE constraint on teams(team_name) and updates RPC
--              functions to allow multiple teams with identical names across the
--              competition, registration forms, Google Form integrations, and Leaderboard.
-- ==============================================================================

-- 1. Drop UNIQUE constraint on team_name column in teams table
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_team_name_key;
DROP INDEX IF EXISTS idx_teams_team_name_unique;

-- 2. Create non-unique index on team_name for fast lookups & sorting
CREATE INDEX IF NOT EXISTS idx_teams_team_name ON teams(team_name);

-- 3. Replace create_team_with_members (Admin) - allowing duplicate team names
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
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an authorized administrator';
  END IF;

  IF p_team_name IS NULL OR trim(p_team_name) = '' THEN
    RAISE EXCEPTION 'Team name is required';
  END IF;

  INSERT INTO teams (team_name, team_logo_url, robot_image_url)
  VALUES (trim(p_team_name), p_team_logo_url, p_robot_image_url)
  RETURNING id INTO v_team_id;

  IF p_members IS NOT NULL AND jsonb_array_length(p_members) > 0 THEN
    FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
      IF v_member->>'name' IS NOT NULL AND trim(v_member->>'name') <> '' THEN
        INSERT INTO team_members (team_id, name, branch, year)
        VALUES (v_team_id, trim(v_member->>'name'), v_member->>'branch', v_member->>'year');
      END IF;
    END LOOP;
  END IF;

  INSERT INTO scores (team_id, round1_score, round2_score, round3_score)
  VALUES (v_team_id, 0, 0, 0);

  RETURN jsonb_build_object('success', true, 'team_id', v_team_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Replace update_team_with_members (Admin) - allowing duplicate team names
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
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an authorized administrator';
  END IF;

  UPDATE teams
  SET team_name = trim(p_team_name), team_logo_url = p_team_logo_url, robot_image_url = p_robot_image_url, updated_at = now()
  WHERE id = p_team_id;

  DELETE FROM team_members WHERE team_id = p_team_id;

  IF p_members IS NOT NULL AND jsonb_array_length(p_members) > 0 THEN
    FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
      IF v_member->>'name' IS NOT NULL AND trim(v_member->>'name') <> '' THEN
        INSERT INTO team_members (team_id, name, branch, year)
        VALUES (p_team_id, trim(v_member->>'name'), v_member->>'branch', v_member->>'year');
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object('success', true, 'team_id', p_team_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Replace submit_team_registration (Web) - allowing duplicate team names
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

  v_member_count := jsonb_array_length(p_members);
  IF v_member_count < 3 OR v_member_count > 5 THEN
    RAISE EXCEPTION 'CREW MUST CONTAIN 3 TO 5 MEMBERS (Found %)', v_member_count;
  END IF;

  -- Create new team entry (duplicate team names fully allowed)
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

-- 6. Replace sync_google_form_registration (Webhook) - allowing duplicate team names
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
  v_sync_status TEXT := 'synced';
  v_sync_error TEXT := NULL;
  v_actual_members_count INT := 0;
BEGIN
  -- 1. Idempotency check for the exact same Google Form response
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

  v_member_count := jsonb_array_length(p_members);
  IF v_member_count < 3 OR v_member_count > 5 THEN
    v_sync_status := 'needs_review';
    v_sync_error := COALESCE(v_sync_error || '; ', '') || 'Declared/Parsed members: ' || v_member_count || ' (Rule requires 3–5 members)';
  END IF;

  -- 2. Always create a dedicated team entry for this registration (duplicate names allowed)
  INSERT INTO teams (team_name, team_logo_url, robot_image_url)
  VALUES (v_trimmed_team, NULL, p_robot_image_url)
  RETURNING id INTO v_team_id;

  -- 3. Initialize standard competition score record
  INSERT INTO scores (team_id, round1_score, round2_score, round3_score)
  VALUES (v_team_id, 0, 0, 0)
  ON CONFLICT (team_id) DO NOTHING;

  -- 4. Create robot record if name provided
  IF p_robot_name IS NOT NULL AND trim(p_robot_name) <> '' THEN
    INSERT INTO robots (team_id, robot_name, robot_image_url)
    VALUES (v_team_id, trim(p_robot_name), p_robot_image_url)
    ON CONFLICT (team_id) DO UPDATE 
      SET robot_name = EXCLUDED.robot_name,
          robot_image_url = EXCLUDED.robot_image_url;
  END IF;

  -- 5. Insert registration record with full metadata
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

  -- 6. Insert crew members into registration_members & team_members
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
    IF v_member->>'name' IS NOT NULL AND trim(v_member->>'name') <> '' THEN
      v_actual_members_count := v_actual_members_count + 1;

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
        COALESCE(NULLIF(trim(v_member->>'email'), ''), 'N/A'),
        v_member->>'phone',
        COALESCE(v_member->>'branch', p_branch),
        COALESCE(v_member->>'year', p_year),
        COALESCE(v_member->>'role', 'Member')
      );

      -- team_members record
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

  -- 7. Return comprehensive sync status
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
GRANT EXECUTE ON FUNCTION create_team_with_members TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_team_with_members TO authenticated, service_role;

-- 7. Ensure public read access for registrations & registration members so captain names display across leaderboard & dashboards
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registrations' AND policyname = 'Allow public read access for registrations'
  ) THEN
    CREATE POLICY "Allow public read access for registrations" ON registrations FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registration_members' AND policyname = 'Allow public read access for registration_members'
  ) THEN
    CREATE POLICY "Allow public read access for registration_members" ON registration_members FOR SELECT USING (true);
  END IF;
END $$;

