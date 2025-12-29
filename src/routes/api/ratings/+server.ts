import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { ratings, ratingAggregates } from "$lib/db/schemas";
import { eq, and, avg, count, sql, desc } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { sanitizeReview } from "$lib/utils/profanity-filter";

// GET /api/ratings?hike_id=xxx or ?camping_site_id=xxx
// Returns all ratings for an entity (paginated)
export const GET: RequestHandler = async ({ url }) => {
  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const withReviewsOnly = url.searchParams.get("reviews_only") === "true";

  if (!hikeId && !campingSiteId) {
    throw error(400, "Either hike_id or camping_site_id is required");
  }

  const conditions = [];
  if (hikeId) conditions.push(eq(ratings.hikeId, hikeId));
  if (campingSiteId) conditions.push(eq(ratings.campingSiteId, campingSiteId));
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
  if (campingSiteId)
    aggregateConditions.push(eq(ratingAggregates.campingSiteId, campingSiteId));

  const aggregate = await db.query.ratingAggregates.findFirst({
    where: aggregateConditions.length > 0 ? and(...aggregateConditions) : undefined,
  });

  return json({
    ratings: results,
    aggregate: aggregate || {
      averageRating: null,
      totalRatings: 0,
      totalReviews: 0,
    },
  });
};

// POST /api/ratings - Create or update rating (upsert)
export const POST: RequestHandler = async ({ request, locals }) => {
  const user = requireAuth({ locals } as any);

  const body = await request.json();
  const { hikeId, campingSiteId, rating, reviewText } = body;

  // Validation
  if (!hikeId && !campingSiteId) {
    throw error(400, "Either hikeId or campingSiteId is required");
  }

  if (hikeId && campingSiteId) {
    throw error(400, "Cannot rate both hike and camping site at once");
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

  // Check if rating already exists
  const existingConditions = [eq(ratings.userId, user.id)];
  if (hikeId) existingConditions.push(eq(ratings.hikeId, hikeId));
  if (campingSiteId) existingConditions.push(eq(ratings.campingSiteId, campingSiteId));

  const existing = await db.query.ratings.findFirst({
    where: and(...existingConditions),
  });

  let result;

  if (existing) {
    // Update existing rating
    const [updated] = await db
      .update(ratings)
      .set({
        rating: rating.toString(),
        reviewText: sanitizedReview,
        updatedAt: new Date(),
      })
      .where(eq(ratings.id, existing.id))
      .returning();
    result = updated;
  } else {
    // Create new rating
    const [newRating] = await db
      .insert(ratings)
      .values({
        userId: user.id,
        hikeId: hikeId || null,
        campingSiteId: campingSiteId || null,
        rating: rating.toString(),
        reviewText: sanitizedReview,
      })
      .returning();
    result = newRating;
  }

  // Update aggregates
  await updateRatingAggregates(hikeId, campingSiteId);

  return json(result, { status: existing ? 200 : 201 });
};

// Helper function to update aggregates
async function updateRatingAggregates(
  hikeId: string | null,
  campingSiteId: string | null
) {
  const conditions = [];
  if (hikeId) conditions.push(eq(ratings.hikeId, hikeId));
  if (campingSiteId) conditions.push(eq(ratings.campingSiteId, campingSiteId));

  const stats = await db
    .select({
      avgRating: avg(ratings.rating),
      totalCount: count(),
      reviewCount: sql<number>`COUNT(CASE WHEN ${ratings.reviewText} IS NOT NULL THEN 1 END)`,
    })
    .from(ratings)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const { avgRating, totalCount, reviewCount } = stats[0];

  const aggregateConditions = [];
  if (hikeId) aggregateConditions.push(eq(ratingAggregates.hikeId, hikeId));
  if (campingSiteId)
    aggregateConditions.push(eq(ratingAggregates.campingSiteId, campingSiteId));

  const existingAggregate = await db.query.ratingAggregates.findFirst({
    where: aggregateConditions.length > 0 ? and(...aggregateConditions) : undefined,
  });

  if (existingAggregate) {
    await db
      .update(ratingAggregates)
      .set({
        averageRating: avgRating ? avgRating.toString() : null,
        totalRatings: totalCount,
        totalReviews: reviewCount,
      })
      .where(eq(ratingAggregates.id, existingAggregate.id));
  } else {
    await db.insert(ratingAggregates).values({
      hikeId: hikeId || null,
      campingSiteId: campingSiteId || null,
      averageRating: avgRating ? avgRating.toString() : null,
      totalRatings: totalCount,
      totalReviews: reviewCount,
    });
  }
}
