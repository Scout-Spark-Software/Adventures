import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function checkSchema() {
  try {
    // Get column information for hikes table
    const columns = await (sql as any).unsafe(`
      SELECT
        column_name,
        data_type,
        column_default,
        is_nullable,
        udt_name
      FROM information_schema.columns
      WHERE table_name = 'hikes'
      ORDER BY ordinal_position;
    `);

    console.log("Hikes table columns:");
    console.log("===================\n");
    console.log(columns);

    if (Array.isArray(columns)) {
      columns.forEach((col: any) => {
        console.log(`${col.column_name}:`);
        console.log(`  Type: ${col.data_type} (${col.udt_name})`);
        console.log(`  Nullable: ${col.is_nullable}`);
        console.log(`  Default: ${col.column_default || "none"}`);
        console.log();
      });
    }

    // Try a test insert to see the exact error
    console.log("\nAttempting test insert...");
    try {
      const result = await (sql as any).unsafe(`
        INSERT INTO "hikes" (
          "name",
          "description",
          "address_id",
          "difficulty",
          "distance",
          "distance_unit",
          "duration",
          "duration_unit",
          "elevation",
          "elevation_unit",
          "trail_type",
          "features",
          "permits_required",
          "best_season",
          "water_sources",
          "parking_info",
          "status",
          "created_by"
        ) VALUES (
          'Test Hike',
          'Test description',
          NULL,
          'easy',
          3,
          'miles',
          3,
          'hours',
          3,
          'feet',
          'Loop',
          '["Dog Friendly"]'::jsonb,
          'test',
          '["spring"]'::jsonb,
          false,
          'free',
          'pending',
          '26f210a0-9e3b-4025-915d-9ad8c7749f5d'
        )
        RETURNING id;
      `);
      console.log("✓ Test insert successful!");
      console.log("Inserted ID:", result[0].id);

      // Clean up test data
      await (sql as any).unsafe(`DELETE FROM "hikes" WHERE id = '${result[0].id}'`);
      console.log("✓ Test data cleaned up");
    } catch (insertError: any) {
      console.error("✗ Test insert failed:");
      console.error(insertError.message);
      console.error("\nFull error:", insertError);
    }
  } catch (error) {
    console.error("Error checking schema:", error);
    process.exit(1);
  }
}

checkSchema();
