import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { favorites } from "$lib/db/schemas";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { requireExactlyOneEntityRef } from "$lib/server/entity-refs";

export const GET: RequestHandler = async ({ locals, url }) => {
  const user = requireAuth({ locals } as any);

  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");
  const backpackingId = url.searchParams.get("backpacking_id");

  const conditions = [eq(favorites.userId, user.id)];

  if (hikeId) {
    conditions.push(eq(favorites.hikeId, hikeId));
  }

  if (campingSiteId) {
    conditions.push(eq(favorites.campingSiteId, campingSiteId));
  }

  if (backpackingId) {
    conditions.push(eq(favorites.backpackingId, backpackingId));
  }

  const results = await db.query.favorites.findMany({
    where: and(...conditions),
  });

  return json(results, { headers: { "Cache-Control": "no-store" } });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = requireAuth({ locals } as any);

  const body = await request.json();
  const { hikeId, campingSiteId, backpackingId } = body;

  requireExactlyOneEntityRef(
    { hikeId, campingSiteId, backpackingId },
    {
      missing: "Either hikeId, campingSiteId, or backpackingId is required",
      tooMany: "Cannot favorite more than one entity at once",
    }
  );

  const [newFavorite] = await db
    .insert(favorites)
    .values({
      userId: user.id,
      hikeId: hikeId || null,
      campingSiteId: campingSiteId || null,
      backpackingId: backpackingId || null,
    })
    .onConflictDoNothing()
    .returning();

  if (!newFavorite) {
    throw error(409, "Already favorited");
  }

  return json(newFavorite, { status: 201 });
};
