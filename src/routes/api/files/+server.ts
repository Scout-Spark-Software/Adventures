import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { files, hikes, campingSites } from "$lib/db/schemas";
import { eq, and } from "drizzle-orm";

export const GET: RequestHandler = async ({ url }) => {
  const entityType = url.searchParams.get("entity_type") as "hike" | "camping_site" | null;
  const entityId = url.searchParams.get("entity_id");
  const fileType = url.searchParams.get("file_type") as "image" | "document" | null;

  if (!entityType || !entityId) {
    return json({ error: "entity_type and entity_id are required" }, { status: 400 });
  }

  const conditions = [eq(files.entityType, entityType), eq(files.entityId, entityId)];

  if (fileType) {
    conditions.push(eq(files.fileType, fileType));
  }

  const results = await db.query.files.findMany({
    where: and(...conditions),
  });

  // Cache responses for approved entities
  const entity =
    entityType === "hike"
      ? await db.query.hikes.findFirst({
          columns: { status: true },
          where: eq(hikes.id, entityId),
        })
      : await db.query.campingSites.findFirst({
          columns: { status: true },
          where: eq(campingSites.id, entityId),
        });

  if (entity?.status === "approved") {
    return json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  }

  return json(results);
};
