import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireAuth } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { files, imageFlags } from "$lib/db/schemas";
import { eq, and } from "drizzle-orm";

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const user = requireAuth({ locals } as any);

  const fileId = params.id;

  // Check the file exists
  const file = await db.query.files.findFirst({
    where: eq(files.id, fileId),
  });

  if (!file) {
    throw error(404, "File not found");
  }

  // Users cannot flag their own uploads
  if (file.uploadedBy === user.id) {
    throw error(400, "You cannot flag your own uploads");
  }

  // Check if already flagged by this user
  const existingFlag = await db.query.imageFlags.findFirst({
    where: and(eq(imageFlags.fileId, fileId), eq(imageFlags.flaggedBy, user.id)),
  });

  if (existingFlag) {
    throw error(409, "You have already flagged this image");
  }

  let reason: string | undefined;
  try {
    const body = await request.json();
    reason = body?.reason;
  } catch {
    // body is optional
  }

  const [flag] = await db
    .insert(imageFlags)
    .values({
      fileId,
      flaggedBy: user.id,
      reason: reason || null,
      status: "pending",
    })
    .returning();

  return json(flag, { status: 201 });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const user = requireAuth({ locals } as any);

  const fileId = params.id;

  const existingFlag = await db.query.imageFlags.findFirst({
    where: and(
      eq(imageFlags.fileId, fileId),
      eq(imageFlags.flaggedBy, user.id),
      eq(imageFlags.status, "pending")
    ),
  });

  if (!existingFlag) {
    throw error(404, "No pending flag found for this image");
  }

  await db.delete(imageFlags).where(eq(imageFlags.id, existingFlag.id));

  return json({ success: true });
};
