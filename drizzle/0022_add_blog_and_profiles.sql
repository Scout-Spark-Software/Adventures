-- Create new enums
DO $$ BEGIN
  CREATE TYPE "camping_style" AS ENUM ('dispersed', 'designated_sites', 'hut_to_hut');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "post_status" AS ENUM ('draft', 'scheduled', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add camping_style column to backpacking
ALTER TABLE "backpacking" ADD COLUMN IF NOT EXISTS "camping_style" "camping_style";

-- Create councils table
CREATE TABLE IF NOT EXISTS "councils" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "council_number" integer NOT NULL UNIQUE,
  "name" text NOT NULL,
  "headquarters_city" text,
  "headquarters_state" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS "user_profiles" (
  "user_id" text PRIMARY KEY,
  "council_id" uuid REFERENCES "councils"("id"),
  "unit_type" text,
  "unit_number" text,
  "show_unit_info" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create series table
CREATE TABLE IF NOT EXISTS "series" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create posts table
CREATE TABLE IF NOT EXISTS "posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "title" text NOT NULL,
  "excerpt" text,
  "body" text NOT NULL,
  "status" "post_status" DEFAULT 'draft' NOT NULL,
  "scheduled_at" timestamp,
  "published_at" timestamp,
  "featured" boolean DEFAULT false NOT NULL,
  "author_id" text NOT NULL,
  "series_id" uuid REFERENCES "series"("id") ON DELETE SET NULL,
  "series_order" integer,
  "cover_image_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
