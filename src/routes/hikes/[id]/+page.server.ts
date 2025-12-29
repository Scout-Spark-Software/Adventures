import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/db";
import { addresses, notes, ratingAggregates } from "$lib/db/schemas";
import { eq, and, count } from "drizzle-orm";
import { getUserRole } from "$lib/auth";

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
  const hike = await fetch(`/api/hikes/${params.id}`).then((r) => {
    if (!r.ok) throw error(r.status, "Hike not found");
    return r.json();
  });

  const files = await fetch(
    `/api/files?entity_type=hike&entity_id=${params.id}`,
  ).then((r) => r.json());

  // Fetch address if addressId exists
  let address = null;
  if (hike.addressId) {
    address = await db.query.addresses.findFirst({
      where: eq(addresses.id, hike.addressId),
    });
  }

  // Get user role if logged in
  let userRole = "user";
  if (locals.userId) {
    userRole = await getUserRole(locals.userId);
  }

  // Get notes count for this user and hike
  let notesCount = 0;
  if (locals.userId) {
    const result = await db
      .select({ count: count() })
      .from(notes)
      .where(and(eq(notes.userId, locals.userId), eq(notes.hikeId, params.id)));
    notesCount = result[0]?.count || 0;
  }

  // Get rating aggregate
  let ratingAggregate = null;
  const aggregate = await db.query.ratingAggregates.findFirst({
    where: eq(ratingAggregates.hikeId, params.id),
  });
  if (aggregate) {
    ratingAggregate = {
      averageRating: aggregate.averageRating
        ? parseFloat(aggregate.averageRating)
        : null,
      totalRatings: aggregate.totalRatings,
      totalReviews: aggregate.totalReviews,
    };
  }

  return {
    hike,
    address,
    files: files || [],
    userId: locals.userId || null,
    userRole,
    notesCount,
    ratingAggregate,
  };
};
