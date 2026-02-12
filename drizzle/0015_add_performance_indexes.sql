-- Hikes: status and featured are filtered on virtually every query
CREATE INDEX IF NOT EXISTS idx_hikes_featured ON hikes (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_hikes_status_featured ON hikes (status, featured);
CREATE INDEX IF NOT EXISTS idx_hikes_status_created_at ON hikes (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hikes_difficulty ON hikes (difficulty);
CREATE INDEX IF NOT EXISTS idx_hikes_features_gin ON hikes USING GIN (features);

-- Camping sites: same pattern
CREATE INDEX IF NOT EXISTS idx_camping_sites_featured ON camping_sites (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_camping_sites_status_featured ON camping_sites (status, featured);
CREATE INDEX IF NOT EXISTS idx_camping_sites_status_created_at ON camping_sites (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_camping_sites_site_type ON camping_sites (site_type);
CREATE INDEX IF NOT EXISTS idx_camping_sites_amenities_gin ON camping_sites USING GIN (amenities);
CREATE INDEX IF NOT EXISTS idx_camping_sites_facilities_gin ON camping_sites USING GIN (facilities);

-- Files: queried by (entity_type, entity_id) on every detail page
CREATE INDEX IF NOT EXISTS idx_files_entity ON files (entity_type, entity_id);

-- Moderation queue: filtered by status frequently
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue (status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_entity ON moderation_queue (entity_type, entity_id);

-- Alterations: filtered by status in admin workflows
CREATE INDEX IF NOT EXISTS idx_alterations_status ON alterations (status);
CREATE INDEX IF NOT EXISTS idx_alterations_hike ON alterations (hike_id) WHERE hike_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alterations_camping_site ON alterations (camping_site_id) WHERE camping_site_id IS NOT NULL;
