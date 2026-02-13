import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { featureTypes } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAdmin } from "$lib/auth/middleware";

export const GET: RequestHandler = async ({ params }) => {
  const featureType = await db.query.featureTypes.findFirst({
    where: eq(featureTypes.id, params.id),
  });

  if (!featureType) {
    throw error(404, "Feature type not found");
  }

  return json(featureType);
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  await requireAdmin({ locals } as any);

  const body = await request.json();
  const { name, description, icon, displayOrder, active } = body;

  const featureType = await db.query.featureTypes.findFirst({
    where: eq(featureTypes.id, params.id),
  });

  if (!featureType) {
    throw error(404, "Feature type not found");
  }

  const [updatedFeatureType] = await db
    .update(featureTypes)
    .set({
      name,
      description,
      icon,
      displayOrder,
      active,
      updatedAt: new Date(),
    })
    .where(eq(featureTypes.id, params.id))
    .returning();

  return json(updatedFeatureType);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  await requireAdmin({ locals } as any);

  const featureType = await db.query.featureTypes.findFirst({
    where: eq(featureTypes.id, params.id),
  });

  if (!featureType) {
    throw error(404, "Feature type not found");
  }

  await db.delete(featureTypes).where(eq(featureTypes.id, params.id));

  return json({ success: true });
};
