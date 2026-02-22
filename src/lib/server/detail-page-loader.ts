import { getUserRole } from "$lib/auth";
import { db } from "$lib/db";
import { notes } from "$lib/db/schemas";
import { error } from "@sveltejs/kit";
import { and, count, eq } from "drizzle-orm";

export interface DetailPageData {
  entity: any;
  address: any;
  files: any[];
  userId: string | null;
  userRole: string;
  notesCount: number;
  ratingAggregate: {
    averageRating: number;
    totalRatings: number;
    totalReviews: number;
  } | null;
}

/**
 * Generic detail page loader for both hikes and camping sites
 */
export async function loadDetailPage(params: {
  entityId: string;
  entityType: "hike" | "camping_site";
  apiEndpoint: string;
  locals: App.Locals;
  fetch: typeof fetch;
}): Promise<Omit<DetailPageData, "entity"> & { [key: string]: any }> {
  const { entityId, entityType, apiEndpoint, locals, fetch } = params;

  // Fetch entity data from API
  const entity = await fetch(apiEndpoint).then((r) => {
    if (!r.ok) {
      const entityName = entityType === "hike" ? "Hike" : "Camping site";
      throw error(r.status, `${entityName} not found`);
    }
    return r.json();
  });

  // Fetch files
  const files = await fetch(`/api/files?entity_type=${entityType}&entity_id=${entityId}`).then(
    (r) => r.json()
  );

  // Extract address and rating aggregate from entity response
  const address = entity.address?.id != null ? entity.address : null;
  const rawAgg = entity.ratingAggregate;
  const ratingAggregate =
    rawAgg && rawAgg.averageRating != null
      ? {
          averageRating: parseFloat(rawAgg.averageRating),
          totalRatings: rawAgg.totalRatings ?? 0,
          totalReviews: rawAgg.totalReviews ?? 0,
        }
      : null;

  // Get user role if logged in
  let userRole = "member";
  if (locals.userId) {
    userRole = await getUserRole(locals.userId);
  }

  // Get notes count for this user and entity
  let notesCount = 0;
  if (locals.userId) {
    const noteIdField = entityType === "hike" ? notes.hikeId : notes.campingSiteId;
    const result = await db
      .select({ count: count() })
      .from(notes)
      .where(and(eq(notes.userId, locals.userId), eq(noteIdField, entityId)));
    notesCount = result[0]?.count || 0;
  }

  return {
    [entityType === "hike" ? "hike" : "campingSite"]: entity,
    address,
    files: files || [],
    userId: locals.userId || null,
    userRole,
    notesCount,
    ratingAggregate,
  };
}
