import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { backpacking } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAdmin } from "$lib/auth/middleware";

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  await requireAdmin({ locals } as any);

  const body = await request.json();
  const { featured } = body;

  if (typeof featured !== "boolean") {
    throw error(400, "featured must be a boolean");
  }

  const entry = await db.query.backpacking.findFirst({
    where: eq(backpacking.slug, params.id),
  });

  if (!entry) {
    throw error(404, "Backpacking not found");
  }

  if (featured && entry.status !== "approved") {
    throw error(400, "Only approved entries can be featured");
  }

  const [updated] = await db
    .update(backpacking)
    .set({
      featured,
      updatedAt: new Date(),
    })
    .where(eq(backpacking.id, entry.id))
    .returning();

  return json(updated);
};
