-- Create camping_style enum
CREATE TYPE camping_style AS ENUM ('dispersed', 'designated_sites', 'hut_to_hut');

-- Create backpacking table (mirrors hikes with backpacking-specific additions)
CREATE TABLE IF NOT EXISTS backpacking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address_id UUID REFERENCES addresses(id),
  difficulty difficulty,
  distance NUMERIC,
  distance_unit distance_unit DEFAULT 'miles',
  duration NUMERIC,
  duration_unit duration_unit DEFAULT 'hours',
  elevation NUMERIC,
  elevation_unit elevation_unit DEFAULT 'feet',
  trail_type trail_type,
  features JSONB,
  dog_friendly BOOLEAN DEFAULT false,
  permits_required TEXT,
  best_season JSONB,
  water_sources BOOLEAN DEFAULT false,
  parking_info TEXT,
  number_of_days INTEGER,
  number_of_nights INTEGER,
  camping_style camping_style,
  resupply_points JSONB,
  water_availability TEXT,
  search_vector TSVECTOR,
  status status DEFAULT 'pending' NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- GIN index for full-text search
CREATE INDEX IF NOT EXISTS backpacking_search_vector_idx
  ON backpacking USING GIN(search_vector);

-- Add backpacking_id FK column to polymorphic tables
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS backpacking_id UUID REFERENCES backpacking(id);
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS backpacking_id UUID REFERENCES backpacking(id) ON DELETE CASCADE;
ALTER TABLE rating_aggregates ADD COLUMN IF NOT EXISTS backpacking_id UUID REFERENCES backpacking(id) ON DELETE CASCADE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS backpacking_id UUID REFERENCES backpacking(id) ON DELETE CASCADE;
ALTER TABLE alterations ADD COLUMN IF NOT EXISTS backpacking_id UUID REFERENCES backpacking(id);

-- Unique constraint on rating_aggregates.backpacking_id
ALTER TABLE rating_aggregates ADD CONSTRAINT rating_aggregates_backpacking_id_unique UNIQUE (backpacking_id);

-- Indexes for FK columns
CREATE INDEX IF NOT EXISTS favorites_backpacking_id_idx ON favorites(backpacking_id);
CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_backpacking_unique
  ON favorites(user_id, backpacking_id)
  WHERE backpacking_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ratings_backpacking_id_idx ON ratings(backpacking_id);
CREATE UNIQUE INDEX IF NOT EXISTS ratings_user_backpacking_unique_idx
  ON ratings(user_id, backpacking_id)
  WHERE backpacking_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS rating_aggregates_backpacking_id_idx ON rating_aggregates(backpacking_id);
CREATE INDEX IF NOT EXISTS notes_backpacking_id_idx ON notes(backpacking_id);

-- Update CHECK constraint on ratings to allow exactly one of three entity types
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_entity_check;
ALTER TABLE ratings ADD CONSTRAINT ratings_entity_check CHECK (
  (hike_id IS NOT NULL AND camping_site_id IS NULL AND backpacking_id IS NULL) OR
  (hike_id IS NULL AND camping_site_id IS NOT NULL AND backpacking_id IS NULL) OR
  (hike_id IS NULL AND camping_site_id IS NULL AND backpacking_id IS NOT NULL)
);
