import { isPrivilegedUser } from "$lib/auth/helpers";
import { requireAdmin } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { posts, series } from "$lib/db/schemas";
import { generateUniqueSlug } from "$lib/server/slug";
import { error, json } from "@sveltejs/kit";
import { and, asc, eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

async function getSeriesBySlug(slug: string) {
  const [s] = await db.select().from(series).where(eq(series.slug, slug)).limit(1);
  return s ?? null;
}

export const GET: RequestHandler = async ({ params, locals }) => {
  const s = await getSeriesBySlug(params.slug);
  if (!s) throw error(404, "Series not found");

  const privileged = isPrivilegedUser(locals.user);

  const seriesPosts = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      status: posts.status,
      seriesOrder: posts.seriesOrder,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(privileged ? eq(posts.seriesId, s.id) : and(eq(posts.seriesId, s.id), eq(posts.status, "published")))
    .orderBy(asc(posts.seriesOrder));

  return json({ ...s, posts: seriesPosts });
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  requireAdmin({ locals } as any);

  const s = await getSeriesBySlug(params.slug);
  if (!s) throw error(404, "Series not found");

  const body = await request.json();
  const { name, description } = body;

  let newSlug = s.slug;
  if (name && name.trim() !== s.name) {
    newSlug = await generateUniqueSlug(name.trim(), "series", s.id);
  }

  const [updated] = await db
    .update(series)
    .set({
      name: name?.trim() ?? s.name,
      slug: newSlug,
      description: description !== undefined ? description?.trim() || null : s.description,
      updatedAt: new Date(),
    })
    .where(eq(series.id, s.id))
    .returning();

  return json(updated);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  requireAdmin({ locals } as any);

  const s = await getSeriesBySlug(params.slug);
  if (!s) throw error(404, "Series not found");

  // Detach posts from this series before deleting
  await db
    .update(posts)
    .set({ seriesId: null, seriesOrder: null })
    .where(eq(posts.seriesId, s.id));

  await db.delete(series).where(eq(series.id, s.id));

  return json({ success: true });
};
