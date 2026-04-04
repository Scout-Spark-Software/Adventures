import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import * as schema from "../src/lib/db/schemas/index.js";
import { eq } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

function toSlug(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, " ").trim().replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "");
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

interface HikeCSVRow {
  name: string;
  description: string;
  location: string;
  difficulty: string;
  distance: string;
  duration: string;
  elevation: string;
  trail_type: string;
  features: string;
  dog_friendly: string;
  permits_required: string;
  best_season: string;
  water_sources: string;
  parking_info: string;
  status: string;
  featured: string;
  created_by: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: string;
  longitude: string;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

function parseCSV(content: string): HikeCSVRow[] {
  const lines = content.split("\n").filter((line) => line.trim());
  const headers = parseCSVLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: any = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || "";
    });
    return row;
  });
}

async function seedHikes() {
  console.log("Starting hikes seed process...\n");

  const csvPath = join(__dirname, "..", "hikes_seed.csv");
  const csvContent = readFileSync(csvPath, "utf-8");
  const rows = parseCSV(csvContent);

  console.log(`Found ${rows.length} hikes to seed\n`);

  const defaultUserId = "26f210a0-9e3b-4025-915d-9ad8c7749f5d";

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const row of rows) {
    try {
      // Skip if a hike with this name already exists
      const existing = await db
        .select({ id: schema.hikes.id })
        .from(schema.hikes)
        .where(eq(schema.hikes.name, row.name))
        .limit(1);
      if (existing.length > 0) {
        console.log(`⟳ Skipped (already exists): ${row.name}`);
        skippedCount++;
        continue;
      }
      const addressData = {
        address: row.address || null,
        city: row.city || null,
        state: row.state || null,
        country: row.country || null,
        postalCode: row.postal_code || null,
        latitude: row.latitude ? parseFloat(row.latitude) : null,
        longitude: row.longitude ? parseFloat(row.longitude) : null,
      };

      const [address] = await db.insert(schema.addresses).values(addressData).returning();

      let features = null;
      if (row.features) {
        features = row.features.split(",").map((f) => f.trim());
      }

      // best_season stored as pipe-separated e.g. "summer|fall"
      let bestSeason = null;
      if (row.best_season) {
        bestSeason = row.best_season.split("|").map((s: string) => s.trim());
      }

      const hikeData = {
        name: row.name,
        description: row.description || null,
        addressId: address.id,
        difficulty: (row.difficulty as "easy" | "moderate" | "hard" | "very_hard") || null,
        distance: row.distance || null,
        distanceUnit: "miles" as const,
        duration: row.duration || null,
        durationUnit: "hours" as const,
        elevation: row.elevation || null,
        elevationUnit: "feet" as const,
        trailType:
          (row.trail_type as "loop" | "out_and_back" | "point_to_point") || null,
        features: features,
        dogFriendly: row.dog_friendly === "true",
        permitsRequired: row.permits_required || null,
        bestSeason: bestSeason,
        waterSources: row.water_sources === "true",
        parkingInfo: row.parking_info || null,
        slug: toSlug(row.name) || row.name.toLowerCase().replace(/\s+/g, "-"),
        status: (row.status || "approved") as "pending" | "approved" | "rejected",
        featured: row.featured === "true",
        createdBy: row.created_by || defaultUserId,
      };

      await db.insert(schema.hikes).values(hikeData);

      console.log(`✓ Seeded: ${row.name}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Error seeding ${row.name}:`, error);
      errorCount++;
    }
  }

  console.log(`\n✓ Seed completed!`);
  console.log(`  Inserted: ${successCount}`);
  console.log(`  Skipped:  ${skippedCount}`);
  console.log(`  Errors:   ${errorCount}`);
}

seedHikes()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nFatal error:", error);
    process.exit(1);
  });
