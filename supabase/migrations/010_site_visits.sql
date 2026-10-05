-- ==============================================================================
-- ROBO CITY — Site Analytics / Visitor Counter Table & Functions
-- Migration: 010_site_visits.sql
-- ==============================================================================

-- 1. Create table for global site statistics
CREATE TABLE IF NOT EXISTS site_stats (
  id TEXT PRIMARY KEY,
  total_visits BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Insert initial row if it does not exist
INSERT INTO site_stats (id, total_visits)
VALUES ('global_visits', 100)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Anyone (anon + authenticated) can read stats
DROP POLICY IF EXISTS "Public can view site stats" ON site_stats;
CREATE POLICY "Public can view site stats"
  ON site_stats FOR SELECT
  TO public, anon, authenticated
  USING (true);

-- 5. RLS Policy: Allow update & insert
DROP POLICY IF EXISTS "Allow public update site stats" ON site_stats;
CREATE POLICY "Allow public update site stats"
  ON site_stats FOR UPDATE
  TO public, anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert site stats" ON site_stats;
CREATE POLICY "Allow public insert site stats"
  ON site_stats FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

-- 6. Atomic Increment Function
CREATE OR REPLACE FUNCTION increment_site_visits()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count BIGINT;
BEGIN
  INSERT INTO site_stats (id, total_visits, updated_at)
  VALUES ('global_visits', 1, now())
  ON CONFLICT (id)
  DO UPDATE SET
    total_visits = site_stats.total_visits + 1,
    updated_at = now()
  RETURNING total_visits INTO new_count;
  
  RETURN new_count;
END;
$$;

-- 7. Read Count Function
CREATE OR REPLACE FUNCTION get_site_visits()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count BIGINT;
BEGIN
  SELECT total_visits INTO current_count FROM site_stats WHERE id = 'global_visits';
  RETURN COALESCE(current_count, 0);
END;
$$;

-- 8. Grant execution permissions
GRANT EXECUTE ON FUNCTION increment_site_visits() TO public, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_site_visits() TO public, anon, authenticated, service_role;
