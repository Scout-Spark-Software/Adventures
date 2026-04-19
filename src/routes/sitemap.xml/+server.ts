import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { hikes, campingSites, backpacking, posts } from "$lib/db/schemas";
import { eq } from "drizzle-orm";

const BASE_URL = "https://www.adventurespark.org";

const STATIC_PAGES = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/hikes", priority: "0.9", changefreq: "daily" },
  { url: "/camping", priority: "0.9", changefreq: "daily" },
  { url: "/backpacking", priority: "0.9", changefreq: "daily" },
  { url: "/blog", priority: "0.8", changefreq: "weekly" },
  { url: "/essentials", priority: "0.6", changefreq: "monthly" },
];

export const GET: RequestHandler = async () => {
  const [hikeList, campingList, backpackingList, postList] = await Promise.all([
    db
      .select({ slug: hikes.slug, updatedAt: hikes.updatedAt })
      .from(hikes)
      .where(eq(hikes.status, "approved")),
    db
      .select({ slug: campingSites.slug, updatedAt: campingSites.updatedAt })
      .from(campingSites)
      .where(eq(campingSites.status, "approved")),
    db
      .select({ slug: backpacking.slug, updatedAt: backpacking.updatedAt })
      .from(backpacking)
      .where(eq(backpacking.status, "approved")),
    db
      .select({ slug: posts.slug, updatedAt: posts.updatedAt })
      .from(posts)
      .where(eq(posts.status, "published")),
  ]);

  const formatDate = (d: Date | null) =>
    d ? d.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

  const urlEntry = (loc: string, lastmod?: string, priority = "0.8", changefreq = "weekly") =>
    `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PAGES.map((p) => urlEntry(`${BASE_URL}${p.url}`, undefined, p.priority, p.changefreq)).join("\n")}
${hikeList.map((h) => urlEntry(`${BASE_URL}/hikes/${h.slug}`, formatDate(h.updatedAt))).join("\n")}
${campingList.map((c) => urlEntry(`${BASE_URL}/camping/${c.slug}`, formatDate(c.updatedAt))).join("\n")}
${backpackingList.map((b) => urlEntry(`${BASE_URL}/backpacking/${b.slug}`, formatDate(b.updatedAt))).join("\n")}
${postList.map((p) => urlEntry(`${BASE_URL}/blog/${p.slug}`, formatDate(p.updatedAt), "0.7", "monthly")).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200",
    },
  });
};
