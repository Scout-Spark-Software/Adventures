import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { hikes } from "$lib/db/schemas/hikes";
import { campingSites } from "$lib/db/schemas/camping-sites";
import { sql } from "drizzle-orm";
import { workos, workosConfig } from "$lib/server/workos";

export const GET: RequestHandler = async () => {
  try {
    const [hikesCount, campingSitesCount, memberships] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(hikes)
        .where(sql`${hikes.status} = 'approved'`),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(campingSites)
        .where(sql`${campingSites.status} = 'approved'`),
      workos.userManagement.listOrganizationMemberships({
        organizationId: workosConfig.organizationId,
      }),
    ]);

    return json(
      {
        trails: hikesCount[0]?.count || 0,
        campsites: campingSitesCount[0]?.count || 0,
        scouts: memberships.data.length,
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
