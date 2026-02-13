import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import * as schema from "../src/lib/db/schemas/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

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

  // Read CSV file
  const csvPath = join(__dirname, "..", "hikes_seed.csv");
  const csvContent = readFileSync(csvPath, "utf-8");
  const rows = parseCSV(csvContent);

  console.log(`Found ${rows.length} hikes to seed\n`);

  // Create a default user ID for seeded data
  const defaultUserId = "26f210a0-9e3b-4025-915d-9ad8c7749f5d";

  let successCount = 0;
  let errorCount = 0;

  for (const row of rows) {
    try {
      // Create address first
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

      // Parse features from comma-separated string
      let features = null;
      if (row.features) {
        features = row.features.split(",").map((f) => f.trim());
      }

      // Parse duration (e.g., "4-5 hours" -> take the average)
      let duration = null;
      if (row.duration) {
        const match = row.duration.match(/(\d+)-?(\d+)?/);
        if (match) {
          const min = parseInt(match[1]);
          const max = match[2] ? parseInt(match[2]) : min;
          duration = ((min + max) / 2).toString();
        }
      }

      // Create hike
      const hikeData = {
        name: row.name,
        description: row.description || null,
        addressId: address.id,
        difficulty: row.difficulty || null,
        distance: row.distance || null,
        distanceUnit: "miles" as const,
        duration: duration,
        durationUnit: "hours" as const,
        elevation: row.elevation || null,
        elevationUnit: "feet" as const,
        trailType: row.trail_type || null,
        features: features,
        status: (row.status || "active") as "pending" | "active" | "inactive",
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
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);
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
