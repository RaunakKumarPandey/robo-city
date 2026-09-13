-- ==============================================================================
-- ROBO CITY — RoboVerse'26 Google Form Integration Schema & RPC
-- Database: PostgreSQL (Supabase)
-- Target Sheet: "ROBOVERSE'26 (Responses)"
-- ==============================================================================

-- 1. Add Integration & Form Metadata to registrations table
ALTER TABLE registrations 
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'google_form', 'manual')),
  ADD COLUMN IF NOT EXISTS external_response_id TEXT,
  ADD COLUMN IF NOT EXISTS college_name TEXT,
  ADD COLUMN IF NOT EXISTS course TEXT,
  ADD COLUMN IF NOT EXISTS branch TEXT,
  ADD COLUMN IF NOT EXISTS year TEXT,
  ADD COLUMN IF NOT EXISTS responder_email TEXT,
  ADD COLUMN IF NOT EXISTS declared_team_size INT,
  ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'failed', 'needs_review')),
  ADD COLUMN IF NOT EXISTS sync_error TEXT;

-- 2. Unique Replay Protection Index (source + external_response_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_source_external_id 
  ON registrations(source, external_response_id) 
  WHERE external_response_id IS NOT NULL;

-- 3. Indexes for fast query and admin review filtering
CREATE INDEX IF NOT EXISTS idx_registrations_source ON registrations(source);
CREATE INDEX IF NOT EXISTS idx_registrations_sync_status ON registrations(sync_status);
CREATE INDEX IF NOT EXISTS idx_registrations_college_name ON registrations(college_name);

-- ==============================================================================
-- ATOMIC GOOGLE FORM REGISTRATION RPC (SECURITY DEFINER)
-- ==============================================================================
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
  -- 1. Idempotency / Replay Protection Check
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

  -- 2. Clean and validate team name
  v_trimmed_team := COALESCE(NULLIF(trim(p_team_name), ''), 'Unnamed Crew');

  -- 3. Check for duplicate team name in database
  IF EXISTS (SELECT 1 FROM teams WHERE lower(team_name) = lower(v_trimmed_team)) THEN
    v_is_duplicate_team := true;
    v_sync_status := 'needs_review';
    v_sync_error := 'Team name already exists in database. Pending admin review.';
  END IF;

  -- 4. Calculate member count and check against 3-5 event rule
  v_member_count := jsonb_array_length(p_members);
  IF v_member_count < 3 OR v_member_count > 5 THEN
    v_sync_status := 'needs_review';
    v_sync_error := COALESCE(v_sync_error || '; ', '') || 'Declared/Parsed members: ' || v_member_count || ' (Rule requires 3–5 members)';
  END IF;

  -- 5. Create Team entry (only if unique)
  IF NOT v_is_duplicate_team THEN
    INSERT INTO teams (team_name, team_logo_url, robot_image_url)
    VALUES (v_trimmed_team, NULL, p_robot_image_url)
    RETURNING id INTO v_team_id;

    -- Initialize standard competition score record
    INSERT INTO scores (team_id, round1_score, round2_score, round3_score)
    VALUES (v_team_id, 0, 0, 0)
    ON CONFLICT (team_id) DO NOTHING;

    -- Only create robot record if a robot name was actually provided
    IF p_robot_name IS NOT NULL AND trim(p_robot_name) <> '' THEN
      INSERT INTO robots (team_id, robot_name, robot_image_url)
      VALUES (v_team_id, trim(p_robot_name), p_robot_image_url)
      ON CONFLICT (team_id) DO UPDATE 
        SET robot_name = EXCLUDED.robot_name,
            robot_image_url = EXCLUDED.robot_image_url;
    END IF;
  END IF;

  -- 6. Insert registration record with full metadata
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

  -- 7. Insert crew members into registration_members & team_members
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

      -- team_members record (only if team was created)
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

  -- 8. Return comprehensive sync status
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

