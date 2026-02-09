import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { alterations, hikes, campingSites } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAuth, requireModerator } from "$lib/auth/middleware";
import { updateModerationStatus } from "$lib/moderation";
import { isAllowedAlterationField } from "$lib/allowed-fields";

export const GET: RequestHandler = async ({ params }) => {
  const alteration = await db.query.alterations.findFirst({
    where: eq(alterations.id, params.id),
  });

  if (!alteration) {
    throw error(404, "Alteration not found");
  }

  return json(alteration);
};

export const PUT: RequestHandler = async (event) => {
  const user = requireModerator(event);

  const body = await event.request.json();
  const { status, apply } = body;

  if (!status || !["approved", "rejected"].includes(status)) {
    throw error(400, 'status must be "approved" or "rejected"');
  }

  const alteration = await db.query.alterations.findFirst({
    where: eq(alterations.id, event.params.id),
  });

  if (!alteration) {
    throw error(404, "Alteration not found");
  }

  // If approving with apply, validate fieldName BEFORE persisting status changes
  if (status === "approved" && apply) {
    // Ensure exactly one foreign key is set
    const hasHikeId = !!alteration.hikeId;
    const hasCampingSiteId = !!alteration.campingSiteId;
    if (hasHikeId === hasCampingSiteId) {
      throw error(500, "Alteration has invalid foreign key configuration");
    }

    const entityType = hasHikeId ? "hike" : "campingSite";
    if (
      !isAllowedAlterationField(
        alteration.fieldName,
        entityType as "hike" | "campingSite",
      )
    ) {
      throw error(
        400,
        `Cannot apply alteration: field "${alteration.fieldName}" is not allowed for ${entityType}`,
      );
    }
  }

  // Update moderation status
  await updateModerationStatus("alteration", alteration.id, status, user.id);

  // Update alteration record
  const [updatedAlteration] = await db
    .update(alterations)
    .set({
      status,
      reviewedBy: user.id,
      reviewedAt: new Date(),
    })
    .where(eq(alterations.id, event.params.id))
    .returning();

  // Apply the approved alteration to the entity
  if (status === "approved" && apply) {
    if (alteration.hikeId) {
      await db
        .update(hikes)
        .set({
          [alteration.fieldName]: alteration.newValue,
          updatedAt: new Date(),
        })
        .where(eq(hikes.id, alteration.hikeId));
    } else if (alteration.campingSiteId) {
      await db
        .update(campingSites)
        .set({
          [alteration.fieldName]: alteration.newValue,
          updatedAt: new Date(),
        })
        .where(eq(campingSites.id, alteration.campingSiteId));
    }
  }

  return json(updatedAlteration);
};

export const DELETE: RequestHandler = async (event) => {
  const user = requireAuth(event);

  const alteration = await db.query.alterations.findFirst({
    where: eq(alterations.id, event.params.id),
  });

  if (!alteration) {
    throw error(404, "Alteration not found");
  }

  // Only creator or admin can delete
  if (alteration.submittedBy !== user.id && user.role !== "admin") {
    throw error(403, "Not authorized to delete this alteration");
  }

  await db.delete(alterations).where(eq(alterations.id, event.params.id));

  return json({ success: true });
};
