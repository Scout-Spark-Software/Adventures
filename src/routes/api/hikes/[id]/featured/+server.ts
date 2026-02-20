import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { hikes } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAdmin } from "$lib/auth/middleware";

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  await requireAdmin({ locals } as any);

  const body = await request.json();
  const { featured } = body;

  if (typeof featured !== "boolean") {
    throw error(400, "featured must be a boolean");
  }

  const hike = await db.query.hikes.findFirst({
    where: eq(hikes.id, params.id),
  });

  if (!hike) {
    throw error(404, "Hike not found");
  }

  // Only approved hikes can be featured
  if (featured && hike.status !== "approved") {
    throw error(400, "Only approved hikes can be featured");
  }

  const [updatedHike] = await db
    .update(hikes)
    .set({
      featured,
      updatedAt: new Date(),
    })
    .where(eq(hikes.id, params.id))
    .returning();

  return json(updatedHike);
};
