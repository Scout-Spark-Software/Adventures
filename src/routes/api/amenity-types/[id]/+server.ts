import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { amenityTypes } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAdmin } from "$lib/auth/middleware";

export const GET: RequestHandler = async ({ params }) => {
  const amenityType = await db.query.amenityTypes.findFirst({
    where: eq(amenityTypes.id, params.id),
  });

  if (!amenityType) {
    throw error(404, "Amenity type not found");
  }

  return json(amenityType);
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  await requireAdmin({ locals } as any);

  const body = await request.json();
  const { name, key, description, icon, displayOrder, active } = body;

  const amenityType = await db.query.amenityTypes.findFirst({
    where: eq(amenityTypes.id, params.id),
  });

  if (!amenityType) {
    throw error(404, "Amenity type not found");
  }

  const [updatedAmenityType] = await db
    .update(amenityTypes)
    .set({
      name,
      key,
      description,
      icon,
      displayOrder,
      active,
      updatedAt: new Date(),
    })
    .where(eq(amenityTypes.id, params.id))
    .returning();

  return json(updatedAmenityType);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  await requireAdmin({ locals } as any);

  const amenityType = await db.query.amenityTypes.findFirst({
    where: eq(amenityTypes.id, params.id),
  });

  if (!amenityType) {
    throw error(404, "Amenity type not found");
  }

  await db.delete(amenityTypes).where(eq(amenityTypes.id, params.id));

  return json({ success: true });
};
