import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { notes } from "$lib/db/schemas";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { requireExactlyOneEntityRef } from "$lib/server/entity-refs";
import { isValidUuid } from "$lib/utils/uuid";

// GET /api/notes?hike_id=xxx or ?camping_site_id=xxx or ?backpacking_id=xxx or neither (all user notes)
export const GET: RequestHandler = async ({ locals, url }) => {
  const user = requireAuth({ locals } as any);

  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");
  const backpackingId = url.searchParams.get("backpacking_id");

  const conditions = [eq(notes.userId, user.id)];

  if (hikeId) {
    conditions.push(eq(notes.hikeId, hikeId));
  }

  if (campingSiteId) {
    conditions.push(eq(notes.campingSiteId, campingSiteId));
  }

  if (backpackingId) {
    conditions.push(eq(notes.backpackingId, backpackingId));
  }

  const results = await db.query.notes.findMany({
    where: and(...conditions),
    orderBy: [desc(notes.updatedAt)],
    with: {
      hike: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      campingSite: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      backpacking: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return json(results, { headers: { "Cache-Control": "no-store" } });
};

// POST /api/notes - Create new note
export const POST: RequestHandler = async ({ request, locals }) => {
  const user = requireAuth({ locals } as any);

  const body = await request.json();
  const { hikeId, campingSiteId, backpackingId, content } = body;

  // Validation
  requireExactlyOneEntityRef(
    { hikeId, campingSiteId, backpackingId },
    {
      missing: "Either hikeId, campingSiteId, or backpackingId is required",
      tooMany: "Cannot create note for more than one entity at once",
    }
  );

  if (hikeId && !isValidUuid(hikeId)) {
    throw error(400, "hikeId must be a valid UUID");
  }
  if (campingSiteId && !isValidUuid(campingSiteId)) {
    throw error(400, "campingSiteId must be a valid UUID");
  }
  if (backpackingId && !isValidUuid(backpackingId)) {
    throw error(400, "backpackingId must be a valid UUID");
  }

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

  const [newNote] = await db
    .insert(notes)
    .values({
      userId: user.id,
      hikeId: hikeId || null,
      campingSiteId: campingSiteId || null,
      backpackingId: backpackingId || null,
      content: trimmedContent,
    })
    .returning();

  return json(newNote, { status: 201 });
};
