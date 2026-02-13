import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { hikes, addresses, ratingAggregates } from "$lib/db/schemas";
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
  const difficulty = url.searchParams.get("difficulty");
  const trailType = url.searchParams.get("trailType");
  const minDistance = url.searchParams.get("minDistance");
  const maxDistance = url.searchParams.get("maxDistance");
  const minRating = url.searchParams.get("minRating");
  const featuresParam = url.searchParams.get("features");
  const dogFriendly = url.searchParams.get("dogFriendly");

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

  // Filter by features (JSONB array contains)
  if (featuresParam) {
    const featureIds = featuresParam.split(",").filter(Boolean);
    if (featureIds.length > 0) {
      conditions.push(
        sql`${hikes.features} @> ${JSON.stringify(featureIds)}::jsonb`,
      );
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
    })
    .from(hikes)
    .leftJoin(addresses, eq(hikes.addressId, addresses.id));

  // Add rating join if filtering by rating
  if (minRating) {
    query = query.leftJoin(
      ratingAggregates,
      eq(hikes.id, ratingAggregates.hikeId),
    );
  }

  // Build where conditions
  const whereConditions = [...conditions];

  if (search) {
    whereConditions.push(
      or(
        ilike(hikes.name, `%${search}%`),
        ilike(hikes.description, `%${search}%`),
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
    .orderBy(desc(hikes.createdAt));

  const results = await query;

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
    minDistance ||
    maxDistance ||
    minRating ||
    featuresParam ||
    dogFriendly === "true" ||
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

  const [newHike] = await db
    .insert(hikes)
    .values({
      name,
      description: description || null,
      addressId: addressId || null,
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
      status: "pending",
      createdBy: user.id,
    })
    .returning();

  // Add to moderation queue
  await addToModerationQueue("hike", newHike.id);

  return json(newHike, { status: 201 });
};
