import { db } from "$lib/db";
import { sql } from "drizzle-orm";

// Atomically recompute and upsert a user's lifetime completion totals using a
// single INSERT ... SELECT ... ON CONFLICT DO UPDATE statement, mirroring
// updateRatingAggregates() in /api/ratings. Sums are COALESCEd to 0 (SUM over
// an all-NULL group, e.g. a camping-only user, returns NULL in Postgres, not
// 0), and kilometers-denominated distance rows are converted to miles before
// summing since distance_unit is a per-row snapshot, not a canonical unit.
export async function recomputeCompletionStats(userId: string) {
  const result = await db.execute(sql`
    INSERT INTO completion_stats (user_id, total_miles, total_nights, trip_count)
    SELECT
      ${userId}::text,
      COALESCE(SUM(
        CASE
          WHEN distance IS NULL THEN 0
          WHEN distance_unit = 'kilometers' THEN distance::numeric * 0.621371
          ELSE distance::numeric
        END
      ), 0),
      COALESCE(SUM(COALESCE(nights, 0)), 0),
      COUNT(*)::integer
    FROM trip_completions
    WHERE user_id = ${userId}::text
    ON CONFLICT (user_id) DO UPDATE SET
      total_miles = EXCLUDED.total_miles,
      total_nights = EXCLUDED.total_nights,
      trip_count = EXCLUDED.trip_count
    RETURNING user_id, total_miles, total_nights, trip_count
  `);

  return result.rows[0] as unknown as {
    user_id: string;
    total_miles: string;
    total_nights: number;
    trip_count: number;
  };
}
