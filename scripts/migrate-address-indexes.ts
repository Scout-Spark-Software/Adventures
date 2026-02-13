import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  const migrationPath = path.join(process.cwd(), "drizzle", "0003_add_address_indexes.sql");
  const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

  console.log("Running migration: Add indexes to addresses table");

  try {
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      await sql`${sql.unsafe(statement)}`;
    }

    console.log("✓ Migration completed successfully");
    console.log("✓ Added indexes for: city, state, postal_code, country, coordinates");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
