import { eq, and, ne } from "drizzle-orm";
import { db } from "$lib/db";
import { hikes, campingSites, backpacking, posts, series } from "$lib/db/schemas";
import { toSlug, hasProfanityInSlug } from "$lib/utils/slugify";
import { error } from "@sveltejs/kit";

type SlugTable = "hike" | "camping_site" | "backpacking" | "post" | "series";

/**
 * Generate a unique, profanity-free slug for an entity.
 *
 * @param name        The human-readable name (e.g. "Sunset Trail")
 * @param entityType  Which table to check uniqueness against
 * @param excludeId   When renaming an existing entity, pass its own ID so it
 *                    doesn't conflict with itself
 */
export async function generateUniqueSlug(
  name: string,
  entityType: SlugTable,
  excludeId?: string,
): Promise<string> {
  const base = toSlug(name);

  if (!base) {
    throw error(400, "Name produces an empty slug");
  }

  if (hasProfanityInSlug(base)) {
    throw error(400, "Name contains inappropriate language");
  }

  // Try the base slug, then base-2, base-3, …
  let candidate = base;
  let counter = 2;

  while (true) {
    let existing: { id: string } | undefined;

    if (entityType === "hike") {
      existing = await db.query.hikes.findFirst({
        where: excludeId
          ? and(eq(hikes.slug, candidate), ne(hikes.id, excludeId))
          : eq(hikes.slug, candidate),
        columns: { id: true },
      });
    } else if (entityType === "camping_site") {
      existing = await db.query.campingSites.findFirst({
        where: excludeId
          ? and(eq(campingSites.slug, candidate), ne(campingSites.id, excludeId))
          : eq(campingSites.slug, candidate),
        columns: { id: true },
      });
    } else if (entityType === "backpacking") {
      existing = await db.query.backpacking.findFirst({
        where: excludeId
          ? and(eq(backpacking.slug, candidate), ne(backpacking.id, excludeId))
          : eq(backpacking.slug, candidate),
        columns: { id: true },
      });
    } else if (entityType === "post") {
      existing = await db.query.posts.findFirst({
        where: excludeId
          ? and(eq(posts.slug, candidate), ne(posts.id, excludeId))
          : eq(posts.slug, candidate),
        columns: { id: true },
      });
    } else {
      existing = await db.query.series.findFirst({
        where: excludeId
          ? and(eq(series.slug, candidate), ne(series.id, excludeId))
          : eq(series.slug, candidate),
        columns: { id: true },
      });
    }

    if (!existing) return candidate;
    candidate = `${base}-${counter++}`;
  }
}
