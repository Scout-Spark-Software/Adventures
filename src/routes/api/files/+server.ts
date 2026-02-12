import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { files, hikes, campingSites } from "$lib/db/schemas";
import { eq, and } from "drizzle-orm";

export const GET: RequestHandler = async ({ url }) => {
  const entityType = url.searchParams.get("entity_type") as
    | "hike"
    | "camping_site"
    | null;
  const entityId = url.searchParams.get("entity_id");
  const fileType = url.searchParams.get("file_type") as
    | "image"
    | "document"
    | null;

  const conditions = [];

  if (entityType) {
    conditions.push(eq(files.entityType, entityType));
  }

  if (entityId) {
    conditions.push(eq(files.entityId, entityId));
  }

  if (fileType) {
    conditions.push(eq(files.fileType, fileType));
  }

  const results = await db.query.files.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
  });

  // Only cache if we can verify the parent entity is approved
  if (entityType && entityId) {
    const table = entityType === "hike" ? hikes : campingSites;
    const entity = await db.query[
      entityType === "hike" ? "hikes" : "campingSites"
    ].findFirst({
      columns: { status: true },
      where: eq(table.id, entityId),
    });

    if (entity?.status === "approved") {
      return json(results, {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
        },
      });
    }
  }

  return json(results);
};
