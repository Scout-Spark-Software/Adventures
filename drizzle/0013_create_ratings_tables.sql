-- Create ratings table
CREATE TABLE IF NOT EXISTS "ratings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "hike_id" uuid,
  "camping_site_id" uuid,
  "rating" numeric(2, 1) NOT NULL,
  "review_text" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "ratings_hike_id_hikes_id_fk" FOREIGN KEY ("hike_id") REFERENCES "hikes"("id") ON DELETE CASCADE,
  CONSTRAINT "ratings_camping_site_id_camping_sites_id_fk" FOREIGN KEY ("camping_site_id") REFERENCES "camping_sites"("id") ON DELETE CASCADE,
  CONSTRAINT "ratings_entity_check" CHECK (
    ("hike_id" IS NOT NULL AND "camping_site_id" IS NULL) OR
    ("hike_id" IS NULL AND "camping_site_id" IS NOT NULL)
  ),
  CONSTRAINT "ratings_value_check" CHECK (
    "rating"::numeric >= 1.0 AND "rating"::numeric <= 5.0 AND ("rating"::numeric * 2) = FLOOR("rating"::numeric * 2)
  )
);

-- Create rating_aggregates table
CREATE TABLE IF NOT EXISTS "rating_aggregates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "hike_id" uuid UNIQUE,
  "camping_site_id" uuid UNIQUE,
  "average_rating" numeric(3, 2),
  "total_ratings" integer DEFAULT 0 NOT NULL,
  "total_reviews" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "rating_aggregates_hike_id_hikes_id_fk" FOREIGN KEY ("hike_id") REFERENCES "hikes"("id") ON DELETE CASCADE,
  CONSTRAINT "rating_aggregates_camping_site_id_camping_sites_id_fk" FOREIGN KEY ("camping_site_id") REFERENCES "camping_sites"("id") ON DELETE CASCADE
);

-- Indexes for efficient queries on ratings table
CREATE INDEX IF NOT EXISTS "ratings_user_id_idx" ON "ratings" ("user_id");
CREATE INDEX IF NOT EXISTS "ratings_hike_id_idx" ON "ratings" ("hike_id");
CREATE INDEX IF NOT EXISTS "ratings_camping_site_id_idx" ON "ratings" ("camping_site_id");
CREATE UNIQUE INDEX IF NOT EXISTS "ratings_user_hike_unique_idx" ON "ratings" ("user_id", "hike_id") WHERE "hike_id" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "ratings_user_camping_unique_idx" ON "ratings" ("user_id", "camping_site_id") WHERE "camping_site_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "ratings_has_review_idx" ON "ratings" ("hike_id", "camping_site_id") WHERE "review_text" IS NOT NULL;

-- Indexes for rating_aggregates table
CREATE INDEX IF NOT EXISTS "rating_aggregates_hike_id_idx" ON "rating_aggregates" ("hike_id");
CREATE INDEX IF NOT EXISTS "rating_aggregates_camping_site_id_idx" ON "rating_aggregates" ("camping_site_id");
