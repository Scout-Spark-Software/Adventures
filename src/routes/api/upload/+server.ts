import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireAuth } from "$lib/auth/middleware";
import { uploadFile } from "$lib/storage/blob";
import { sanitizeFilename } from "$lib/security";
import { db } from "$lib/db";
import { files } from "$lib/db/schemas";
import { eq, and, count } from "drizzle-orm";

const MAX_PHOTOS_PER_ENTITY = 6;

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = requireAuth({ locals } as any);

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const entityType = formData.get("entity_type") as "hike" | "camping_site" | "backpacking";
  const entityId = formData.get("entity_id") as string;
  const fileType = formData.get("file_type") as "image" | "document";
  const isBanner = formData.get("is_banner") === "true";

  if (!file) {
    throw error(400, "File is required");
  }

  if (!entityType || !["hike", "camping_site", "backpacking"].includes(entityType)) {
    throw error(400, 'entity_type must be "hike", "camping_site", or "backpacking"');
  }

  if (!entityId) {
    throw error(400, "entity_id is required");
  }

  if (!fileType || !["image", "document"].includes(fileType)) {
    throw error(400, 'file_type must be "image" or "document"');
  }

  // Enforce photo limit for images
  if (fileType === "image") {
    const [{ value: existingCount }] = await db
      .select({ value: count() })
      .from(files)
      .where(
        and(
          eq(files.entityType, entityType),
          eq(files.entityId, entityId),
          eq(files.fileType, "image")
        )
      );
    if (existingCount >= MAX_PHOTOS_PER_ENTITY) {
      throw error(400, `Photo limit reached. Maximum ${MAX_PHOTOS_PER_ENTITY} photos per item.`);
    }
  }

  // Generate unique path (sanitize filename to prevent path traversal)
  const timestamp = Date.now();
  const safeName = sanitizeFilename(file.name);
  const path = `${entityType}/${entityId}/${fileType}/${timestamp}-${safeName}`;

  // Upload to Vercel Blob
  const { url } = await uploadFile(file, fileType, path);

  // If this is flagged as banner, clear existing banner first
  if (isBanner && fileType === "image") {
    await db
      .update(files)
      .set({ isBanner: false })
      .where(
        and(
          eq(files.entityType, entityType),
          eq(files.entityId, entityId),
          eq(files.fileType, "image")
        )
      );
  }

  // Save file record to database
  const [fileRecord] = await db
    .insert(files)
    .values({
      entityType,
      entityId,
      fileType,
      fileUrl: url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy: user.id,
      isBanner: isBanner && fileType === "image",
    })
    .returning();

  return json(fileRecord, { status: 201 });
};
