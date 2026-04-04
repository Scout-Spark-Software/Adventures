import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { backpacking, addresses, ratingAggregates, files, councils } from "$lib/db/schemas";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { isPrivilegedUser } from "$lib/auth/helpers";
import { deleteFile } from "$lib/storage/blob";
import { getAttribution } from "$lib/server/attribution";
import { generateUniqueSlug } from "$lib/server/slug";

export const GET: RequestHandler = async ({ params, locals }) => {
  const rows = await db
    .select({
      id: backpacking.id,
      name: backpacking.name,
      description: backpacking.description,
      addressId: backpacking.addressId,
      difficulty: backpacking.difficulty,
      distance: backpacking.distance,
      distanceUnit: backpacking.distanceUnit,
      duration: backpacking.duration,
      durationUnit: backpacking.durationUnit,
      elevation: backpacking.elevation,
      elevationUnit: backpacking.elevationUnit,
      trailType: backpacking.trailType,
      features: backpacking.features,
      dogFriendly: backpacking.dogFriendly,
      permitsRequired: backpacking.permitsRequired,
      bestSeason: backpacking.bestSeason,
      waterSources: backpacking.waterSources,
      parkingInfo: backpacking.parkingInfo,
      numberOfDays: backpacking.numberOfDays,
      numberOfNights: backpacking.numberOfNights,
      campingStyle: backpacking.campingStyle,
      resupplyPoints: backpacking.resupplyPoints,
      waterAvailability: backpacking.waterAvailability,
      waypoints: backpacking.waypoints,
      status: backpacking.status,
      featured: backpacking.featured,
      createdBy: backpacking.createdBy,
      createdAt: backpacking.createdAt,
      councilId: backpacking.councilId,
      updatedAt: backpacking.updatedAt,
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
        WHERE entity_id = ${backpacking.id}
          AND entity_type = 'backpacking'
          AND file_type = 'image'
        ORDER BY is_banner DESC, created_at ASC
        LIMIT 1
      )`.as("banner_image_url"),
    })
    .from(backpacking)
    .leftJoin(addresses, eq(backpacking.addressId, addresses.id))
    .leftJoin(councils, eq(backpacking.councilId, councils.id))
    .leftJoin(ratingAggregates, eq(backpacking.id, ratingAggregates.backpackingId))
    .where(eq(backpacking.id, params.id))
    .limit(1);

  const entry = rows[0];

  if (!entry) {
    throw error(404, "Backpacking not found");
  }

  if (!isPrivilegedUser(locals.user) && entry.status !== "approved") {
    throw error(404, "Backpacking not found");
  }

  const result = {
    ...entry,
    address: entry.address?.id != null ? entry.address : null,
    council: entry.council?.id != null ? entry.council : null,
    ratingAggregate:
      entry.ratingAggregate?.averageRating != null
        ? {
            averageRating: entry.ratingAggregate.averageRating,
            totalRatings: entry.ratingAggregate.totalRatings ?? 0,
            totalReviews: entry.ratingAggregate.totalReviews ?? 0,
          }
        : null,
  };

  const attribution = await getAttribution(entry.createdBy);
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

  const entry = await db.query.backpacking.findFirst({
    where: eq(backpacking.id, event.params.id),
  });

  if (!entry) {
    throw error(404, "Backpacking not found");
  }

  if (entry.createdBy !== user.id && user.role !== "admin") {
    throw error(403, "Not authorized to edit this entry");
  }

  const body = await event.request.json();

  let slug = entry.slug;
  if (body.name && body.name !== entry.name) {
    slug = await generateUniqueSlug(body.name, "backpacking", entry.id);
  }

  const updateData: any = {
    updatedAt: new Date(),
  };

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
    "numberOfDays",
    "numberOfNights",
    "campingStyle",
    "waterAvailability",
    "waypoints",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  updateData.slug = slug;

  const [updated] = await db
    .update(backpacking)
    .set(updateData)
    .where(eq(backpacking.id, event.params.id))
    .returning();

  return json(updated);
};

export const DELETE: RequestHandler = async (event) => {
  const user = requireAuth(event);

  const entry = await db.query.backpacking.findFirst({
    where: eq(backpacking.id, event.params.id),
  });

  if (!entry) {
    throw error(404, "Backpacking not found");
  }

  if (entry.createdBy !== user.id && user.role !== "admin") {
    throw error(403, "Not authorized to delete this entry");
  }

  // Delete associated files from Vercel Blob and DB
  const entityFiles = await db.query.files.findMany({
    where: eq(files.entityId, event.params.id),
  });

  await Promise.allSettled(
    entityFiles.map((f) => {
      const pathname = new URL(f.fileUrl).pathname;
      return deleteFile(pathname);
    })
  );

  if (entityFiles.length > 0) {
    await db.delete(files).where(eq(files.entityId, event.params.id));
  }

  await db.delete(backpacking).where(eq(backpacking.id, event.params.id));

  return json({ success: true });
};
