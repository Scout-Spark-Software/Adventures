import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { featureTypes } from "$lib/db/schemas";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "$lib/auth/middleware";

export const GET: RequestHandler = async ({ url }) => {
  const activeOnly = url.searchParams.get("active") === "true";

  const conditions = [];
  if (activeOnly) {
    conditions.push(eq(featureTypes.active, true));
  }

  const results = await db.query.featureTypes.findMany({
    where: conditions.length > 0 ? conditions[0] : undefined,
    orderBy: [asc(featureTypes.displayOrder), asc(featureTypes.name)],
  });

  return json(results, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  await requireAdmin({ locals } as any);

  const body = await request.json();
  const { name, description, icon, displayOrder, active } = body;

  if (!name) {
    throw error(400, "Name is required");
  }

  const [newFeatureType] = await db
    .insert(featureTypes)
    .values({
      name,
      description,
      icon,
      displayOrder: displayOrder ?? 0,
      active: active ?? true,
    })
    .returning();

  return json(newFeatureType, { status: 201 });
};
