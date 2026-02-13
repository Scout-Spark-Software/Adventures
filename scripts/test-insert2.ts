import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { hikes } from "../src/lib/db/schemas/hikes.js";
import { eq } from "drizzle-orm";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { logger: true });

async function testInsert() {
  console.log("Testing hike insert...\n");

  try {
    const result = await db
      .insert(hikes)
      .values({
        name: "Test Hike",
        description: "Test description",
        addressId: null,
        difficulty: "easy",
        distance: "3",
        distanceUnit: "miles",
        duration: "3",
        durationUnit: "hours",
        elevation: "3",
        elevationUnit: "feet",
        trailType: "Loop",
        features: ["Dog Friendly", "Lake"],
        permitsRequired: "test",
        bestSeason: ["spring"],
        waterSources: false,
        parkingInfo: "free",
        status: "pending",
        createdBy: "26f210a0-9e3b-4025-915d-9ad8c7749f5d",
      })
      .returning();

    console.log("\n✓ Insert successful!");
    console.log("Result:", result);

    // Clean up
    if (result[0]) {
      await db.delete(hikes).where(eq(hikes.id, result[0].id));
      console.log("✓ Test data cleaned up");
    }
  } catch (error: any) {
    console.error("\n✗ Insert failed!");
    console.error("Error message:", error.message);
    console.error("\nError name:", error.name);
    console.error("\nFull error:", error);

    // Check for specific error properties
    if (error.code) {
      console.error("\nPostgreSQL Error Code:", error.code);
    }
    if (error.constraint) {
      console.error("Constraint:", error.constraint);
    }
    if (error.detail) {
      console.error("Detail:", error.detail);
    }
  }
}

testInsert();
