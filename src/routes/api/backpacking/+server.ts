import { isPrivilegedUser, parseStatusParam } from "$lib/auth/helpers";
import { requireAuth } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { addresses, backpacking, ratingAggregates } from "$lib/db/schemas";
import { addToModerationQueue } from "$lib/moderation";
import { sanitizeSearchQuery, validateNumericParam } from "$lib/security";
import { parseLimit, parseOffset } from "$lib/utils/pagination";
import { error, json } from "@sveltejs/kit";
import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  const status = url.searchParams.get("status");
  const featured = url.searchParams.get("featured");
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));

  const searchRaw = url.searchParams.get("search");
  const search = searchRaw ? sanitizeSearchQuery(searchRaw) : null;
  const difficulty = url.searchParams.get("difficulty");
  const trailType = url.searchParams.get("trailType");
  const campingStyle = url.searchParams.get("campingStyle");
  const minDistanceVal = validateNumericParam(url.searchParams.get("minDistance"), 0, 10000);
  const maxDistanceVal = validateNumericParam(url.searchParams.get("maxDistance"), 0, 10000);
  const minRatingVal = validateNumericParam(url.searchParams.get("minRating"), 0, 5);
  const minDistance = minDistanceVal !== null ? String(minDistanceVal) : null;
  const maxDistance = maxDistanceVal !== null ? String(maxDistanceVal) : null;
  const minRating = minRatingVal !== null ? String(minRatingVal) : null;
  const minDaysRaw = url.searchParams.get("minDays");
  const maxDaysRaw = url.searchParams.get("maxDays");
  const minDaysVal = validateNumericParam(minDaysRaw, 0, 365);
  const maxDaysVal = validateNumericParam(maxDaysRaw, 0, 365);
  const minDays = minDaysVal !== null ? String(minDaysVal) : null;
  const maxDays = maxDaysVal !== null ? String(maxDaysVal) : null;
  const dogFriendly = url.searchParams.get("dogFriendly");
  const councilId = url.searchParams.get("councilId");

  const conditions = [];

  const privileged = isPrivilegedUser(locals.user);
  const validatedStatus = parseStatusParam(status, privileged);

  if (validatedStatus) {
    conditions.push(eq(backpacking.status, validatedStatus));
  } else if (!privileged) {
    conditions.push(eq(backpacking.status, "approved"));
  }

  if (featured === "true") {
    conditions.push(eq(backpacking.featured, true));
    conditions.push(eq(backpacking.status, "approved"));
  }

  if (difficulty) {
    conditions.push(eq(backpacking.difficulty, difficulty as any));
  }

  if (trailType) {
    conditions.push(eq(backpacking.trailType, trailType as any));
  }

  if (campingStyle) {
    conditions.push(eq(backpacking.campingStyle, campingStyle as any));
  }

  if (minDistance) {
    conditions.push(gte(backpacking.distance, minDistance));
  }

  if (maxDistance) {
    conditions.push(lte(backpacking.distance, maxDistance));
  }

  if (minDaysVal !== null) {
    conditions.push(gte(backpacking.numberOfDays, minDaysVal));
  }

  if (maxDaysVal !== null) {
    conditions.push(lte(backpacking.numberOfDays, maxDaysVal));
  }

  if (dogFriendly === "true") {
    conditions.push(eq(backpacking.dogFriendly, true));
  }

  // Filter by council
  if (councilId) {
    conditions.push(eq(backpacking.councilId, councilId));
  }

  let query = db
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
    .leftJoin(addresses, eq(backpacking.addressId, addresses.id));

  if (minRating) {
    query = query.leftJoin(ratingAggregates, eq(backpacking.id, ratingAggregates.backpackingId));
  }

  const whereConditions = [...conditions];

  if (search) {
    const searchQuery = search.trim();
    whereConditions.push(
      or(
        sql`${backpacking}.search_vector @@ plainto_tsquery('english', ${searchQuery})`,
        sql`${addresses}.search_vector @@ plainto_tsquery('english', ${searchQuery})`
      )!
    );
  }

  if (minRating) {
    whereConditions.push(sql`${ratingAggregates.averageRating} IS NOT NULL`);
    whereConditions.push(gte(ratingAggregates.averageRating, minRating));
  }

  const results = await query
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(backpacking.createdAt));

  if (featured === "true" && !privileged) {
    return json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }

  const hasFilters =
    search ||
    difficulty ||
    trailType ||
    campingStyle ||
    minDistance ||
    maxDistance ||
    minDays ||
    maxDays ||
    minRating ||
    dogFriendly === "true" ||
    councilId ||
    limit !== 50 ||
    offset !== 0;

  if (!privileged && !hasFilters) {
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
    councilId,
    difficulty,
    distance,
    distanceUnit,
    duration,
    durationUnit,
    elevation,
    elevationUnit,
    trailType,
    features,
    permitsRequired,
    bestSeason,
    waterSources,
    parkingInfo,
    dogFriendly,
    numberOfDays,
    numberOfNights,
    campingStyle,
    resupplyPoints,
    waterAvailability,
    waypoints,
  } = body;

  if (!name) {
    throw error(400, "Name is required");
  }

  const [newEntry] = await db
    .insert(backpacking)
    .values({
      name,
      description: description || null,
      addressId: addressId || null,
      councilId: councilId || null,
      difficulty: difficulty || null,
      distance: distance || null,
      distanceUnit: distanceUnit || "miles",
      duration: duration || null,
      durationUnit: durationUnit || "hours",
      elevation: elevation || null,
      elevationUnit: elevationUnit || "feet",
      trailType: trailType || null,
      features: features ? JSON.parse(JSON.stringify(features)) : null,
      permitsRequired: permitsRequired || null,
      bestSeason: bestSeason ? JSON.parse(JSON.stringify(bestSeason)) : null,
      waterSources: waterSources === true,
      parkingInfo: parkingInfo || null,
      dogFriendly: dogFriendly === true,
      numberOfDays: numberOfDays || null,
      numberOfNights: numberOfNights || null,
      campingStyle: campingStyle || null,
      resupplyPoints: resupplyPoints ? JSON.parse(JSON.stringify(resupplyPoints)) : null,
      waterAvailability: waterAvailability || null,
      waypoints: waypoints ? JSON.parse(JSON.stringify(waypoints)) : null,
      status: "pending",
      createdBy: user.id,
    })
    .returning();

  await addToModerationQueue("backpacking", newEntry.id);

  return json(newEntry, { status: 201 });
};
