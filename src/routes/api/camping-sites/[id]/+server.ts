import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { campingSites, addresses, ratingAggregates, files, councils, moderationQueue } from "$lib/db/schemas";
import { eq, sql, and } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { isPrivilegedUser } from "$lib/auth/helpers";
import { deleteFile } from "$lib/storage/blob";
import { getAttribution } from "$lib/server/attribution";
import { generateUniqueSlug } from "$lib/server/slug";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const GET: RequestHandler = async ({ params, locals }) => {
  const isUuid = UUID_RE.test(params.id);
  const rows = await db
    .select({
      id: campingSites.id,
      slug: campingSites.slug,
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
      councilId: campingSites.councilId,
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
        WHERE entity_id = ${campingSites.id}
          AND entity_type = 'camping_site'
          AND file_type = 'image'
        ORDER BY is_banner DESC, created_at ASC
        LIMIT 1
      )`.as("banner_image_url"),
    })
    .from(campingSites)
    .leftJoin(addresses, eq(campingSites.addressId, addresses.id))
    .leftJoin(councils, eq(campingSites.councilId, councils.id))
    .leftJoin(ratingAggregates, eq(campingSites.id, ratingAggregates.campingSiteId))
    .where(isUuid ? eq(campingSites.id, params.id) : eq(campingSites.slug, params.id))
    .limit(1);

  const campingSite = rows[0];

  if (!campingSite) {
    throw error(404, "Camping site not found");
  }

  // Only show approved camping sites to non-admins/moderators
  if (!isPrivilegedUser(locals.user) && campingSite.status !== "approved") {
    throw error(404, "Camping site not found");
  }

  // Normalize LEFT JOIN results: null out nested objects when join missed
  const result = {
    ...campingSite,
    address: campingSite.address?.id != null ? campingSite.address : null,
    council: campingSite.council?.id != null ? campingSite.council : null,
    ratingAggregate:
      campingSite.ratingAggregate?.averageRating != null
        ? {
            averageRating: campingSite.ratingAggregate.averageRating,
            totalRatings: campingSite.ratingAggregate.totalRatings ?? 0,
            totalReviews: campingSite.ratingAggregate.totalReviews ?? 0,
          }
        : null,
  };

  const attribution = await getAttribution(campingSite.createdBy);
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
    "councilId",
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

  let slug = campingSite.slug;
  if (body.name && body.name !== campingSite.name) {
    slug = await generateUniqueSlug(body.name, "camping_site", campingSite.id);
  }
  updateData.slug = slug;

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

  // Delete associated files from R2 and DB
  const entityFiles = await db.query.files.findMany({
    where: eq(files.entityId, event.params.id),
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
    await db.delete(files).where(eq(files.entityId, event.params.id));
  }

  await db.delete(campingSites).where(eq(campingSites.id, event.params.id));
  await db
    .delete(moderationQueue)
    .where(
      and(
        eq(moderationQueue.entityType, "camping_site"),
        eq(moderationQueue.entityId, event.params.id)
      )
    );

  return json({ success: true });
};
