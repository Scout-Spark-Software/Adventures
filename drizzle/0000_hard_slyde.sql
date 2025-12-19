DO $$ BEGIN
 CREATE TYPE "entity_type" AS ENUM('hike', 'camping_site', 'alteration');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "file_entity_type" AS ENUM('hike', 'camping_site');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "file_type" AS ENUM('image', 'document');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('admin', 'moderator', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alterations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hike_id" uuid,
	"camping_site_id" uuid,
	"field_name" text NOT NULL,
	"old_value" text,
	"new_value" text NOT NULL,
	"reason" text,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"submitted_by" uuid NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "camping_sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"location" text NOT NULL,
	"latitude" text,
	"longitude" text,
	"capacity" text,
	"amenities" jsonb,
	"facilities" jsonb,
	"reservation_info" text,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"hike_id" uuid,
	"camping_site_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "file_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"file_type" "file_type" NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hikes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"location" text NOT NULL,
	"latitude" text,
	"longitude" text,
	"difficulty" text,
	"distance" text,
	"duration" text,
	"elevation" text,
	"trail_type" text,
	"features" jsonb,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "moderation_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alterations" ADD CONSTRAINT "alterations_hike_id_hikes_id_fk" FOREIGN KEY ("hike_id") REFERENCES "hikes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alterations" ADD CONSTRAINT "alterations_camping_site_id_camping_sites_id_fk" FOREIGN KEY ("camping_site_id") REFERENCES "camping_sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorites" ADD CONSTRAINT "favorites_hike_id_hikes_id_fk" FOREIGN KEY ("hike_id") REFERENCES "hikes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorites" ADD CONSTRAINT "favorites_camping_site_id_camping_sites_id_fk" FOREIGN KEY ("camping_site_id") REFERENCES "camping_sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
