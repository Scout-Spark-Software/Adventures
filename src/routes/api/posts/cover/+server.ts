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

  const slug = formData.get("slug");
  const folder = slug ? `posts/${slug}` : "posts/_draft";

  const timestamp = Date.now();
  const safeName = sanitizeFilename(file.name);
  const path = `${folder}/${timestamp}-${safeName}`;

  const { url } = await uploadFile(file, "image", path);

  return json({ url });
};
