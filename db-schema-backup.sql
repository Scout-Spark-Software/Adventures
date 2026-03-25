CREATE SCHEMA "public";
CREATE SCHEMA "drizzle";
CREATE SCHEMA "neon_auth";
CREATE TYPE "camping_style" AS ENUM('dispersed', 'designated_sites', 'hut_to_hut');
CREATE TYPE "difficulty" AS ENUM('easy', 'moderate', 'hard', 'very_hard');
CREATE TYPE "distance_unit" AS ENUM('miles', 'kilometers');
CREATE TYPE "duration_unit" AS ENUM('minutes', 'hours');
CREATE TYPE "elevation_unit" AS ENUM('feet', 'meters');
CREATE TYPE "entity_type" AS ENUM('hike', 'camping_site', 'backpacking', 'alteration');
CREATE TYPE "file_entity_type" AS ENUM('hike', 'camping_site', 'backpacking');
CREATE TYPE "file_type" AS ENUM('image', 'document');
CREATE TYPE "fire_policy" AS ENUM('allowed', 'not_allowed', 'fire_pits_only', 'seasonal');
CREATE TYPE "pet_policy" AS ENUM('allowed', 'not_allowed', 'restricted');
CREATE TYPE "site_type" AS ENUM('public', 'private', 'public_private_partnership');
CREATE TYPE "status" AS ENUM('pending', 'approved', 'rejected');
CREATE TYPE "trail_type" AS ENUM('loop', 'out_and_back', 'point_to_point');
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"address" text,
	"city" text,
	"state" text,
	"country" text,
	"postal_code" text,
	"latitude" double precision,
	"longitude" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"search_vector" tsvector
);
CREATE TABLE "alterations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"hike_id" uuid,
	"camping_site_id" uuid,
	"field_name" text NOT NULL,
	"old_value" text,
	"new_value" text NOT NULL,
	"reason" text,
	"status" status DEFAULT 'pending' NOT NULL,
	"submitted_by" text NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"backpacking_id" uuid
);
CREATE TABLE "amenity_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL CONSTRAINT "amenity_types_name_unique" UNIQUE,
	"key" text NOT NULL CONSTRAINT "amenity_types_key_unique" UNIQUE,
	"description" text,
	"icon" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "backpacking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text,
	"address_id" uuid,
	"difficulty" difficulty,
	"distance" numeric,
	"distance_unit" distance_unit DEFAULT 'miles',
	"duration" numeric,
	"duration_unit" duration_unit DEFAULT 'hours',
	"elevation" numeric,
	"elevation_unit" elevation_unit DEFAULT 'feet',
	"trail_type" trail_type,
	"features" jsonb,
	"dog_friendly" boolean DEFAULT false,
	"permits_required" text,
	"best_season" jsonb,
	"water_sources" boolean DEFAULT false,
	"parking_info" text,
	"number_of_days" integer,
	"number_of_nights" integer,
	"camping_style" camping_style,
	"resupply_points" jsonb,
	"water_availability" text,
	"search_vector" tsvector,
	"status" status DEFAULT 'pending' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"waypoints" jsonb,
	"council_id" uuid
);
CREATE TABLE "camping_sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text,
	"capacity" text,
	"amenities" jsonb,
	"facilities" jsonb,
	"reservation_info" text,
	"status" status DEFAULT 'pending' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"address_id" uuid,
	"cost_per_night" numeric(10, 2),
	"base_fee" numeric(10, 2),
	"operating_season_start" text,
	"operating_season_end" text,
	"pet_policy" pet_policy NOT NULL,
	"reservation_required" boolean DEFAULT false,
	"site_type" site_type NOT NULL,
	"fire_policy" fire_policy NOT NULL,
	"search_vector" tsvector,
	"council_id" uuid
);
CREATE TABLE "councils" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"council_number" integer NOT NULL CONSTRAINT "councils_council_number_unique" UNIQUE,
	"name" text NOT NULL,
	"headquarters_city" text,
	"headquarters_state" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "facility_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL CONSTRAINT "facility_types_name_unique" UNIQUE,
	"key" text NOT NULL CONSTRAINT "facility_types_key_unique" UNIQUE,
	"description" text,
	"icon" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"hike_id" uuid,
	"camping_site_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"backpacking_id" uuid
);
CREATE TABLE "feature_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL CONSTRAINT "feature_types_name_unique" UNIQUE,
	"description" text,
	"icon" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"entity_type" file_entity_type NOT NULL,
	"entity_id" uuid NOT NULL,
	"file_type" file_type NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_banner" boolean DEFAULT false NOT NULL
);
CREATE TABLE "hikes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text,
	"difficulty" difficulty,
	"trail_type" trail_type,
	"features" jsonb,
	"status" status DEFAULT 'pending' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"address_id" uuid,
	"dog_friendly" boolean DEFAULT false,
	"permits_required" text,
	"best_season" jsonb,
	"water_sources" boolean DEFAULT false,
	"parking_info" text,
	"distance_unit" distance_unit DEFAULT 'miles',
	"duration_unit" duration_unit DEFAULT 'hours',
	"elevation_unit" elevation_unit DEFAULT 'feet',
	"distance" numeric,
	"duration" numeric,
	"elevation" numeric,
	"search_vector" tsvector,
	"council_id" uuid
);
CREATE TABLE "image_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"file_id" uuid NOT NULL,
	"flagged_by" text NOT NULL,
	"reason" text,
	"status" status DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "moderation_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"entity_type" entity_type NOT NULL,
	"entity_id" uuid NOT NULL,
	"status" status DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"hike_id" uuid,
	"camping_site_id" uuid,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"backpacking_id" uuid
);
CREATE TABLE "rating_aggregates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"hike_id" uuid CONSTRAINT "rating_aggregates_hike_id_unique" UNIQUE,
	"camping_site_id" uuid CONSTRAINT "rating_aggregates_camping_site_id_unique" UNIQUE,
	"average_rating" numeric(3, 2),
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"backpacking_id" uuid CONSTRAINT "rating_aggregates_backpacking_id_unique" UNIQUE
);
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"hike_id" uuid,
	"camping_site_id" uuid,
	"rating" numeric(2, 1) NOT NULL,
	"review_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"backpacking_id" uuid,
	CONSTRAINT "ratings_entity_check" CHECK ((((hike_id IS NOT NULL) AND (camping_site_id IS NULL) AND (backpacking_id IS NULL)) OR ((hike_id IS NULL) AND (camping_site_id IS NOT NULL) AND (backpacking_id IS NULL)) OR ((hike_id IS NULL) AND (camping_site_id IS NULL) AND (backpacking_id IS NOT NULL)))),
	CONSTRAINT "ratings_value_check" CHECK ((((rating)::numeric >= 1.0) AND ((rating)::numeric <= 5.0) AND (((rating)::numeric * (2)::numeric) = floor(((rating)::numeric * (2)::numeric)))))
);
CREATE TABLE "trail_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL CONSTRAINT "trail_types_name_unique" UNIQUE,
	"key" text NOT NULL CONSTRAINT "trail_types_key_unique" UNIQUE,
	"description" text,
	"icon" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY,
	"council_id" uuid,
	"unit_type" text,
	"unit_number" text,
	"show_unit_info" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "drizzle"."__drizzle_migrations" (
	"id" serial PRIMARY KEY,
	"hash" text NOT NULL,
	"created_at" bigint
);
CREATE TABLE "neon_auth"."account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" uuid NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
CREATE TABLE "neon_auth"."invitation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"inviterId" uuid NOT NULL
);
CREATE TABLE "neon_auth"."jwks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"publicKey" text NOT NULL,
	"privateKey" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"expiresAt" timestamp with time zone
);
CREATE TABLE "neon_auth"."member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
CREATE TABLE "neon_auth"."organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL CONSTRAINT "organization_slug_key" UNIQUE,
	"logo" text,
	"createdAt" timestamp with time zone NOT NULL,
	"metadata" text
);
CREATE TABLE "neon_auth"."project_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"endpoint_id" text NOT NULL CONSTRAINT "project_config_endpoint_id_key" UNIQUE,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"trusted_origins" jsonb NOT NULL,
	"social_providers" jsonb NOT NULL,
	"email_provider" jsonb,
	"email_and_password" jsonb,
	"allow_localhost" boolean NOT NULL,
	"plugin_configs" jsonb,
	"webhook_config" jsonb
);
CREATE TABLE "neon_auth"."session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL CONSTRAINT "session_token_key" UNIQUE,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" uuid NOT NULL,
	"impersonatedBy" text,
	"activeOrganizationId" text
);
CREATE TABLE "neon_auth"."user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"email" text NOT NULL CONSTRAINT "user_email_key" UNIQUE,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"role" text,
	"banned" boolean,
	"banReason" text,
	"banExpires" timestamp with time zone
);
CREATE TABLE "neon_auth"."verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX "addresses_pkey" ON "addresses" ("id");
CREATE UNIQUE INDEX "alterations_pkey" ON "alterations" ("id");
CREATE UNIQUE INDEX "amenity_types_key_unique" ON "amenity_types" ("key");
CREATE UNIQUE INDEX "amenity_types_name_unique" ON "amenity_types" ("name");
CREATE UNIQUE INDEX "amenity_types_pkey" ON "amenity_types" ("id");
CREATE UNIQUE INDEX "backpacking_pkey" ON "backpacking" ("id");
CREATE UNIQUE INDEX "camping_sites_pkey" ON "camping_sites" ("id");
CREATE UNIQUE INDEX "councils_council_number_unique" ON "councils" ("council_number");
CREATE UNIQUE INDEX "councils_pkey" ON "councils" ("id");
CREATE UNIQUE INDEX "facility_types_key_unique" ON "facility_types" ("key");
CREATE UNIQUE INDEX "facility_types_name_unique" ON "facility_types" ("name");
CREATE UNIQUE INDEX "facility_types_pkey" ON "facility_types" ("id");
CREATE INDEX "favorites_backpacking_id_idx" ON "favorites" ("backpacking_id");
CREATE INDEX "favorites_camping_site_id_idx" ON "favorites" ("camping_site_id");
CREATE INDEX "favorites_hike_id_idx" ON "favorites" ("hike_id");
CREATE UNIQUE INDEX "favorites_pkey" ON "favorites" ("id");
CREATE UNIQUE INDEX "favorites_user_backpacking_unique" ON "favorites" ("user_id","backpacking_id");
CREATE UNIQUE INDEX "favorites_user_camping_unique" ON "favorites" ("user_id","camping_site_id");
CREATE UNIQUE INDEX "favorites_user_hike_unique" ON "favorites" ("user_id","hike_id");
CREATE INDEX "favorites_user_id_idx" ON "favorites" ("user_id");
CREATE UNIQUE INDEX "feature_types_name_unique" ON "feature_types" ("name");
CREATE UNIQUE INDEX "feature_types_pkey" ON "feature_types" ("id");
CREATE UNIQUE INDEX "files_pkey" ON "files" ("id");
CREATE UNIQUE INDEX "hikes_pkey" ON "hikes" ("id");
CREATE UNIQUE INDEX "image_flags_pkey" ON "image_flags" ("id");
CREATE UNIQUE INDEX "moderation_queue_pkey" ON "moderation_queue" ("id");
CREATE UNIQUE INDEX "notes_pkey" ON "notes" ("id");
CREATE INDEX "rating_aggregates_backpacking_id_idx" ON "rating_aggregates" ("backpacking_id");
CREATE UNIQUE INDEX "rating_aggregates_backpacking_id_unique" ON "rating_aggregates" ("backpacking_id");
CREATE INDEX "rating_aggregates_camping_site_id_idx" ON "rating_aggregates" ("camping_site_id");
CREATE UNIQUE INDEX "rating_aggregates_camping_site_id_unique" ON "rating_aggregates" ("camping_site_id");
CREATE INDEX "rating_aggregates_hike_id_idx" ON "rating_aggregates" ("hike_id");
CREATE UNIQUE INDEX "rating_aggregates_hike_id_unique" ON "rating_aggregates" ("hike_id");
CREATE UNIQUE INDEX "rating_aggregates_pkey" ON "rating_aggregates" ("id");
CREATE INDEX "ratings_backpacking_id_idx" ON "ratings" ("backpacking_id");
CREATE INDEX "ratings_camping_site_id_idx" ON "ratings" ("camping_site_id");
CREATE INDEX "ratings_has_review_idx" ON "ratings" ("hike_id","camping_site_id");
CREATE INDEX "ratings_hike_id_idx" ON "ratings" ("hike_id");
CREATE UNIQUE INDEX "ratings_pkey" ON "ratings" ("id");
CREATE UNIQUE INDEX "ratings_user_backpacking_unique_idx" ON "ratings" ("user_id","backpacking_id");
CREATE UNIQUE INDEX "ratings_user_camping_unique_idx" ON "ratings" ("user_id","camping_site_id");
CREATE UNIQUE INDEX "ratings_user_hike_unique_idx" ON "ratings" ("user_id","hike_id");
CREATE INDEX "ratings_user_id_idx" ON "ratings" ("user_id");
CREATE UNIQUE INDEX "trail_types_key_unique" ON "trail_types" ("key");
CREATE UNIQUE INDEX "trail_types_name_unique" ON "trail_types" ("name");
CREATE UNIQUE INDEX "trail_types_pkey" ON "trail_types" ("id");
CREATE UNIQUE INDEX "user_profiles_pkey" ON "user_profiles" ("user_id");
CREATE UNIQUE INDEX "__drizzle_migrations_pkey" ON "drizzle"."__drizzle_migrations" ("id");
CREATE UNIQUE INDEX "account_pkey" ON "neon_auth"."account" ("id");
CREATE INDEX "account_userId_idx" ON "neon_auth"."account" ("userId");
CREATE INDEX "invitation_email_idx" ON "neon_auth"."invitation" ("email");
CREATE INDEX "invitation_organizationId_idx" ON "neon_auth"."invitation" ("organizationId");
CREATE UNIQUE INDEX "invitation_pkey" ON "neon_auth"."invitation" ("id");
CREATE UNIQUE INDEX "jwks_pkey" ON "neon_auth"."jwks" ("id");
CREATE INDEX "member_organizationId_idx" ON "neon_auth"."member" ("organizationId");
CREATE UNIQUE INDEX "member_pkey" ON "neon_auth"."member" ("id");
CREATE INDEX "member_userId_idx" ON "neon_auth"."member" ("userId");
CREATE UNIQUE INDEX "organization_pkey" ON "neon_auth"."organization" ("id");
CREATE UNIQUE INDEX "organization_slug_key" ON "neon_auth"."organization" ("slug");
CREATE UNIQUE INDEX "organization_slug_uidx" ON "neon_auth"."organization" ("slug");
CREATE UNIQUE INDEX "project_config_endpoint_id_key" ON "neon_auth"."project_config" ("endpoint_id");
CREATE UNIQUE INDEX "project_config_pkey" ON "neon_auth"."project_config" ("id");
CREATE UNIQUE INDEX "session_pkey" ON "neon_auth"."session" ("id");
CREATE UNIQUE INDEX "session_token_key" ON "neon_auth"."session" ("token");
CREATE INDEX "session_userId_idx" ON "neon_auth"."session" ("userId");
CREATE UNIQUE INDEX "user_email_key" ON "neon_auth"."user" ("email");
CREATE UNIQUE INDEX "user_pkey" ON "neon_auth"."user" ("id");
CREATE INDEX "verification_identifier_idx" ON "neon_auth"."verification" ("identifier");
CREATE UNIQUE INDEX "verification_pkey" ON "neon_auth"."verification" ("id");
ALTER TABLE "alterations" ADD CONSTRAINT "alterations_backpacking_id_backpacking_id_fk" FOREIGN KEY ("backpacking_id") REFERENCES "backpacking"("id");
ALTER TABLE "alterations" ADD CONSTRAINT "alterations_camping_site_id_camping_sites_id_fk" FOREIGN KEY ("camping_site_id") REFERENCES "camping_sites"("id");
ALTER TABLE "alterations" ADD CONSTRAINT "alterations_hike_id_hikes_id_fk" FOREIGN KEY ("hike_id") REFERENCES "hikes"("id");
ALTER TABLE "backpacking" ADD CONSTRAINT "backpacking_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "addresses"("id");
ALTER TABLE "backpacking" ADD CONSTRAINT "backpacking_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "councils"("id");
ALTER TABLE "camping_sites" ADD CONSTRAINT "camping_sites_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "addresses"("id");
ALTER TABLE "camping_sites" ADD CONSTRAINT "camping_sites_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "councils"("id");
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_backpacking_id_backpacking_id_fk" FOREIGN KEY ("backpacking_id") REFERENCES "backpacking"("id");
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_camping_site_id_camping_sites_id_fk" FOREIGN KEY ("camping_site_id") REFERENCES "camping_sites"("id");
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_hike_id_hikes_id_fk" FOREIGN KEY ("hike_id") REFERENCES "hikes"("id");
ALTER TABLE "hikes" ADD CONSTRAINT "hikes_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "addresses"("id");
ALTER TABLE "hikes" ADD CONSTRAINT "hikes_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "councils"("id");
ALTER TABLE "image_flags" ADD CONSTRAINT "image_flags_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_backpacking_id_backpacking_id_fk" FOREIGN KEY ("backpacking_id") REFERENCES "backpacking"("id") ON DELETE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_camping_site_id_camping_sites_id_fk" FOREIGN KEY ("camping_site_id") REFERENCES "camping_sites"("id") ON DELETE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_hike_id_hikes_id_fk" FOREIGN KEY ("hike_id") REFERENCES "hikes"("id") ON DELETE CASCADE;
ALTER TABLE "rating_aggregates" ADD CONSTRAINT "rating_aggregates_backpacking_id_backpacking_id_fk" FOREIGN KEY ("backpacking_id") REFERENCES "backpacking"("id") ON DELETE CASCADE;
ALTER TABLE "rating_aggregates" ADD CONSTRAINT "rating_aggregates_camping_site_id_camping_sites_id_fk" FOREIGN KEY ("camping_site_id") REFERENCES "camping_sites"("id") ON DELETE CASCADE;
ALTER TABLE "rating_aggregates" ADD CONSTRAINT "rating_aggregates_hike_id_hikes_id_fk" FOREIGN KEY ("hike_id") REFERENCES "hikes"("id") ON DELETE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_backpacking_id_backpacking_id_fk" FOREIGN KEY ("backpacking_id") REFERENCES "backpacking"("id") ON DELETE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_camping_site_id_camping_sites_id_fk" FOREIGN KEY ("camping_site_id") REFERENCES "camping_sites"("id") ON DELETE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_hike_id_hikes_id_fk" FOREIGN KEY ("hike_id") REFERENCES "hikes"("id") ON DELETE CASCADE;
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "councils"("id");
ALTER TABLE "neon_auth"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE;
ALTER TABLE "neon_auth"."invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE;
ALTER TABLE "neon_auth"."invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "neon_auth"."organization"("id") ON DELETE CASCADE;
ALTER TABLE "neon_auth"."member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "neon_auth"."organization"("id") ON DELETE CASCADE;
ALTER TABLE "neon_auth"."member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE;
ALTER TABLE "neon_auth"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE;