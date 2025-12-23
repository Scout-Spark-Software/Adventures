-- Migration: Convert user ID columns from UUID to TEXT to support WorkOS user IDs
-- WorkOS uses user IDs in format: user_01KD4K44WQM21SA8VSW59RT4WG (not UUIDs)

-- Drop existing data first (since we're migrating auth providers)
TRUNCATE TABLE user_roles CASCADE;
TRUNCATE TABLE notes CASCADE;
TRUNCATE TABLE favorites CASCADE;
TRUNCATE TABLE hikes CASCADE;
TRUNCATE TABLE camping_sites CASCADE;
TRUNCATE TABLE files CASCADE;
TRUNCATE TABLE alterations CASCADE;
TRUNCATE TABLE moderation_queue CASCADE;

-- Convert user_roles.user_id from UUID to TEXT
ALTER TABLE user_roles ALTER COLUMN user_id TYPE TEXT;

-- Convert notes.user_id from UUID to TEXT
ALTER TABLE notes ALTER COLUMN user_id TYPE TEXT;

-- Convert favorites.user_id from UUID to TEXT
ALTER TABLE favorites ALTER COLUMN user_id TYPE TEXT;

-- Convert hikes.created_by from UUID to TEXT
ALTER TABLE hikes ALTER COLUMN created_by TYPE TEXT;

-- Convert camping_sites.created_by from UUID to TEXT
ALTER TABLE camping_sites ALTER COLUMN created_by TYPE TEXT;

-- Convert files.uploaded_by from UUID to TEXT
ALTER TABLE files ALTER COLUMN uploaded_by TYPE TEXT;

-- Convert alterations user ID columns from UUID to TEXT
ALTER TABLE alterations ALTER COLUMN submitted_by TYPE TEXT;
ALTER TABLE alterations ALTER COLUMN reviewed_by TYPE TEXT;

-- Convert moderation_queue.reviewed_by from UUID to TEXT
ALTER TABLE moderation_queue ALTER COLUMN reviewed_by TYPE TEXT;
