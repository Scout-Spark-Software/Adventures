import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireAdmin } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { imageFlags, files } from "$lib/db/schemas";
import { eq, desc } from "drizzle-orm";
import { deleteFile } from "$lib/storage/blob";
import { parseLimit, parseOffset } from "$lib/utils/pagination";

export const GET: RequestHandler = async ({ url, locals }) => {
  await requireAdmin({ locals } as any);

  const status = (url.searchParams.get("status") || "pending") as
    | "pending"
    | "approved"
    | "rejected";
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));

  const flags = await db.query.imageFlags.findMany({
    where: eq(imageFlags.status, status),
    limit,
    offset,
    orderBy: [desc(imageFlags.createdAt)],
    with: {
      file: true,
    },
  });

  return json(flags);
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  await requireAdmin({ locals } as any);

  const user = locals.user!;
  const body = await request.json();
  const { flagId, status } = body;

  if (!flagId || !status) {
    throw error(400, "flagId and status are required");
  }

  if (!["approved", "rejected"].includes(status)) {
    throw error(400, 'status must be "approved" or "rejected"');
  }

  const flag = await db.query.imageFlags.findFirst({
    where: eq(imageFlags.id, flagId),
    with: { file: true },
  });

  if (!flag) {
    throw error(404, "Flag not found");
  }

  if (status === "approved") {
    // Flag is valid — image is inappropriate. Delete the image.
    const file = flag.file;
    if (file) {
      // Extract pathname from URL for blob deletion
      // Vercel Blob URLs are like: https://<hash>.public.blob.vercel-storage.com/<pathname>
      try {
        const blobUrl = new URL(file.fileUrl);
        const pathname = blobUrl.pathname.slice(1); // remove leading /
        await deleteFile(pathname);
      } catch {
        // If blob deletion fails, still remove DB record
      }
      await db.delete(files).where(eq(files.id, file.id));
    }
  }

  // Update flag status
  await db
    .update(imageFlags)
    .set({ status, reviewedBy: user.id, reviewedAt: new Date() })
    .where(eq(imageFlags.id, flagId));

  return json({ success: true });
};
