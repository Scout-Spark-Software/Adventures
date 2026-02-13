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

interface CampingCSVRow {
  name: string;
  description: string;
  location: string;
  capacity: string;
  amenities: string;
  facilities: string;
  reservation_info: string;
  pet_policy: string;
  fire_policy: string;
  site_type: string;
  cost_per_night: string;
  operating_season_start: string;
  operating_season_end: string;
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

function parseCSV(content: string): CampingCSVRow[] {
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

async function seedCampingSites() {
  console.log("Starting camping sites seed process...\n");

  // Read CSV file
  const csvPath = join(__dirname, "..", "camping_sites_seed.csv");
  const csvContent = readFileSync(csvPath, "utf-8");
  const rows = parseCSV(csvContent);

  console.log(`Found ${rows.length} camping sites to seed\n`);

  // Create a default user ID for seeded data
  const defaultUserId = "00000000-0000-0000-0000-000000000001";

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

      const [address] = await db
        .insert(schema.addresses)
        .values(addressData)
        .returning();

      // Parse amenities from comma-separated string
      let amenities = null;
      if (row.amenities) {
        amenities = row.amenities.split(",").map((a) => a.trim());
      }

      // Parse facilities from comma-separated string
      let facilities = null;
      if (row.facilities) {
        facilities = row.facilities.split(",").map((f) => f.trim());
      }

      // Validate enum values
      const petPolicy = row.pet_policy as
        | "allowed"
        | "not_allowed"
        | "restricted";
      const firePolicy = row.fire_policy as
        | "allowed"
        | "not_allowed"
        | "fire_pits_only"
        | "seasonal";
      const siteType = row.site_type as
        | "public"
        | "private"
        | "public_private_partnership";
      const status = (row.status || "approved") as
        | "pending"
        | "approved"
        | "rejected";

      // Create camping site
      const campingData = {
        name: row.name,
        description: row.description || null,
        addressId: address.id,
        capacity: row.capacity || null,
        amenities: amenities,
        facilities: facilities,
        reservationInfo: row.reservation_info || null,
        petPolicy: petPolicy,
        firePolicy: firePolicy,
        siteType: siteType,
        costPerNight: row.cost_per_night || null,
        operatingSeasonStart: row.operating_season_start || null,
        operatingSeasonEnd: row.operating_season_end || null,
        status: status,
        featured: row.featured === "true",
        createdBy: row.created_by || defaultUserId,
      };

      await db.insert(schema.campingSites).values(campingData);

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

seedCampingSites()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nFatal error:", error);
    process.exit(1);
  });
