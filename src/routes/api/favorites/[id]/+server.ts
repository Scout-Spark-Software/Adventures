import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { favorites } from "$lib/db/schemas";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";

export const GET: RequestHandler = async ({ params, locals, url }) => {
  const user = requireAuth({ locals } as any);

  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");

  if (!hikeId && !campingSiteId) {
    throw error(
      400,
      "Either hike_id or camping_site_id query parameter is required",
    );
  }

  const favorite = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.userId, user.id),
      hikeId
        ? eq(favorites.hikeId, hikeId)
        : eq(favorites.campingSiteId, campingSiteId),
    ),
  });

  return json({ isFavorite: !!favorite });
};

export const DELETE: RequestHandler = async ({ params, locals, url }) => {
  const user = requireAuth({ locals } as any);

  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");

  if (!hikeId && !campingSiteId) {
    throw error(
      400,
      "Either hike_id or camping_site_id query parameter is required",
    );
  }

  await db
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, user.id),
        hikeId
          ? eq(favorites.hikeId, hikeId)
          : eq(favorites.campingSiteId, campingSiteId),
      ),
    );

  return json({ success: true });
};
