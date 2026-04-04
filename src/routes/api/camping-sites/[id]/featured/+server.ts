import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { campingSites } from "$lib/db/schemas";
import { and, eq } from "drizzle-orm";
import { requireAdmin } from "$lib/auth/middleware";

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  await requireAdmin({ locals } as any);

  const body = await request.json();
  const { featured } = body;

  if (typeof featured !== "boolean") {
    throw error(400, "featured must be a boolean");
  }

  // Atomic update: only feature approved camping sites, unfeaturing is always allowed
  const whereCondition = featured
    ? and(eq(campingSites.slug, params.id), eq(campingSites.status, "approved"))
    : eq(campingSites.slug, params.id);

  const [updatedCampingSite] = await db
    .update(campingSites)
    .set({ featured, updatedAt: new Date() })
    .where(whereCondition)
    .returning();

  if (!updatedCampingSite) {
    const exists = await db.query.campingSites.findFirst({
      where: eq(campingSites.slug, params.id),
    });
    if (!exists) throw error(404, "Camping site not found");
    throw error(400, "Only approved camping sites can be featured");
  }

  return json(updatedCampingSite);
};
