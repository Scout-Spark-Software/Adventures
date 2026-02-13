import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { campingSites } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAdmin } from "$lib/auth/middleware";

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const user = await requireAdmin({ locals } as any);

  const body = await request.json();
  const { featured } = body;

  if (typeof featured !== "boolean") {
    throw error(400, "featured must be a boolean");
  }

  const campingSite = await db.query.campingSites.findFirst({
    where: eq(campingSites.id, params.id),
  });

  if (!campingSite) {
    throw error(404, "Camping site not found");
  }

  // Only approved camping sites can be featured
  if (featured && campingSite.status !== "approved") {
    throw error(400, "Only approved camping sites can be featured");
  }

  const [updatedCampingSite] = await db
    .update(campingSites)
    .set({
      featured,
      updatedAt: new Date(),
    })
    .where(eq(campingSites.id, params.id))
    .returning();

  return json(updatedCampingSite);
};
