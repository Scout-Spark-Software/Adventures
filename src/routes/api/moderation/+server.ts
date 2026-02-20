import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { moderationQueue, hikes, campingSites, alterations, VALID_STATUSES } from "$lib/db/schemas";
import { eq, and, desc, inArray } from "drizzle-orm";
import { requireModerator } from "$lib/auth/middleware";
import { parseLimit, parseOffset } from "$lib/utils/pagination";

export const GET: RequestHandler = async ({ url, locals }) => {
  await requireModerator({ locals } as any);

  const status = url.searchParams.get("status") || "pending";
  const entityType = url.searchParams.get("entity_type") as
    | "hike"
    | "camping_site"
    | "alteration"
    | null;
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));

  const conditions = [eq(moderationQueue.status, status as "pending" | "approved" | "rejected")];

  if (entityType) {
    conditions.push(eq(moderationQueue.entityType, entityType));
  }

  const queueItems = await db.query.moderationQueue.findMany({
    where: and(...conditions),
    limit,
    offset,
    orderBy: [desc(moderationQueue.createdAt)],
  });

  // Batch-fetch entities grouped by type (avoids N+1)
  const hikeIds = queueItems.filter((i) => i.entityType === "hike").map((i) => i.entityId);
  const campingIds = queueItems
    .filter((i) => i.entityType === "camping_site")
    .map((i) => i.entityId);
  const alterationIds = queueItems
    .filter((i) => i.entityType === "alteration")
    .map((i) => i.entityId);

  const [hikeRows, campingRows, alterationRows] = await Promise.all([
    hikeIds.length > 0 ? db.query.hikes.findMany({ where: inArray(hikes.id, hikeIds) }) : [],
    campingIds.length > 0
      ? db.query.campingSites.findMany({
          where: inArray(campingSites.id, campingIds),
        })
      : [],
    alterationIds.length > 0
      ? db.query.alterations.findMany({
          where: inArray(alterations.id, alterationIds),
        })
      : [],
  ]);

  const entityMap = new Map<string, unknown>();
  for (const h of hikeRows) entityMap.set(h.id, h);
  for (const c of campingRows) entityMap.set(c.id, c);
  for (const a of alterationRows) entityMap.set(a.id, a);

  const enrichedItems = queueItems.map((item) => ({
    ...item,
    entity: entityMap.get(item.entityId) ?? null,
  }));

  return json(enrichedItems);
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  await requireModerator({ locals } as any);

  const user = locals.user!;

  const body = await request.json();
  const { entityType, entityId, status } = body;

  if (!entityType || !entityId || !status) {
    throw error(400, "entityType, entityId, and status are required");
  }

  const allowedReviewStatuses = VALID_STATUSES.filter((s) => s !== "pending");
  if (!allowedReviewStatuses.includes(status)) {
    throw error(400, 'status must be "approved" or "rejected"');
  }

  // Atomically update both the moderation queue and the entity status
  const queueUpdate = db
    .update(moderationQueue)
    .set({
      status,
      reviewedBy: user.id,
      reviewedAt: new Date(),
    })
    .where(and(eq(moderationQueue.entityType, entityType), eq(moderationQueue.entityId, entityId)));

  let entityUpdate;
  if (entityType === "hike") {
    entityUpdate = db
      .update(hikes)
      .set({ status, updatedAt: new Date() })
      .where(eq(hikes.id, entityId));
  } else if (entityType === "camping_site") {
    entityUpdate = db
      .update(campingSites)
      .set({ status, updatedAt: new Date() })
      .where(eq(campingSites.id, entityId));
  } else {
    entityUpdate = db
      .update(alterations)
      .set({ status, reviewedBy: user.id, reviewedAt: new Date() })
      .where(eq(alterations.id, entityId));
  }

  await db.batch([queueUpdate, entityUpdate]);

  return json({ success: true });
};
