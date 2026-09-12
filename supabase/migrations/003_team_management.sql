-- ==============================================================================
-- ROBO CITY — RoboVerse'26 Team Management & Atomic RPC Functions
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. Atomic Team Creation with 3-5 Members and Initial Score Record (0, 0, 0)
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
  -- Security Check: user must exist in admin_users
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an authorized administrator';
  END IF;

  -- Validate team name
  IF p_team_name IS NULL OR trim(p_team_name) = '' THEN
    RAISE EXCEPTION 'Team name is required';
  END IF;

  -- Validate member count: 3 to 5 members officially
  v_member_count := jsonb_array_length(p_members);
  IF v_member_count < 3 OR v_member_count > 5 THEN
    RAISE EXCEPTION 'A team must consist of 3 to 5 members (found %)', v_member_count;
  END IF;

  -- Insert into teams
  INSERT INTO teams (team_name, team_logo_url, robot_image_url)
  VALUES (trim(p_team_name), p_team_logo_url, p_robot_image_url)
  RETURNING id INTO v_team_id;

  -- Insert all crew members
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
    IF v_member->>'name' IS NULL OR trim(v_member->>'name') = '' THEN
      RAISE EXCEPTION 'Member name is required for all crew members';
    END IF;

    INSERT INTO team_members (team_id, name, branch, year)
    VALUES (
      v_team_id,
      trim(v_member->>'name'),
      v_member->>'branch',
      v_member->>'year'
    );
  END LOOP;

  -- Insert initial zero-score record (computed total will be 0)
  INSERT INTO scores (team_id, round1_score, round2_score, round3_score)
  VALUES (v_team_id, 0, 0, 0);

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Atomic Team Update with Members
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
  -- Security Check: user must exist in admin_users
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an authorized administrator';
  END IF;

  -- Validate member count: 3 to 5 members
  v_member_count := jsonb_array_length(p_members);
  IF v_member_count < 3 OR v_member_count > 5 THEN
    RAISE EXCEPTION 'A team must consist of 3 to 5 members (found %)', v_member_count;
  END IF;

  -- Update teams record
  UPDATE teams
  SET
    team_name = trim(p_team_name),
    team_logo_url = p_team_logo_url,
    robot_image_url = p_robot_image_url,
    updated_at = now()
  WHERE id = p_team_id;

  -- Replace crew members
  DELETE FROM team_members WHERE team_id = p_team_id;

  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
    IF v_member->>'name' IS NULL OR trim(v_member->>'name') = '' THEN
      RAISE EXCEPTION 'Member name is required for all crew members';
    END IF;

    INSERT INTO team_members (team_id, name, branch, year)
    VALUES (
      p_team_id,
      trim(v_member->>'name'),
      v_member->>'branch',
      v_member->>'year'
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', p_team_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
