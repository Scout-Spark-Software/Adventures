-- Add 'backpacking' to the entity_type enum (used by moderation_queue)
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'backpacking';

-- Add 'backpacking' to the file_entity_type enum (used by files)
ALTER TYPE file_entity_type ADD VALUE IF NOT EXISTS 'backpacking';
