-- ==============================================================================
-- ROBO CITY — RoboVerse'26 Event Posters & Gallery Schema & Permissions
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. TABLE: event_posters (Official Posters)
CREATE TABLE IF NOT EXISTS event_posters (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT,
  image_url TEXT NOT NULL,
  download_url TEXT,
  category TEXT DEFAULT 'Official Festival Poster',
  release_date TEXT DEFAULT 'OCTOBER 2026',
  featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 99,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_posters_order ON event_posters(display_order);

ALTER TABLE event_posters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on event_posters" ON event_posters;
CREATE POLICY "Allow public read on event_posters" ON event_posters
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow write access on event_posters" ON event_posters;
CREATE POLICY "Allow write access on event_posters" ON event_posters
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 2. TABLE: event_gallery_images (Event Moments & Photos)
CREATE TABLE IF NOT EXISTS event_gallery_images (
  id TEXT PRIMARY KEY,
  title TEXT,
  caption TEXT,
  category TEXT NOT NULL DEFAULT 'Arena Battles',
  image_url TEXT NOT NULL,
  photographer TEXT,
  tag TEXT,
  featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 99,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_gallery_order ON event_gallery_images(display_order);
CREATE INDEX IF NOT EXISTS idx_event_gallery_cat ON event_gallery_images(category);

ALTER TABLE event_gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on event_gallery_images" ON event_gallery_images;
CREATE POLICY "Allow public read on event_gallery_images" ON event_gallery_images
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow write access on event_gallery_images" ON event_gallery_images;
CREATE POLICY "Allow write access on event_gallery_images" ON event_gallery_images
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3. SEED INITIAL DATA FOR OFFICIAL POSTERS
INSERT INTO event_posters (id, title, tagline, image_url, download_url, category, release_date, featured, display_order)
VALUES
  ('poster-1', 'ROBOVERSE ''26 // OFFICIAL FESTIVAL POSTER', 'The City Never Sleeps. Neither Do The Bots.', '/images/backgrounds/bg_home.jpg', '/images/backgrounds/bg_home.jpg', 'Official Festival Poster', 'OCTOBER 2026', true, 1),
  ('poster-2', 'GRAND PRIX ARENA // ₹12,000 BOUNTY BATTLE', 'High-Octane Traversal & Combat Obstacle Course', '/images/backgrounds/bg_missions.jpg', '/images/backgrounds/bg_missions.jpg', 'Arena Championship', 'OCTOBER 2026', true, 2),
  ('poster-3', 'THE GARAGE // ROBOTICS HARDWARE WORKSHOP', 'Motor Drivers, Microcontrollers & Telemetry Engineering', '/images/backgrounds/bg_garage.jpg', '/images/backgrounds/bg_garage.jpg', 'Hands-on Workshop', 'OCTOBER 2026', false, 3)
ON CONFLICT (id) DO NOTHING;

-- 4. CLEANUP LEGACY MOCK PHOTOS (ONLY ADMIN UPLOADED PHOTOS PRESERVED)
DELETE FROM event_gallery_images WHERE image_url LIKE '%unsplash.com%' OR id IN ('img-1', 'img-2', 'img-3', 'img-4', 'img-5', 'img-6');
