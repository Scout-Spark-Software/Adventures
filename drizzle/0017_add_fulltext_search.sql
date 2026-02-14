-- Migration: Add full-text search capabilities
-- Adds tsvector columns and GIN indexes for efficient full-text search
-- Includes triggers to auto-update search vectors when content changes

-- Add tsvector columns for hikes
ALTER TABLE hikes ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Add tsvector columns for camping_sites
ALTER TABLE camping_sites ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Add tsvector columns for addresses (for location search)
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update hikes search vector
CREATE OR REPLACE FUNCTION update_hikes_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.permits_required, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.parking_info, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create function to update camping_sites search vector
CREATE OR REPLACE FUNCTION update_camping_sites_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.reservation_info, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.capacity, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create function to update addresses search vector
CREATE OR REPLACE FUNCTION update_addresses_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.state, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.country, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create triggers for hikes
DROP TRIGGER IF EXISTS hikes_search_vector_update ON hikes;
CREATE TRIGGER hikes_search_vector_update
  BEFORE INSERT OR UPDATE OF name, description, permits_required, parking_info
  ON hikes
  FOR EACH ROW
  EXECUTE FUNCTION update_hikes_search_vector();

-- Create triggers for camping_sites
DROP TRIGGER IF EXISTS camping_sites_search_vector_update ON camping_sites;
CREATE TRIGGER camping_sites_search_vector_update
  BEFORE INSERT OR UPDATE OF name, description, reservation_info, capacity
  ON camping_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_camping_sites_search_vector();

-- Create triggers for addresses
DROP TRIGGER IF EXISTS addresses_search_vector_update ON addresses;
CREATE TRIGGER addresses_search_vector_update
  BEFORE INSERT OR UPDATE OF address, city, state, country
  ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_addresses_search_vector();

-- Populate existing data with search vectors
UPDATE hikes SET search_vector =
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(permits_required, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(parking_info, '')), 'C')
WHERE search_vector IS NULL;

UPDATE camping_sites SET search_vector =
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(reservation_info, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(capacity, '')), 'C')
WHERE search_vector IS NULL;

UPDATE addresses SET search_vector =
  setweight(to_tsvector('english', COALESCE(address, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(city, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(state, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(country, '')), 'C')
WHERE search_vector IS NULL;

-- Create GIN indexes for fast full-text search
CREATE INDEX IF NOT EXISTS idx_hikes_search_vector ON hikes USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_camping_sites_search_vector ON camping_sites USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_addresses_search_vector ON addresses USING GIN (search_vector);

-- Add comment explaining the search weights
COMMENT ON COLUMN hikes.search_vector IS 'Full-text search vector: A=name, B=description, C=permits/parking';
COMMENT ON COLUMN camping_sites.search_vector IS 'Full-text search vector: A=name, B=description, C=reservation_info/capacity';
COMMENT ON COLUMN addresses.search_vector IS 'Full-text search vector: A=address/city, B=state, C=country';
