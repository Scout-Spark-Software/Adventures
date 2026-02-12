import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { hikes, addresses, ratingAggregates } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { isPrivilegedUser } from "$lib/auth/helpers";

export const GET: RequestHandler = async ({ params, locals }) => {
  const rows = await db
    .select({
      id: hikes.id,
      name: hikes.name,
      description: hikes.description,
      addressId: hikes.addressId,
      difficulty: hikes.difficulty,
      distance: hikes.distance,
      distanceUnit: hikes.distanceUnit,
      duration: hikes.duration,
      durationUnit: hikes.durationUnit,
      elevation: hikes.elevation,
      elevationUnit: hikes.elevationUnit,
      trailType: hikes.trailType,
      features: hikes.features,
      dogFriendly: hikes.dogFriendly,
      permitsRequired: hikes.permitsRequired,
      bestSeason: hikes.bestSeason,
      waterSources: hikes.waterSources,
      parkingInfo: hikes.parkingInfo,
      status: hikes.status,
      featured: hikes.featured,
      createdBy: hikes.createdBy,
      createdAt: hikes.createdAt,
      updatedAt: hikes.updatedAt,
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
      ratingAggregate: {
        averageRating: ratingAggregates.averageRating,
        totalRatings: ratingAggregates.totalRatings,
        totalReviews: ratingAggregates.totalReviews,
      },
    })
    .from(hikes)
    .leftJoin(addresses, eq(hikes.addressId, addresses.id))
    .leftJoin(ratingAggregates, eq(hikes.id, ratingAggregates.hikeId))
    .where(eq(hikes.id, params.id))
    .limit(1);

  const hike = rows[0];

  if (!hike) {
    throw error(404, "Hike not found");
  }

  // Only show approved hikes to non-admins/moderators
  if (!isPrivilegedUser(locals.user) && hike.status !== "approved") {
    throw error(404, "Hike not found");
  }

  // Normalize LEFT JOIN results: null out nested objects when join missed
  const result = {
    ...hike,
    address: hike.address?.id != null ? hike.address : null,
    ratingAggregate:
      hike.ratingAggregate?.averageRating != null
        ? {
            averageRating: hike.ratingAggregate.averageRating,
            totalRatings: hike.ratingAggregate.totalRatings ?? 0,
            totalReviews: hike.ratingAggregate.totalReviews ?? 0,
          }
        : null,
  };

  if (result.status === "approved") {
    return json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }
  return json(result);
};

export const PUT: RequestHandler = async (event) => {
  const user = requireAuth(event);

  const hike = await db.query.hikes.findFirst({
    where: eq(hikes.id, event.params.id),
  });

  if (!hike) {
    throw error(404, "Hike not found");
  }

  // Only creator or admin can edit
  if (hike.createdBy !== user.id && user.role !== "admin") {
    throw error(403, "Not authorized to edit this hike");
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
    "difficulty",
    "distance",
    "distanceUnit",
    "duration",
    "durationUnit",
    "elevation",
    "elevationUnit",
    "trailType",
    "features",
    "permitsRequired",
    "bestSeason",
    "waterSources",
    "parkingInfo",
    "dogFriendly",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  const [updatedHike] = await db
    .update(hikes)
    .set(updateData)
    .where(eq(hikes.id, event.params.id))
    .returning();

  return json(updatedHike);
};

export const DELETE: RequestHandler = async (event) => {
  const user = requireAuth(event);

  const hike = await db.query.hikes.findFirst({
    where: eq(hikes.id, event.params.id),
  });

  if (!hike) {
    throw error(404, "Hike not found");
  }

  // Only creator or admin can delete
  if (hike.createdBy !== user.id && user.role !== "admin") {
    throw error(403, "Not authorized to delete this hike");
  }

  await db.delete(hikes).where(eq(hikes.id, event.params.id));

  return json({ success: true });
};
