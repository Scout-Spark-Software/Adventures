import { db } from "./db";
import { moderationQueue } from "./db/schemas";
import { eq, and } from "drizzle-orm";

export async function addToModerationQueue(
  entityType: "hike" | "camping_site" | "alteration",
  entityId: string,
): Promise<void> {
  await db.insert(moderationQueue).values({
    entityType,
    entityId,
    status: "pending",
  });
}

export async function updateModerationStatus(
  entityType: "hike" | "camping_site" | "alteration",
  entityId: string,
  status: "approved" | "rejected",
  reviewedBy: string,
): Promise<void> {
  await db
    .update(moderationQueue)
    .set({
      status,
      reviewedBy,
      reviewedAt: new Date(),
    })
    .where(
      and(
        eq(moderationQueue.entityType, entityType),
        eq(moderationQueue.entityId, entityId),
      ),
    );
}
