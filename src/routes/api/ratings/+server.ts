import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { ratings, ratingAggregates } from "$lib/db/schemas";
import { eq, and, avg, count, sql, desc } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { sanitizeReview } from "$lib/utils/profanity-filter";
import { parseLimit, parseOffset } from "$lib/utils/pagination";

// GET /api/ratings?hike_id=xxx or ?camping_site_id=xxx or ?backpacking_id=xxx
// Returns all ratings for an entity (paginated)
export const GET: RequestHandler = async ({ url }) => {
  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");
  const backpackingId = url.searchParams.get("backpacking_id");
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));
  const withReviewsOnly = url.searchParams.get("reviews_only") === "true";

  if (!hikeId && !campingSiteId && !backpackingId) {
    throw error(400, "Either hike_id, camping_site_id, or backpacking_id is required");
  }

  const conditions = [];
  if (hikeId) conditions.push(eq(ratings.hikeId, hikeId));
  if (campingSiteId) conditions.push(eq(ratings.campingSiteId, campingSiteId));
  if (backpackingId) conditions.push(eq(ratings.backpackingId, backpackingId));
  if (withReviewsOnly) conditions.push(sql`${ratings.reviewText} IS NOT NULL`);

  const results = await db.query.ratings.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(ratings.createdAt)],
    limit,
    offset,
  });

  // Get aggregate stats
  const aggregateConditions = [];
  if (hikeId) aggregateConditions.push(eq(ratingAggregates.hikeId, hikeId));
  if (campingSiteId) aggregateConditions.push(eq(ratingAggregates.campingSiteId, campingSiteId));
  if (backpackingId) aggregateConditions.push(eq(ratingAggregates.backpackingId, backpackingId));

  const aggregate = await db.query.ratingAggregates.findFirst({
    where: aggregateConditions.length > 0 ? and(...aggregateConditions) : undefined,
  });

  return json(
    {
      ratings: results,
      aggregate: aggregate || {
        averageRating: null,
        totalRatings: 0,
        totalReviews: 0,
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
};

// POST /api/ratings - Create or update rating (upsert)
export const POST: RequestHandler = async ({ request, locals }) => {
  const user = requireAuth({ locals } as any);

  const body = await request.json();
  const { hikeId, campingSiteId, backpackingId, rating, reviewText } = body;

  // Validation
  if (!hikeId && !campingSiteId && !backpackingId) {
    throw error(400, "Either hikeId, campingSiteId, or backpackingId is required");
  }

  const entityCount = [hikeId, campingSiteId, backpackingId].filter(Boolean).length;
  if (entityCount > 1) {
    throw error(400, "Cannot rate more than one entity at once");
  }

  if (!rating || typeof rating !== "number") {
    throw error(400, "Rating is required and must be a number");
  }

  // Validate rating value (1.0, 1.5, 2.0, ..., 5.0)
  if (rating < 1.0 || rating > 5.0 || (rating * 2) % 1 !== 0) {
    throw error(400, "Rating must be between 1.0 and 5.0 in half-star increments");
  }

  // Sanitize review text
  let sanitizedReview: string | null = null;
  if (reviewText && typeof reviewText === "string") {
    const trimmed = reviewText.trim();
    if (trimmed.length > 0) {
      if (trimmed.length > 5000) {
        throw error(400, "Review cannot exceed 5,000 characters");
      }
      sanitizedReview = sanitizeReview(trimmed);
    }
  }

  // Upsert: insert or update if user already rated this entity
  const conflictTarget = hikeId
    ? [ratings.userId, ratings.hikeId]
    : backpackingId
      ? [ratings.userId, ratings.backpackingId]
      : [ratings.userId, ratings.campingSiteId];

  const [result] = await db
    .insert(ratings)
    .values({
      userId: user.id,
      hikeId: hikeId || null,
      campingSiteId: campingSiteId || null,
      backpackingId: backpackingId || null,
      rating: rating.toString(),
      reviewText: sanitizedReview,
    })
    .onConflictDoUpdate({
      target: conflictTarget,
      set: {
        rating: rating.toString(),
        reviewText: sanitizedReview,
        updatedAt: new Date(),
      },
    })
    .returning();

  // Update aggregates
  await updateRatingAggregates(hikeId, campingSiteId, backpackingId);

  return json(result);
};

// DELETE /api/ratings?hike_id=xxx or ?camping_site_id=xxx or ?backpacking_id=xxx
// Deletes the user's rating for an entity
export const DELETE: RequestHandler = async ({ url, locals }) => {
  const user = requireAuth({ locals } as any);

  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");
  const backpackingId = url.searchParams.get("backpacking_id");

  if (!hikeId && !campingSiteId && !backpackingId) {
    throw error(400, "Either hike_id, camping_site_id, or backpacking_id is required");
  }

  // Find the rating to delete
  const conditions = [eq(ratings.userId, user.id)];
  if (hikeId) conditions.push(eq(ratings.hikeId, hikeId));
  if (campingSiteId) conditions.push(eq(ratings.campingSiteId, campingSiteId));
  if (backpackingId) conditions.push(eq(ratings.backpackingId, backpackingId));

  const existing = await db.query.ratings.findFirst({
    where: and(...conditions),
  });

  if (!existing) {
    throw error(404, "Rating not found");
  }

  // Delete the rating
  await db.delete(ratings).where(eq(ratings.id, existing.id));

  // Update aggregates
  await updateRatingAggregates(hikeId, campingSiteId, backpackingId);

  return json({ success: true });
};

// Helper function to update aggregates (2-query upsert)
async function updateRatingAggregates(
  hikeId: string | null,
  campingSiteId: string | null,
  backpackingId: string | null = null
) {
  const conditions = [];
  if (hikeId) conditions.push(eq(ratings.hikeId, hikeId));
  if (campingSiteId) conditions.push(eq(ratings.campingSiteId, campingSiteId));
  if (backpackingId) conditions.push(eq(ratings.backpackingId, backpackingId));

  const stats = await db
    .select({
      avgRating: avg(ratings.rating),
      totalCount: count(),
      reviewCount: sql<number>`COUNT(CASE WHEN ${ratings.reviewText} IS NOT NULL THEN 1 END)`,
    })
    .from(ratings)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const { avgRating, totalCount, reviewCount } = stats[0];

  const conflictTarget = hikeId
    ? [ratingAggregates.hikeId]
    : backpackingId
      ? [ratingAggregates.backpackingId]
      : [ratingAggregates.campingSiteId];

  await db
    .insert(ratingAggregates)
    .values({
      hikeId: hikeId || null,
      campingSiteId: campingSiteId || null,
      backpackingId: backpackingId || null,
      averageRating: avgRating ? avgRating.toString() : null,
      totalRatings: totalCount,
      totalReviews: reviewCount,
    })
    .onConflictDoUpdate({
      target: conflictTarget,
      set: {
        averageRating: avgRating ? avgRating.toString() : null,
        totalRatings: totalCount,
        totalReviews: reviewCount,
      },
    });
}
