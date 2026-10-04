-- ==============================================================================
-- ROBO CITY — Multi-Round Scoring & Screening Status Columns
-- Migration: 009_multi_round_scoring_schema.sql
-- ==============================================================================

-- 1. Add screening status, viva status, and detailed arena JSON structures to scores table
ALTER TABLE scores 
  ADD COLUMN IF NOT EXISTS screening_status TEXT DEFAULT 'qualified' CHECK (screening_status IN ('qualified', 'not_qualified')),
  ADD COLUMN IF NOT EXISTS round1_status TEXT DEFAULT 'pending' CHECK (round1_status IN ('qualified', 'not_qualified', 'pending')),
  ADD COLUMN IF NOT EXISTS round2_details JSONB DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS round3_details JSONB DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::JSONB;

-- 2. Update default values for existing rows
UPDATE scores 
SET 
  screening_status = COALESCE(screening_status, 'qualified'),
  round1_status = COALESCE(round1_status, 'pending'),
  round2_details = COALESCE(round2_details, '{}'::JSONB),
  round3_details = COALESCE(round3_details, '{}'::JSONB),
  details = COALESCE(details, '{}'::JSONB)
WHERE screening_status IS NULL;

-- 3. Create index for fast leaderboard filtering
CREATE INDEX IF NOT EXISTS idx_scores_screening_status ON scores(screening_status);
CREATE INDEX IF NOT EXISTS idx_scores_round1_status ON scores(round1_status);
