import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { facilityTypes } from "$lib/db/schemas";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "$lib/auth/middleware";

export const GET: RequestHandler = async ({ url }) => {
  const activeOnly = url.searchParams.get("active") === "true";

  const conditions = [];
  if (activeOnly) {
    conditions.push(eq(facilityTypes.active, true));
  }

  const results = await db.query.facilityTypes.findMany({
    where: conditions.length > 0 ? conditions[0] : undefined,
    orderBy: [asc(facilityTypes.displayOrder), asc(facilityTypes.name)],
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
  const { name, key, description, icon, displayOrder, active } = body;

  if (!name || !key) {
    throw error(400, "Name and key are required");
  }

  const [newFacilityType] = await db
    .insert(facilityTypes)
    .values({
      name,
      key,
      description,
      icon,
      displayOrder: displayOrder ?? 0,
      active: active ?? true,
    })
    .returning();

  return json(newFacilityType, { status: 201 });
};
