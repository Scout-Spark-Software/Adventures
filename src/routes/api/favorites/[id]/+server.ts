import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { favorites } from "$lib/db/schemas";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";

export const GET: RequestHandler = async ({ locals, url }) => {
  const user = requireAuth({ locals } as any);

  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");
  const backpackingId = url.searchParams.get("backpacking_id");

  if (!hikeId && !campingSiteId && !backpackingId) {
    throw error(
      400,
      "Either hike_id, camping_site_id, or backpacking_id query parameter is required"
    );
  }

  const entityCondition = hikeId
    ? eq(favorites.hikeId, hikeId)
    : backpackingId
      ? eq(favorites.backpackingId, backpackingId)
      : eq(favorites.campingSiteId, campingSiteId!);

  const favorite = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, user.id), entityCondition),
  });

  return json({ isFavorite: !!favorite });
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
  const user = requireAuth({ locals } as any);

  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");
  const backpackingId = url.searchParams.get("backpacking_id");

  if (!hikeId && !campingSiteId && !backpackingId) {
    throw error(
      400,
      "Either hike_id, camping_site_id, or backpacking_id query parameter is required"
    );
  }

  const entityCondition = hikeId
    ? eq(favorites.hikeId, hikeId)
    : backpackingId
      ? eq(favorites.backpackingId, backpackingId)
      : eq(favorites.campingSiteId, campingSiteId!);

  await db.delete(favorites).where(and(eq(favorites.userId, user.id), entityCondition));

  return json({ success: true });
};
