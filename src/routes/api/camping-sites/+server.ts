import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { campingSites, addresses, ratingAggregates } from "$lib/db/schemas";
import { eq, and, or, desc, ilike, gte, lte, sql } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { isPrivilegedUser, parseStatusParam } from "$lib/auth/helpers";
import { addToModerationQueue } from "$lib/moderation";

export const GET: RequestHandler = async ({ url, locals }) => {
  const status = url.searchParams.get("status");
  const featured = url.searchParams.get("featured");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  // New filter parameters
  const search = url.searchParams.get("search");
  const siteType = url.searchParams.get("siteType");
  const petPolicy = url.searchParams.get("petPolicy");
  const firePolicy = url.searchParams.get("firePolicy");
  const minCost = url.searchParams.get("minCost");
  const maxCost = url.searchParams.get("maxCost");
  const minRating = url.searchParams.get("minRating");
  const amenitiesParam = url.searchParams.get("amenities");
  const facilitiesParam = url.searchParams.get("facilities");
  const reservationRequired = url.searchParams.get("reservationRequired");

  const conditions = [];

  const privileged = isPrivilegedUser(locals.user);
  const validatedStatus = parseStatusParam(status, privileged);

  if (validatedStatus) {
    conditions.push(eq(campingSites.status, validatedStatus));
  } else if (!privileged) {
    // By default, only show approved camping sites to non-admins/moderators
    conditions.push(eq(campingSites.status, "approved"));
  }

  if (featured === "true") {
    conditions.push(eq(campingSites.featured, true));
    // Featured items must also be approved
    conditions.push(eq(campingSites.status, "approved"));
  }

  // Filter by site type
  if (siteType) {
    conditions.push(eq(campingSites.siteType, siteType as any));
  }

  // Filter by pet policy
  if (petPolicy) {
    conditions.push(eq(campingSites.petPolicy, petPolicy as any));
  }

  // Filter by fire policy
  if (firePolicy) {
    conditions.push(eq(campingSites.firePolicy, firePolicy as any));
  }

  // Filter by cost range
  if (minCost) {
    conditions.push(gte(campingSites.costPerNight, minCost));
  }
  if (maxCost) {
    conditions.push(lte(campingSites.costPerNight, maxCost));
  }

  // Filter by reservation required
  if (reservationRequired === "true") {
    conditions.push(eq(campingSites.reservationRequired, true));
  }

  // Filter by amenities (JSONB array contains)
  if (amenitiesParam) {
    const amenityIds = amenitiesParam.split(",").filter(Boolean);
    if (amenityIds.length > 0) {
      conditions.push(
        sql`${campingSites.amenities} @> ${JSON.stringify(amenityIds)}::jsonb`,
      );
    }
  }

  // Filter by facilities (JSONB array contains)
  if (facilitiesParam) {
    const facilityIds = facilitiesParam.split(",").filter(Boolean);
    if (facilityIds.length > 0) {
      conditions.push(
        sql`${campingSites.facilities} @> ${JSON.stringify(facilityIds)}::jsonb`,
      );
    }
  }

  // Always join with addresses to include location data
  let query = db
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
    .leftJoin(addresses, eq(campingSites.addressId, addresses.id));

  // Add rating join if filtering by rating
  if (minRating) {
    query = query.leftJoin(
      ratingAggregates,
      eq(campingSites.id, ratingAggregates.campingSiteId),
    );
  }

  // Build where conditions
  const whereConditions = [...conditions];

  if (search) {
    whereConditions.push(
      or(
        ilike(campingSites.name, `%${search}%`),
        ilike(campingSites.description, `%${search}%`),
        ilike(addresses.city, `%${search}%`),
        ilike(addresses.state, `%${search}%`),
      ),
    );
  }

  if (minRating) {
    whereConditions.push(sql`${ratingAggregates.averageRating} IS NOT NULL`);
    whereConditions.push(gte(ratingAggregates.averageRating, minRating));
  }

  query = query
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(campingSites.createdAt));

  const results = await query;

  if (featured === "true" && !privileged) {
    return json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }

  if (!privileged && !search) {
    return json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  }

  return json(results);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = requireAuth({ locals } as any);

  const body = await request.json();
  const {
    name,
    description,
    addressId,
    capacity,
    amenities,
    facilities,
    reservationInfo,
    costPerNight,
    baseFee,
    operatingSeasonStart,
    operatingSeasonEnd,
    petPolicy,
    reservationRequired,
    siteType,
    firePolicy,
  } = body;

  if (!name) {
    throw error(400, "Name is required");
  }

  const [newCampingSite] = await db
    .insert(campingSites)
    .values({
      name,
      description: description || null,
      addressId: addressId || null,
      capacity: capacity || null,
      amenities: amenities ? JSON.parse(JSON.stringify(amenities)) : null,
      facilities: facilities ? JSON.parse(JSON.stringify(facilities)) : null,
      reservationInfo: reservationInfo || null,
      costPerNight: costPerNight || null,
      baseFee: baseFee || null,
      operatingSeasonStart: operatingSeasonStart || null,
      operatingSeasonEnd: operatingSeasonEnd || null,
      petPolicy,
      reservationRequired: reservationRequired || false,
      siteType,
      firePolicy,
      status: "pending",
      createdBy: user.id,
    })
    .returning();

  // Add to moderation queue
  await addToModerationQueue("camping_site", newCampingSite.id);

  return json(newCampingSite, { status: 201 });
};
