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

-- 4. SEED INITIAL DATA FOR GALLERY PHOTOS
INSERT INTO event_gallery_images (id, title, caption, category, image_url, photographer, tag, featured, display_order)
VALUES
  ('img-1', 'Arena Scrutiny & Bot Inspection', 'Technical scrutineers verifying bot weight and dimension compliance before the qualifying rounds.', 'Scrutiny & Inspection', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', 'IEEE Media Wing', 'SCRUTINY', true, 1),
  ('img-2', 'Combat Arena Track Traversal', 'High-torque custom crawler navigating the elevation ramps and neon obstacles in Sector 02.', 'Arena Battles', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', 'Cyberpunk Lens', 'ARENA ROUND 1', true, 2),
  ('img-3', 'Hardware Pit Crew Fine-Tuning', 'Engineers flashing updated motor PID firmware during the 10-minute pit stop intermission.', 'Workshops & Garage', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', 'IEEE STB Media', 'PIT CREW', false, 3),
  ('img-4', 'Championship Trophy & Cash Bounty Reveal', 'The official RoboVerse ''26 trophy and ₹12,000 cash pool unveiled at Central Command.', 'Awards & Podium', 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1200&q=80', 'Central Dispatch', 'BOUNTY', true, 4),
  ('img-5', 'Organizing Committee Briefing', 'Student coordinators synchronizing scoring telemetry gates across all 4 competition sectors.', 'Crew Moments', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80', 'Event Comms', 'DISPATCH SQUAD', false, 5),
  ('img-6', 'Guest Keynote & Robotic Demo', 'Faculty counselor and industry mentors observing automated wireless bot demonstrations.', 'VIP & Guests', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', 'IEEE STB', 'KEYNOTE', false, 6)
ON CONFLICT (id) DO NOTHING;
