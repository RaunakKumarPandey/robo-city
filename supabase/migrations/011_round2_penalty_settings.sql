-- ==============================================================================
-- ROBO CITY — Round 2 Arena Penalty Settings Table
-- Migration: 011_round2_penalty_settings.sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS tournament_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default Round 2 penalty costs: 50s per skip, 10s per touch
INSERT INTO tournament_settings (key, value)
VALUES ('round2_penalty_costs', '{"skip_penalty_cost": 50, "touch_penalty_cost": 10}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS Policies
ALTER TABLE tournament_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for tournament_settings"
  ON tournament_settings FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage tournament_settings"
  ON tournament_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
