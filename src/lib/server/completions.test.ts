import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { env } from "$env/dynamic/private";
import { eq } from "drizzle-orm";
import { db } from "$lib/db";
import { hikes, tripCompletions, completionStats } from "$lib/db/schemas";
import { recomputeCompletionStats } from "./completions";

// recomputeCompletionStats is a single raw SQL statement (COALESCE handling +
// km->mi conversion + an atomic upsert) deliberately kept as one query for
// atomicity — see the comment on the function itself. A mocked db.execute
// couldn't verify that SQL actually computes the right numbers, so this hits
// the real database instead. Requires DATABASE_URL (set in .env for local
// dev); skips gracefully when it's absent so this doesn't break environments
// that don't have it wired in (e.g. CI's unit-test job, as of this writing).
const hasDb = !!env.DATABASE_URL;

describe.skipIf(!hasDb)("recomputeCompletionStats", () => {
  const testUserId = `test-recompute-stats-${randomUUID()}`;
  let hikeId: string;

  beforeAll(async () => {
    const [hike] = await db
      .insert(hikes)
      .values({
        name: "Test fixture hike (completions.test.ts)",
        slug: `test-fixture-hike-${randomUUID()}`,
        createdBy: testUserId,
      })
      .returning();
    hikeId = hike.id;
  });

  afterEach(async () => {
    await db.delete(tripCompletions).where(eq(tripCompletions.userId, testUserId));
  });

  afterAll(async () => {
    await db.delete(completionStats).where(eq(completionStats.userId, testUserId));
    await db.delete(hikes).where(eq(hikes.id, hikeId));
  });

  it("returns zeroed totals when the user has no completions (SUM over an empty group)", async () => {
    const result = await recomputeCompletionStats(testUserId);
    expect(result.total_miles).toBe("0");
    expect(result.total_nights).toBe(0);
    expect(result.trip_count).toBe(0);
  });

  it("sums miles directly and converts kilometers before summing", async () => {
    await db.insert(tripCompletions).values([
      { userId: testUserId, hikeId, distance: "10", distanceUnit: "miles" },
      { userId: testUserId, hikeId, distance: "10", distanceUnit: "kilometers" },
    ]);

    const result = await recomputeCompletionStats(testUserId);
    // 10 miles + (10 km * 0.621371 mi/km) = 16.21371
    expect(Number(result.total_miles)).toBeCloseTo(16.21371, 4);
    expect(result.trip_count).toBe(2);
  });

  it("treats a null distance as 0 miles and sums nights independently", async () => {
    await db.insert(tripCompletions).values([
      { userId: testUserId, hikeId, distance: null, nights: 3 },
      { userId: testUserId, hikeId, distance: null, nights: 2 },
    ]);

    const result = await recomputeCompletionStats(testUserId);
    expect(result.total_miles).toBe("0");
    expect(result.total_nights).toBe(5);
    expect(result.trip_count).toBe(2);
  });

  it("upserts in place on repeated calls instead of duplicating the stats row", async () => {
    await db.insert(tripCompletions).values({ userId: testUserId, hikeId, distance: "5" });

    await recomputeCompletionStats(testUserId);
    const second = await recomputeCompletionStats(testUserId);

    expect(second.trip_count).toBe(1);
    const rows = await db
      .select()
      .from(completionStats)
      .where(eq(completionStats.userId, testUserId));
    expect(rows).toHaveLength(1);
  });
});
