import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { hikes, addresses, ratingAggregates, files, councils, moderationQueue } from "$lib/db/schemas";
import { eq, sql, and } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { isPrivilegedUser } from "$lib/auth/helpers";
import { deleteFile } from "$lib/storage/blob";
import { getAttribution } from "$lib/server/attribution";
import { generateUniqueSlug } from "$lib/server/slug";

export const GET: RequestHandler = async ({ params, locals }) => {
  const rows = await db
    .select({
      id: hikes.id,
      slug: hikes.slug,
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
      councilId: hikes.councilId,
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
      council: {
        id: councils.id,
        name: councils.name,
        councilNumber: councils.councilNumber,
        headquartersCity: councils.headquartersCity,
        headquartersState: councils.headquartersState,
      },
      ratingAggregate: {
        averageRating: ratingAggregates.averageRating,
        totalRatings: ratingAggregates.totalRatings,
        totalReviews: ratingAggregates.totalReviews,
      },
      bannerImageUrl: sql<string | null>`(
        SELECT file_url FROM files
        WHERE entity_id = ${hikes.id}
          AND entity_type = 'hike'
          AND file_type = 'image'
        ORDER BY is_banner DESC, created_at ASC
        LIMIT 1
      )`.as("banner_image_url"),
    })
    .from(hikes)
    .leftJoin(addresses, eq(hikes.addressId, addresses.id))
    .leftJoin(councils, eq(hikes.councilId, councils.id))
    .leftJoin(ratingAggregates, eq(hikes.id, ratingAggregates.hikeId))
    .where(eq(hikes.slug, params.id))
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
    council: hike.council?.id != null ? hike.council : null,
    ratingAggregate:
      hike.ratingAggregate?.averageRating != null
        ? {
            averageRating: hike.ratingAggregate.averageRating,
            totalRatings: hike.ratingAggregate.totalRatings ?? 0,
            totalReviews: hike.ratingAggregate.totalReviews ?? 0,
          }
        : null,
  };

  const attribution = await getAttribution(hike.createdBy);
  const resultWithAttribution = {
    ...result,
    submitterName: attribution.displayName,
    submitterUnit: attribution.unitLabel,
  };

  if (result.status === "approved") {
    return json(resultWithAttribution, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  }
  return json(resultWithAttribution, { headers: { "Cache-Control": "no-store" } });
};

export const PUT: RequestHandler = async (event) => {
  const user = requireAuth(event);

  const hike = await db.query.hikes.findFirst({
    where: eq(hikes.slug, event.params.id),
  });

  if (!hike) {
    throw error(404, "Hike not found");
  }

  // Only creator or admin can edit
  if (hike.createdBy !== user.id && user.role !== "admin") {
    throw error(403, "Not authorized to edit this hike");
  }

  const body = await event.request.json();

  let slug = hike.slug;
  if (body.name && body.name !== hike.name) {
    slug = await generateUniqueSlug(body.name, "hike", hike.id);
  }

  // Support partial updates - only update fields that are provided
  const updateData: any = {
    updatedAt: new Date(),
    slug,
  };

  // Add provided fields to update
  const allowedFields = [
    "name",
    "description",
    "councilId",
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
    .where(eq(hikes.id, hike.id))
    .returning();

  return json(updatedHike);
};

export const DELETE: RequestHandler = async (event) => {
  const user = requireAuth(event);

  const hike = await db.query.hikes.findFirst({
    where: eq(hikes.slug, event.params.id),
  });

  if (!hike) {
    throw error(404, "Hike not found");
  }

  // Only creator or admin can delete
  if (hike.createdBy !== user.id && user.role !== "admin") {
    throw error(403, "Not authorized to delete this hike");
  }

  // Delete associated files from Vercel Blob and DB
  const entityFiles = await db.query.files.findMany({
    where: eq(files.entityId, hike.id),
  });

  const deleteResults = await Promise.allSettled(
    entityFiles.map((f) => {
      const pathname = new URL(f.fileUrl).pathname;
      return deleteFile(pathname);
    })
  );
  deleteResults.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`Failed to delete blob for file ${entityFiles[i].id}:`, result.reason);
    }
  });

  if (entityFiles.length > 0) {
    await db.delete(files).where(eq(files.entityId, hike.id));
  }

  await db.delete(hikes).where(eq(hikes.id, hike.id));
  await db
    .delete(moderationQueue)
    .where(
      and(eq(moderationQueue.entityType, "hike"), eq(moderationQueue.entityId, hike.id))
    );

  return json({ success: true });
};
