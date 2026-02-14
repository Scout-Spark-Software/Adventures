import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { hikes } from "$lib/db/schemas/hikes";
import { campingSites } from "$lib/db/schemas/camping-sites";
import { userRoles } from "$lib/db/schemas/user-roles";
import { sql } from "drizzle-orm";

export const GET: RequestHandler = async () => {
  try {
    // Count approved hikes
    const hikesCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(hikes)
      .where(sql`${hikes.status} = 'approved'`);

    // Count approved camping sites
    const campingSitesCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(campingSites)
      .where(sql`${campingSites.status} = 'approved'`);

    // Count total users (scouts)
    const scoutsCount = await db.select({ count: sql<number>`count(*)::int` }).from(userRoles);

    return json(
      {
        trails: hikesCount[0]?.count || 0,
        campsites: campingSitesCount[0]?.count || 0,
        scouts: scoutsCount[0]?.count || 0,
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
