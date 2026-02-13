import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  const migrationPath = path.join(process.cwd(), "drizzle", "0002_create_addresses_table.sql");
  const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

  console.log("Running migration: Create addresses table and update references");

  try {
    // Split on statement breaks, but preserve DO blocks
    const statements: string[] = [];
    let currentStatement = "";
    let inDoBlock = false;

    for (const line of migrationSQL.split("\n")) {
      const trimmed = line.trim();

      // Skip comments
      if (trimmed.startsWith("--")) continue;

      // Track DO blocks
      if (trimmed.startsWith("DO $$")) {
        inDoBlock = true;
      }

      currentStatement += line + "\n";

      // End of DO block
      if (inDoBlock && trimmed === "END $$;") {
        inDoBlock = false;
        statements.push(currentStatement.trim());
        currentStatement = "";
      }
      // Regular statement ending
      else if (!inDoBlock && trimmed.endsWith(";")) {
        statements.push(currentStatement.trim());
        currentStatement = "";
      }
    }

    // Filter out empty statements
    const validStatements = statements.filter((s) => s.length > 0);

    for (const statement of validStatements) {
      await sql`${sql.unsafe(statement)}`;
    }

    console.log("✓ Migration completed successfully");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
