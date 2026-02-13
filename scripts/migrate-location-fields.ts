import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  const migrationPath = path.join(process.cwd(), "drizzle", "0001_update_location_fields.sql");
  const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

  console.log(
    "Running migration: Update location fields to structured address and numeric coordinates"
  );

  try {
    // Neon serverless requires tagged template literals
    // We'll execute each statement using template literal syntax
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      // Use tagged template literal syntax
      await sql`${sql.unsafe(statement)}`;
    }

    console.log("✓ Migration completed successfully");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
