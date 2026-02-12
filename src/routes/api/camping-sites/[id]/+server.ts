import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { campingSites, addresses } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { isPrivilegedUser } from "$lib/auth/helpers";

export const GET: RequestHandler = async ({ params, locals }) => {
  const rows = await db
    .select({
      id: campingSites.id,
      name: campingSites.name,
      description: campingSites.description,
      addressId: campingSites.addressId,
      capacity: campingSites.capacity,
      amenities: campingSites.amenities,
      facilities: campingSites.facilities,
      reservationInfo: campingSites.reservationInfo,
      costPerNight: campingSites.costPerNight,
      baseFee: campingSites.baseFee,
      operatingSeasonStart: campingSites.operatingSeasonStart,
      operatingSeasonEnd: campingSites.operatingSeasonEnd,
      petPolicy: campingSites.petPolicy,
      reservationRequired: campingSites.reservationRequired,
      siteType: campingSites.siteType,
      firePolicy: campingSites.firePolicy,
      status: campingSites.status,
      featured: campingSites.featured,
      createdBy: campingSites.createdBy,
      createdAt: campingSites.createdAt,
      updatedAt: campingSites.updatedAt,
      address: {
        id: addresses.id,
        address: addresses.address,
        city: addresses.city,
        state: addresses.state,
        country: addresses.country,
        postalCode: addresses.postalCode,
        latitude: addresses.latitude,
        longitude: addresses.longitude,
      },
    })
    .from(campingSites)
    .leftJoin(addresses, eq(campingSites.addressId, addresses.id))
    .where(eq(campingSites.id, params.id))
    .limit(1);

  const campingSite = rows[0];

  if (!campingSite) {
    throw error(404, "Camping site not found");
  }

  // Only show approved camping sites to non-admins/moderators
  if (!isPrivilegedUser(locals.user) && campingSite.status !== "approved") {
    throw error(404, "Camping site not found");
  }

  const headers =
    campingSite.status === "approved"
      ? { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" }
      : {};
  return json(campingSite, { headers });
};

export const PUT: RequestHandler = async (event) => {
  const user = requireAuth(event);

  const campingSite = await db.query.campingSites.findFirst({
    where: eq(campingSites.id, event.params.id),
  });

  if (!campingSite) {
    throw error(404, "Camping site not found");
  }

  // Only creator or admin can edit
  if (campingSite.createdBy !== user.id && user.role !== "admin") {
    throw error(403, "Not authorized to edit this camping site");
  }

  const body = await event.request.json();

  // Support partial updates - only update fields that are provided
  const updateData: any = {
    updatedAt: new Date(),
  };

  // Add provided fields to update
  const allowedFields = [
    "name",
    "description",
    "capacity",
    "amenities",
    "facilities",
    "reservationInfo",
    "costPerNight",
    "baseFee",
    "operatingSeasonStart",
    "operatingSeasonEnd",
    "petPolicy",
    "reservationRequired",
    "siteType",
    "firePolicy",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  const [updatedCampingSite] = await db
    .update(campingSites)
    .set(updateData)
    .where(eq(campingSites.id, event.params.id))
    .returning();

  return json(updatedCampingSite);
};

export const DELETE: RequestHandler = async (event) => {
  const user = requireAuth(event);

  const campingSite = await db.query.campingSites.findFirst({
    where: eq(campingSites.id, event.params.id),
  });

  if (!campingSite) {
    throw error(404, "Camping site not found");
  }

  // Only creator or admin can delete
  if (campingSite.createdBy !== user.id && user.role !== "admin") {
    throw error(403, "Not authorized to delete this camping site");
  }

  await db.delete(campingSites).where(eq(campingSites.id, event.params.id));

  return json({ success: true });
};
