import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { ratings } from "$lib/db/schemas";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";

// GET /api/ratings/my-rating?hike_id=xxx or ?camping_site_id=xxx
export const GET: RequestHandler = async ({ url, locals }) => {
  const user = requireAuth({ locals } as any);

  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");

  if (!hikeId && !campingSiteId) {
    throw error(400, "Either hike_id or camping_site_id is required");
  }

  const conditions = [eq(ratings.userId, user.id)];
  if (hikeId) conditions.push(eq(ratings.hikeId, hikeId));
  if (campingSiteId) conditions.push(eq(ratings.campingSiteId, campingSiteId));

  const userRating = await db.query.ratings.findFirst({
    where: and(...conditions),
  });

  return json({
    hasRated: !!userRating,
    rating: userRating || null,
  });
};
