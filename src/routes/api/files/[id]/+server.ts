import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { files } from "$lib/db/schemas";
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

  // Only uploader or admin can set banner
  if (file.uploadedBy !== user.id && user.role !== "admin") {
    throw error(403, "Not authorized to update this file");
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

  // Extract pathname from URL
  const urlObj = new URL(file.fileUrl);
  const pathname = urlObj.pathname;

  // Delete from Vercel Blob
  await deleteFile(pathname);

  // Delete from database
  await db.delete(files).where(eq(files.id, event.params.id));

  return json({ success: true });
};
