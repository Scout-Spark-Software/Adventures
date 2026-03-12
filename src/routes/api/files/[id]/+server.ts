import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { files, hikes, campingSites, backpacking } from "$lib/db/schemas";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { deleteFile } from "$lib/storage/blob";

export const GET: RequestHandler = async ({ params }) => {
  const file = await db.query.files.findFirst({
    where: eq(files.id, params.id),
  });

  if (!file) {
    throw error(404, "File not found");
  }

  return json(file);
};

export const PATCH: RequestHandler = async (event) => {
  const user = requireAuth(event);

  const file = await db.query.files.findFirst({
    where: eq(files.id, event.params.id),
  });

  if (!file) {
    throw error(404, "File not found");
  }

  // Only uploader or admin can update file metadata
  if (file.uploadedBy !== user.id && user.role !== "admin") {
    throw error(403, "Not authorized to update this file");
  }

  // Also verify the user owns the entity this file belongs to (or is admin)
  if (user.role !== "admin") {
    let entityCreatedBy: string | null = null;
    if (file.entityType === "hike") {
      const entity = await db.query.hikes.findFirst({ where: eq(hikes.id, file.entityId) });
      entityCreatedBy = entity?.createdBy ?? null;
    } else if (file.entityType === "camping_site") {
      const entity = await db.query.campingSites.findFirst({
        where: eq(campingSites.id, file.entityId),
      });
      entityCreatedBy = entity?.createdBy ?? null;
    } else if (file.entityType === "backpacking") {
      const entity = await db.query.backpacking.findFirst({
        where: eq(backpacking.id, file.entityId),
      });
      entityCreatedBy = entity?.createdBy ?? null;
    }
    if (entityCreatedBy !== null && entityCreatedBy !== user.id) {
      throw error(403, "Not authorized to update files for this entity");
    }
  }

  const body = await event.request.json();

  if (typeof body.isBanner === "boolean") {
    if (body.isBanner) {
      // Unset banner on all other images for this entity first
      await db
        .update(files)
        .set({ isBanner: false })
        .where(
          and(
            eq(files.entityType, file.entityType),
            eq(files.entityId, file.entityId),
            eq(files.fileType, "image")
          )
        );
    }
    await db.update(files).set({ isBanner: body.isBanner }).where(eq(files.id, file.id));
  }

  const updated = await db.query.files.findFirst({ where: eq(files.id, file.id) });
  return json(updated);
};

export const DELETE: RequestHandler = async (event) => {
  const user = requireAuth(event);

  const file = await db.query.files.findFirst({
    where: eq(files.id, event.params.id),
  });

  if (!file) {
    throw error(404, "File not found");
  }

  // Only uploader or admin can delete
  if (file.uploadedBy !== user.id && user.role !== "admin") {
    throw error(403, "Not authorized to delete this file");
  }

  // Fire-and-forget R2 deletion — don't block the response on it
  deleteFile(new URL(file.fileUrl).pathname).catch((err) =>
    console.error("R2 deletion failed for file", file.id, err)
  );

  // Delete from database
  await db.delete(files).where(eq(files.id, event.params.id));

  return json({ success: true });
};
