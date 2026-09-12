-- ==============================================================================
-- ROBO CITY — RoboVerse'26 Admin Authorization Migration
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. TABLE: admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Index on user_id for fast lookup
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- 3. Row Level Security (RLS) on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Authenticated users can only read their own record to verify admin status
CREATE POLICY "Allow authenticated users to check their own admin status" ON admin_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Security Definer Function for verified admin check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
