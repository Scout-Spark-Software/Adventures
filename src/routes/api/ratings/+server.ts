import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { ratings, ratingAggregates } from "$lib/db/schemas";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { sanitizeReview } from "$lib/utils/profanity-filter";
import { parseLimit, parseOffset } from "$lib/utils/pagination";
import { getAttributions } from "$lib/server/attribution";

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

  // Batch-resolve attribution for all reviewers
  const userIds = results.map((r) => r.userId);
  const attributionMap = userIds.length > 0 ? await getAttributions(userIds) : new Map();

  const ratingsWithAttribution = results.map((r) => {
    const attr = attributionMap.get(r.userId);
    return {
      ...r,
      submitterName: attr?.displayName ?? null,
      submitterUnit: attr?.unitLabel ?? null,
    };
  });

  // No CDN cache: response contains user attribution data that must reflect
  // the submitter's current privacy preference in real time.
  return json(
    {
      ratings: ratingsWithAttribution,
      aggregate: aggregate || {
        averageRating: null,
        totalRatings: 0,
        totalReviews: 0,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
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

  // Upsert: insert or update if user already rated this entity.
  // The unique indexes are partial (WHERE hike_id IS NOT NULL etc.), so we must
  // supply targetWhere to match the exact partial index Postgres should use.
  const conflictConfig = hikeId
    ? {
        target: [ratings.userId, ratings.hikeId],
        targetWhere: sql`${ratings.hikeId} IS NOT NULL`,
      }
    : backpackingId
      ? {
          target: [ratings.userId, ratings.backpackingId],
          targetWhere: sql`${ratings.backpackingId} IS NOT NULL`,
        }
      : {
          target: [ratings.userId, ratings.campingSiteId],
          targetWhere: sql`${ratings.campingSiteId} IS NOT NULL`,
        };

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
      target: conflictConfig.target,
      targetWhere: conflictConfig.targetWhere,
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

// Atomically recompute and upsert rating aggregates for one entity using a
// single INSERT ... SELECT ... ON CONFLICT DO UPDATE statement, eliminating
// the race window that existed between the old two-query approach.
async function updateRatingAggregates(
  hikeId: string | null,
  campingSiteId: string | null,
  backpackingId: string | null = null
) {
  if (hikeId) {
    await db.execute(sql`
      INSERT INTO rating_aggregates (hike_id, average_rating, total_ratings, total_reviews)
      SELECT
        ${hikeId}::uuid,
        CAST(AVG(rating::numeric) AS text),
        COUNT(*)::integer,
        COUNT(review_text)::integer
      FROM ratings
      WHERE hike_id = ${hikeId}::uuid
      ON CONFLICT (hike_id) DO UPDATE SET
        average_rating = EXCLUDED.average_rating,
        total_ratings  = EXCLUDED.total_ratings,
        total_reviews  = EXCLUDED.total_reviews
    `);
  } else if (campingSiteId) {
    await db.execute(sql`
      INSERT INTO rating_aggregates (camping_site_id, average_rating, total_ratings, total_reviews)
      SELECT
        ${campingSiteId}::uuid,
        CAST(AVG(rating::numeric) AS text),
        COUNT(*)::integer,
        COUNT(review_text)::integer
      FROM ratings
      WHERE camping_site_id = ${campingSiteId}::uuid
      ON CONFLICT (camping_site_id) DO UPDATE SET
        average_rating = EXCLUDED.average_rating,
        total_ratings  = EXCLUDED.total_ratings,
        total_reviews  = EXCLUDED.total_reviews
    `);
  } else if (backpackingId) {
    await db.execute(sql`
      INSERT INTO rating_aggregates (backpacking_id, average_rating, total_ratings, total_reviews)
      SELECT
        ${backpackingId}::uuid,
        CAST(AVG(rating::numeric) AS text),
        COUNT(*)::integer,
        COUNT(review_text)::integer
      FROM ratings
      WHERE backpacking_id = ${backpackingId}::uuid
      ON CONFLICT (backpacking_id) DO UPDATE SET
        average_rating = EXCLUDED.average_rating,
        total_ratings  = EXCLUDED.total_ratings,
        total_reviews  = EXCLUDED.total_reviews
    `);
  }
}
