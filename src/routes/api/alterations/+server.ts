import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { alterations } from "$lib/db/schemas";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { addToModerationQueue } from "$lib/moderation";
import { isAllowedAlterationField } from "$lib/allowed-fields";
import { parseLimit, parseOffset } from "$lib/utils/pagination";

export const GET: RequestHandler = async ({ url }) => {
  const status = url.searchParams.get("status");
  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");
  const backpackingId = url.searchParams.get("backpacking_id");
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));

  const conditions = [];

  if (status) {
    conditions.push(eq(alterations.status, status as "pending" | "approved" | "rejected"));
  }

  if (hikeId) {
    conditions.push(eq(alterations.hikeId, hikeId));
  }

  if (campingSiteId) {
    conditions.push(eq(alterations.campingSiteId, campingSiteId));
  }

  if (backpackingId) {
    conditions.push(eq(alterations.backpackingId, backpackingId));
  }

  const results = await db.query.alterations.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    limit,
    offset,
    orderBy: [desc(alterations.createdAt)],
  });

  return json(results, { headers: { "Cache-Control": "no-store" } });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = requireAuth({ locals } as any);

  const body = await request.json();
  const { hikeId, campingSiteId, backpackingId, fieldName, oldValue, newValue, reason } = body;

  if (!fieldName || newValue === undefined || newValue === null) {
    throw error(400, "fieldName and newValue are required");
  }

  if (!hikeId && !campingSiteId && !backpackingId) {
    throw error(400, "Either hikeId, campingSiteId, or backpackingId is required");
  }

  const entityCount = [hikeId, campingSiteId, backpackingId].filter(Boolean).length;
  if (entityCount > 1) {
    throw error(400, "Cannot alter more than one entity at once");
  }

  // Validate fieldName against entity-specific allowlist to prevent
  // privilege escalation via fields like 'status', 'featured', 'createdBy'
  const entityType = hikeId ? "hike" : backpackingId ? "backpacking" : "campingSite";
  if (!isAllowedAlterationField(fieldName, entityType)) {
    throw error(400, `Field "${fieldName}" is not allowed for ${entityType} alterations`);
  }

  const [newAlteration] = await db
    .insert(alterations)
    .values({
      hikeId: hikeId || null,
      campingSiteId: campingSiteId || null,
      backpackingId: backpackingId || null,
      fieldName,
      oldValue,
      newValue,
      reason,
      status: "pending",
      submittedBy: user.id,
    })
    .returning();

  // Add to moderation queue
  await addToModerationQueue("alteration", newAlteration.id);

  return json(newAlteration, { status: 201 });
};
