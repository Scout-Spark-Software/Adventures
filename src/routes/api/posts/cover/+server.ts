import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireAdmin } from "$lib/auth/middleware";
import { uploadFile, validateFile } from "$lib/storage/blob";
import { sanitizeFilename } from "$lib/security";

export const POST: RequestHandler = async ({ request, locals }) => {
  requireAdmin({ locals } as any);

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) throw error(400, "File is required");

  validateFile(file, "image");

  const postId = formData.get("postId");
  if (typeof postId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId)) {
    throw error(400, "postId must be a valid UUID");
  }

  const timestamp = Date.now();
  const safeName = sanitizeFilename(file.name);
  const path = `posts/${postId}/${timestamp}-${safeName}`;

  const { url } = await uploadFile(file, "image", path);

  return json({ url });
};
