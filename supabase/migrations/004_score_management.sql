-- ==============================================================================
-- ROBO CITY — RoboVerse'26 Secure Score Management Migration
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. Ensure RLS on scores table permits only verified admins to update scores
DROP POLICY IF EXISTS "Allow authenticated users to manage scores" ON scores;

CREATE POLICY "Allow verified admins to manage scores" ON scores
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- 2. Atomic Stored Procedure to Update Team Scores with Server-Side Validation
CREATE OR REPLACE FUNCTION update_team_scores(
  p_team_id UUID,
  p_round1 NUMERIC,
  p_round2 NUMERIC,
  p_round3 NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_score RECORD;
BEGIN
  -- Security Check: user must exist in admin_users
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an authorized administrator';
  END IF;

  -- Validate scores (must be non-negative)
  IF p_round1 < 0 OR p_round2 < 0 OR p_round3 < 0 THEN
    RAISE EXCEPTION 'Scores cannot be negative (R1: %, R2: %, R3: %)', p_round1, p_round2, p_round3;
  END IF;

  -- Upsert score record (handles existing or newly attached scores)
  INSERT INTO scores (team_id, round1_score, round2_score, round3_score, updated_at)
  VALUES (p_team_id, p_round1, p_round2, p_round3, now())
  ON CONFLICT (team_id) DO UPDATE
  SET
    round1_score = EXCLUDED.round1_score,
    round2_score = EXCLUDED.round2_score,
    round3_score = EXCLUDED.round3_score,
    updated_at = now()
  RETURNING * INTO v_score;

  RETURN jsonb_build_object(
    'success', true,
    'score', row_to_json(v_score)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
