-- Migration: Drop user_roles table
-- Roles are now managed entirely through WorkOS organization memberships
DROP TABLE IF EXISTS "user_roles";

-- Drop the role enum type since nothing references it anymore
DROP TYPE IF EXISTS "role";
