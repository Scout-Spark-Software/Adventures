import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { hikes } from "$lib/db/schemas";
import { and, eq } from "drizzle-orm";
import { requireAdmin } from "$lib/auth/middleware";

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  await requireAdmin({ locals } as any);

  const body = await request.json();
  const { featured } = body;

  if (typeof featured !== "boolean") {
    throw error(400, "featured must be a boolean");
  }

  // Atomic update: only feature approved hikes, unfeaturing is always allowed
  const whereCondition = featured
    ? and(eq(hikes.slug, params.id), eq(hikes.status, "approved"))
    : eq(hikes.slug, params.id);

  const [updatedHike] = await db
    .update(hikes)
    .set({ featured, updatedAt: new Date() })
    .where(whereCondition)
    .returning();

  if (!updatedHike) {
    // Could be not found, or not approved (when featuring)
    const exists = await db.query.hikes.findFirst({ where: eq(hikes.slug, params.id) });
    if (!exists) throw error(404, "Hike not found");
    throw error(400, "Only approved hikes can be featured");
  }

  return json(updatedHike);
};
