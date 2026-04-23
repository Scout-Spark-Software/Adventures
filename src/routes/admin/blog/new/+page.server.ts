import { requireAdmin } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { posts } from "$lib/db/schemas";
import { generateUniqueSlug } from "$lib/server/slug";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);

  // Create an empty draft immediately so uploads have a stable post ID before the form is saved.
  // If the user cancels, the Cancel button deletes this draft and its R2 objects.
  const slug = await generateUniqueSlug("Untitled", "post");
  const [draft] = await db
    .insert(posts)
    .values({ title: "Untitled", slug, body: "", status: "draft", authorId: event.locals.user!.id })
    .returning();

  const res = await event.fetch("/api/series");
  const allSeries = await res.json();

  return { draft, allSeries };
};
