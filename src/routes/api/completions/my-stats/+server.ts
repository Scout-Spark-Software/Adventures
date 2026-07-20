import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { completionStats } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";

// GET /api/completions/my-stats - The caller's own lifetime completion totals.
// Returns zeros for a user who hasn't logged any completions yet, rather
// than a missing/null response.
export const GET: RequestHandler = async ({ locals, url }) => {
  const user = requireAuth({ locals, url } as any);

  const stats = await db.query.completionStats.findFirst({
    where: eq(completionStats.userId, user.id),
  });

  return json(
    {
      totalMiles: stats?.totalMiles ?? "0",
      totalNights: stats?.totalNights ?? 0,
      tripCount: stats?.tripCount ?? 0,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
};
