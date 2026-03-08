import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { hikes } from "$lib/db/schemas/hikes";
import { campingSites } from "$lib/db/schemas/camping-sites";
import { backpacking } from "$lib/db/schemas/backpacking";
import { sql } from "drizzle-orm";

export const GET: RequestHandler = async () => {
  try {
    const [hikesCount, campingSitesCount, backpackingCount] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(hikes)
        .where(sql`${hikes.status} = 'approved'`),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(campingSites)
        .where(sql`${campingSites.status} = 'approved'`),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(backpacking)
        .where(sql`${backpacking.status} = 'approved'`),
    ]);

    return json(
      {
        trails: hikesCount[0]?.count || 0,
        campsites: campingSitesCount[0]?.count || 0,
        backpacking: backpackingCount[0]?.count || 0,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return json({ error: "Failed to fetch stats" }, { status: 500 });
  }
};
