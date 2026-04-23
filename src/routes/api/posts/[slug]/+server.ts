import { isPrivilegedUser } from "$lib/auth/helpers";
import { requireAdmin } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { posts, series } from "$lib/db/schemas";
import { generateUniqueSlug } from "$lib/server/slug";
import { deleteFile, listFiles } from "$lib/storage/blob";
import { error, json } from "@sveltejs/kit";
import { asc, eq, max } from "drizzle-orm";
import type { RequestHandler } from "./$types";

async function getPostBySlug(slug: string) {
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return post ?? null;
}

export const GET: RequestHandler = async ({ params, locals }) => {
  const post = await getPostBySlug(params.slug);
  if (!post) throw error(404, "Post not found");

  const privileged = isPrivilegedUser(locals.user);
  if (!privileged && post.status !== "published") throw error(403, "Forbidden");

  // If this post belongs to a series, load the series info + sibling posts
  let seriesData: { series: typeof series.$inferSelect; posts: typeof posts.$inferSelect[] } | null =
    null;

  if (post.seriesId) {
    const [seriesRow] = await db
      .select()
      .from(series)
      .where(eq(series.id, post.seriesId))
      .limit(1);

    if (seriesRow) {
      const siblingPosts = await db
        .select({
          id: posts.id,
          slug: posts.slug,
          title: posts.title,
          seriesOrder: posts.seriesOrder,
          status: posts.status,
          publishedAt: posts.publishedAt,
        })
        .from(posts)
        .where(eq(posts.seriesId, post.seriesId))
        .orderBy(asc(posts.seriesOrder));

      // Non-privileged users only see published sibling posts
      const visiblePosts = privileged
        ? siblingPosts
        : siblingPosts.filter((p) => p.status === "published");

      seriesData = { series: seriesRow, posts: visiblePosts as any };
    }
  }

  return json(
    { ...post, seriesData },
    {
      headers: {
        "Cache-Control":
          post.status === "published" && !privileged
            ? "public, s-maxage=3600, stale-while-revalidate=7200"
            : "no-store",
      },
    }
  );
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  requireAdmin({ locals } as any);

  const post = await getPostBySlug(params.slug);
  if (!post) throw error(404, "Post not found");

  const body = await request.json();
  const { title, excerpt, postBody, status, scheduledAt, featured, seriesId, seriesOrder, coverImageUrl } = body;

  if (status === "scheduled" && !scheduledAt && !post.scheduledAt) {
    throw error(400, "scheduledAt is required when status is scheduled");
  }

  let newSlug = post.slug;
  if (title && title !== post.title) {
    newSlug = await generateUniqueSlug(title, "post", post.id);
  }

  let publishedAt = post.publishedAt;
  if (status === "published" && !post.publishedAt) {
    publishedAt = new Date();
  }

  // Resolve series assignment
  const incomingSeriesId = seriesId !== undefined ? seriesId || null : post.seriesId;
  let resolvedOrder: number | null = post.seriesOrder;

  if (seriesId !== undefined) {
    if (!seriesId) {
      // Series removed
      resolvedOrder = null;
    } else if (seriesId !== post.seriesId) {
      // Assigned to a new series — explicit order takes precedence, otherwise auto-assign
      if (seriesOrder != null && seriesOrder !== "") {
        resolvedOrder = Number(seriesOrder);
      } else {
        const [{ maxOrder }] = await db
          .select({ maxOrder: max(posts.seriesOrder) })
          .from(posts)
          .where(eq(posts.seriesId, seriesId));
        resolvedOrder = (maxOrder ?? 0) + 1;
      }
    } else if (seriesOrder != null && seriesOrder !== "") {
      resolvedOrder = Number(seriesOrder);
    }
  } else if (seriesOrder != null && seriesOrder !== "") {
    resolvedOrder = Number(seriesOrder);
  }

  const [updated] = await db
    .update(posts)
    .set({
      title: title ?? post.title,
      slug: newSlug,
      excerpt: excerpt !== undefined ? excerpt : post.excerpt,
      body: postBody ?? post.body,
      status: status ?? post.status,
      scheduledAt:
        scheduledAt !== undefined
          ? scheduledAt
            ? new Date(scheduledAt)
            : null
          : post.scheduledAt,
      publishedAt,
      featured: featured !== undefined ? featured : post.featured,
      seriesId: incomingSeriesId,
      seriesOrder: resolvedOrder,
      coverImageUrl: coverImageUrl !== undefined ? coverImageUrl || null : post.coverImageUrl,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, post.id))
    .returning();

  return json(updated);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  requireAdmin({ locals } as any);

  const post = await getPostBySlug(params.slug);
  if (!post) throw error(404, "Post not found");

  await db.delete(posts).where(eq(posts.id, post.id));

  // Delete all R2 objects stored under posts/{slug}/
  const objects = await listFiles(`posts/${post.slug}/`);
  const deletions = objects
    .filter((o) => o.Key)
    .map((o) => deleteFile(o.Key!));
  const results = await Promise.allSettled(deletions);
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`Failed to delete R2 object ${objects[i].Key}:`, result.reason);
    }
  });

  return json({ success: true });
};
