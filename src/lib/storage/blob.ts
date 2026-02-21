import { put, list, del } from "@vercel/blob";
import { error } from "@sveltejs/kit";
import { VERCEL_BLOB_TOKEN } from "$env/static/private";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type FileType = "image" | "document";

export function validateFile(file: File, fileType: FileType): void {
  const allowedTypes = fileType === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;

  if (!allowedTypes.includes(file.type)) {
    throw error(
      400,
      `Invalid file type. Allowed types for ${fileType}: ${allowedTypes.join(", ")}`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw error(400, `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
}

export async function uploadFile(
  file: File,
  fileType: FileType,
  path: string
): Promise<{ url: string; pathname: string }> {
  validateFile(file, fileType);

  if (!VERCEL_BLOB_TOKEN) {
    throw error(500, "Vercel Blob storage not configured");
  }

  const blob = await put(path, file, {
    access: "public",
    token: VERCEL_BLOB_TOKEN,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

export async function deleteFile(pathname: string): Promise<void> {
  if (!VERCEL_BLOB_TOKEN) {
    throw error(500, "Vercel Blob storage not configured");
  }

  await del(pathname, {
    token: VERCEL_BLOB_TOKEN,
  });
}

export async function listFiles(prefix: string): Promise<any[]> {
  if (!VERCEL_BLOB_TOKEN) {
    throw error(500, "Vercel Blob storage not configured");
  }

  const { blobs } = await list({
    prefix,
    token: VERCEL_BLOB_TOKEN,
  });

  return blobs;
}
