import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { notes } from "$lib/db/schemas";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";

// GET /api/notes/[id] - Get single note
export const GET: RequestHandler = async ({ params, locals }) => {
  const user = requireAuth({ locals } as any);

  const note = await db.query.notes.findFirst({
    where: and(eq(notes.id, params.id), eq(notes.userId, user.id)),
  });

  if (!note) {
    throw error(404, "Note not found");
  }

  return json(note);
};

// PUT /api/notes/[id] - Update note
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const user = requireAuth({ locals } as any);

  const body = await request.json();
  const { content } = body;

  if (!content || typeof content !== "string") {
    throw error(400, "Content is required");
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length === 0) {
    throw error(400, "Content cannot be empty");
  }

  if (trimmedContent.length > 10000) {
    throw error(400, "Content cannot exceed 10,000 characters");
  }

  // Verify ownership
  const existingNote = await db.query.notes.findFirst({
    where: and(eq(notes.id, params.id), eq(notes.userId, user.id)),
  });

  if (!existingNote) {
    throw error(404, "Note not found");
  }

  const [updatedNote] = await db
    .update(notes)
    .set({
      content: trimmedContent,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, params.id))
    .returning();

  return json(updatedNote);
};

// DELETE /api/notes/[id] - Delete note
export const DELETE: RequestHandler = async ({ params, locals }) => {
  const user = requireAuth({ locals } as any);

  // Verify ownership
  const existingNote = await db.query.notes.findFirst({
    where: and(eq(notes.id, params.id), eq(notes.userId, user.id)),
  });

  if (!existingNote) {
    throw error(404, "Note not found");
  }

  await db.delete(notes).where(eq(notes.id, params.id));

  return json({ success: true });
};
