import { requireAdmin } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { series } from "$lib/db/schemas";
import { generateUniqueSlug } from "$lib/server/slug";
import { error, json } from "@sveltejs/kit";
import { asc } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const results = await db.select().from(series).orderBy(asc(series.name));
  return json(results, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
  });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  requireAdmin({ locals } as any);

  const body = await request.json();
  const { name, description } = body;

  if (!name?.trim()) throw error(400, "Name is required");

  const slug = await generateUniqueSlug(name, "series");

  const [newSeries] = await db
    .insert(series)
    .values({ name: name.trim(), slug, description: description?.trim() || null })
    .returning();

  return json(newSeries, { status: 201 });
};
