import { db } from "$lib/db";
import { posts } from "$lib/db/schemas";
import { env } from "$env/dynamic/private";
import { json } from "@sveltejs/kit";
import { and, eq, lte } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const auth = request.headers.get("Authorization");
  const secret = env.CRON_SECRET;

  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();

  const published = await db
    .update(posts)
    .set({ status: "published", publishedAt: now, updatedAt: now })
    .where(and(eq(posts.status, "scheduled"), lte(posts.scheduledAt, now)))
    .returning({ id: posts.id, slug: posts.slug, title: posts.title });

  return json({ published: published.length, posts: published });
};
