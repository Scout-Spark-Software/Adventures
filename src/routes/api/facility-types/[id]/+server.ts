import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { facilityTypes } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAdmin } from "$lib/auth/middleware";

export const GET: RequestHandler = async ({ params }) => {
  const facilityType = await db.query.facilityTypes.findFirst({
    where: eq(facilityTypes.id, params.id),
  });

  if (!facilityType) {
    throw error(404, "Facility type not found");
  }

  return json(facilityType);
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  await requireAdmin({ locals } as any);

  const body = await request.json();
  const { name, key, description, icon, displayOrder, active } = body;

  const facilityType = await db.query.facilityTypes.findFirst({
    where: eq(facilityTypes.id, params.id),
  });

  if (!facilityType) {
    throw error(404, "Facility type not found");
  }

  const [updatedFacilityType] = await db
    .update(facilityTypes)
    .set({
      name,
      key,
      description,
      icon,
      displayOrder,
      active,
      updatedAt: new Date(),
    })
    .where(eq(facilityTypes.id, params.id))
    .returning();

  return json(updatedFacilityType);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  await requireAdmin({ locals } as any);

  const facilityType = await db.query.facilityTypes.findFirst({
    where: eq(facilityTypes.id, params.id),
  });

  if (!facilityType) {
    throw error(404, "Facility type not found");
  }

  await db.delete(facilityTypes).where(eq(facilityTypes.id, params.id));

  return json({ success: true });
};
