import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { tripCompletions } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { recomputeCompletionStats } from "$lib/server/completions";

// DELETE /api/completions/[id] - Delete one of the caller's own completion
// log entries. Targets the log row's own primary key rather than
// entity-matched query params (KTD8), since repeat logging means more than
// one entry can exist for the same hike/camping-site/backpacking trip.
export const DELETE: RequestHandler = async ({ params, locals }) => {
  const user = requireAuth({ locals } as any);

  const existing = await db.query.tripCompletions.findFirst({
    where: eq(tripCompletions.id, params.id),
  });

  if (!existing) {
    throw error(404, "Completion not found");
  }

  if (existing.userId !== user.id) {
    throw error(403, "You can only delete your own completion entries");
  }

  await db.delete(tripCompletions).where(eq(tripCompletions.id, params.id));

  const stats = await recomputeCompletionStats(user.id);

  return json({
    success: true,
    stats: {
      totalMiles: stats.total_miles,
      totalNights: stats.total_nights,
      tripCount: stats.trip_count,
    },
  });
};
