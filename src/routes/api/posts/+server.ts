import { isPrivilegedUser } from "$lib/auth/helpers";
import { requireAdmin } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { posts, series } from "$lib/db/schemas";
import { generateUniqueSlug } from "$lib/server/slug";
import { parseLimit, parseOffset } from "$lib/utils/pagination";
import { error, json } from "@sveltejs/kit";
import { and, count, desc, eq, inArray, max } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  const privileged = isPrivilegedUser(locals.user);
  const status = url.searchParams.get("status");
  const includeDrafts = url.searchParams.get("include_drafts") === "true";
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));

  const conditions = [];

  if (status && privileged) {
    conditions.push(eq(posts.status, status as any));
  } else if (includeDrafts && privileged) {
    conditions.push(inArray(posts.status, ["published", "draft"]));
  } else if (!privileged) {
    conditions.push(eq(posts.status, "published"));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [results, [{ total }]] = await Promise.all([
    db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        excerpt: posts.excerpt,
        status: posts.status,
        scheduledAt: posts.scheduledAt,
        publishedAt: posts.publishedAt,
        featured: posts.featured,
        seriesId: posts.seriesId,
        seriesOrder: posts.seriesOrder,
        seriesName: series.name,
        authorId: posts.authorId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .leftJoin(series, eq(posts.seriesId, series.id))
      .where(where)
      .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(posts).where(where),
  ]);

  const cacheHeader = privileged
    ? "no-store"
    : "public, s-maxage=300, stale-while-revalidate=900";

  return json({ data: results, total }, { headers: { "Cache-Control": cacheHeader } });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  requireAdmin({ locals } as any);

  const body = await request.json();
  const { title, excerpt, postBody, status, scheduledAt, featured, seriesId, seriesOrder, coverImageUrl } = body;

  if (!title) throw error(400, "Title is required");
  if (!postBody) throw error(400, "Body is required");
  if (status === "scheduled" && !scheduledAt) {
    throw error(400, "scheduledAt is required when status is scheduled");
  }

  const slug = await generateUniqueSlug(title, "post");

  // Auto-assign series order if a series is given but no order provided
  let resolvedOrder: number | null = null;
  if (seriesId) {
    if (seriesOrder != null && seriesOrder !== "") {
      resolvedOrder = Number(seriesOrder);
    } else {
      const [{ maxOrder }] = await db
        .select({ maxOrder: max(posts.seriesOrder) })
        .from(posts)
        .where(eq(posts.seriesId, seriesId));
      resolvedOrder = (maxOrder ?? 0) + 1;
    }
  }

  const [newPost] = await db
    .insert(posts)
    .values({
      title,
      slug,
      excerpt: excerpt || null,
      body: postBody,
      status: status || "draft",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      publishedAt: status === "published" ? new Date() : null,
      featured: featured === true,
      authorId: locals.user!.id,
      seriesId: seriesId || null,
      seriesOrder: resolvedOrder,
      coverImageUrl: coverImageUrl || null,
    })
    .returning();

  return json(newPost, { status: 201 });
};
