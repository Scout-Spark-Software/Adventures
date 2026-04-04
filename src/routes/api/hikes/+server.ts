import { isPrivilegedUser, parseStatusParam } from "$lib/auth/helpers";
import { requireAuth } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { addresses, hikes, ratingAggregates } from "$lib/db/schemas";
import { addToModerationQueue } from "$lib/moderation";
import { generateUniqueSlug } from "$lib/server/slug";
import { sanitizeSearchQuery, validateNumericParam } from "$lib/security";
import { parseLimit, parseOffset } from "$lib/utils/pagination";
import { error, json } from "@sveltejs/kit";
import { and, count, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  const status = url.searchParams.get("status");
  const featured = url.searchParams.get("featured");
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));

  // New filter parameters
  const searchRaw = url.searchParams.get("search");
  const search = searchRaw ? sanitizeSearchQuery(searchRaw) : null;
  const difficulty = url.searchParams.get("difficulty");
  const trailType = url.searchParams.get("trailType");
  const minDistanceVal = validateNumericParam(url.searchParams.get("minDistance"), 0, 10000);
  const maxDistanceVal = validateNumericParam(url.searchParams.get("maxDistance"), 0, 10000);
  const minRatingVal = validateNumericParam(url.searchParams.get("minRating"), 0, 5);
  // Keep string versions for backward-compat with existing Drizzle filter expressions
  const minDistance = minDistanceVal !== null ? String(minDistanceVal) : null;
  const maxDistance = maxDistanceVal !== null ? String(maxDistanceVal) : null;
  const minRating = minRatingVal !== null ? String(minRatingVal) : null;
  const featuresParam = url.searchParams.get("features");
  const dogFriendly = url.searchParams.get("dogFriendly");
  const councilId = url.searchParams.get("councilId");

  const conditions = [];

  const privileged = isPrivilegedUser(locals.user);
  const validatedStatus = parseStatusParam(status, privileged);

  if (validatedStatus) {
    conditions.push(eq(hikes.status, validatedStatus));
  } else if (!privileged) {
    // By default, only show approved hikes to non-admins/moderators
    conditions.push(eq(hikes.status, "approved"));
  }

  if (featured === "true") {
    conditions.push(eq(hikes.featured, true));
    // Featured items must also be approved
    conditions.push(eq(hikes.status, "approved"));
  }

  // Filter by difficulty
  if (difficulty) {
    conditions.push(eq(hikes.difficulty, difficulty as any));
  }

  // Filter by trail type
  if (trailType) {
    conditions.push(eq(hikes.trailType, trailType as any));
  }

  // Filter by distance range
  if (minDistance) {
    conditions.push(gte(hikes.distance, minDistance));
  }
  if (maxDistance) {
    conditions.push(lte(hikes.distance, maxDistance));
  }

  // Filter by dog friendly
  if (dogFriendly === "true") {
    conditions.push(eq(hikes.dogFriendly, true));
  }

  // Filter by council
  if (councilId) {
    conditions.push(eq(hikes.councilId, councilId));
  }

  // Filter by features (JSONB array contains)
  if (featuresParam) {
    const featureIds = featuresParam.split(",").filter(Boolean);
    if (featureIds.length > 0) {
      conditions.push(sql`${hikes.features} @> ${JSON.stringify(featureIds)}::jsonb`);
    }
  }

  // Always join with addresses to include location data
  let query = db
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
    .leftJoin(addresses, eq(hikes.addressId, addresses.id));

  // Add rating join if filtering by rating
  if (minRating) {
    query = query.leftJoin(ratingAggregates, eq(hikes.id, ratingAggregates.hikeId));
  }

  // Build where conditions
  const whereConditions = [...conditions];

  if (search) {
    // Use full-text search with plainto_tsquery for better performance
    // Search both hikes content and address location
    const searchQuery = search.trim();
    whereConditions.push(
      or(
        sql`${hikes}.search_vector @@ plainto_tsquery('english', ${searchQuery})`,
        sql`${addresses}.search_vector @@ plainto_tsquery('english', ${searchQuery})`
      )!
    );
  }

  if (minRating) {
    whereConditions.push(sql`${ratingAggregates.averageRating} IS NOT NULL`);
    whereConditions.push(gte(ratingAggregates.averageRating, minRating));
  }

  const finalQuery = query
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(hikes.createdAt));

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  let countQuery = db
    .select({ total: count() })
    .from(hikes)
    .leftJoin(addresses, eq(hikes.addressId, addresses.id));
  if (minRating) {
    countQuery = countQuery.leftJoin(ratingAggregates, eq(hikes.id, ratingAggregates.hikeId));
  }

  const [results, [{ total }]] = await Promise.all([finalQuery, countQuery.where(whereClause)]);

  const response = { data: results, total };

  if (featured === "true" && !privileged) {
    return json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  }

  const hasFilters =
    search ||
    difficulty ||
    trailType ||
    minDistance ||
    maxDistance ||
    minRating ||
    featuresParam ||
    dogFriendly === "true" ||
    councilId ||
    limit !== 50 ||
    offset !== 0;
  if (!privileged && !hasFilters) {
    return json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  }

  if (!privileged) {
    return json(response, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
    });
  }
  return json(response, { headers: { "Cache-Control": "no-store" } });
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
  } = body;

  if (!name) {
    throw error(400, "Name is required");
  }

  const slug = await generateUniqueSlug(name, "hike");

  const [newHike] = await db
    .insert(hikes)
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
      slug,
      status: "pending",
      createdBy: user.id,
    })
    .returning();

  // Add to moderation queue
  await addToModerationQueue("hike", newHike.id);

  return json(newHike, { status: 201 });
};
