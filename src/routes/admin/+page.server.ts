import type { PageServerLoad } from "./$types";
import { requireAdmin } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { hikes, campingSites, moderationQueue, favorites } from "$lib/db/schemas";
import { count, eq, and } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
  const user = await requireAdmin(event);

  // Get statistics
  const [
    totalHikes,
    totalCampingSites,
    pendingHikes,
    pendingCampingSites,
    featuredHikes,
    featuredCampingSites,
    pendingAlterations,
    totalFavorites,
  ] = await Promise.all([
    db.select({ count: count() }).from(hikes).where(eq(hikes.status, "approved")),
    db.select({ count: count() }).from(campingSites).where(eq(campingSites.status, "approved")),
    db
      .select({ count: count() })
      .from(moderationQueue)
      .where(and(eq(moderationQueue.status, "pending"), eq(moderationQueue.entityType, "hike"))),
    db
      .select({ count: count() })
      .from(moderationQueue)
      .where(
        and(eq(moderationQueue.status, "pending"), eq(moderationQueue.entityType, "camping_site"))
      ),
    db
      .select({ count: count() })
      .from(hikes)
      .where(and(eq(hikes.status, "approved"), eq(hikes.featured, true))),
    db
      .select({ count: count() })
      .from(campingSites)
      .where(and(eq(campingSites.status, "approved"), eq(campingSites.featured, true))),
    db
      .select({ count: count() })
      .from(moderationQueue)
      .where(
        and(eq(moderationQueue.status, "pending"), eq(moderationQueue.entityType, "alteration"))
      ),
    db.select({ count: count() }).from(favorites),
  ]);

  return {
    user,
    stats: {
      totalHikes: totalHikes[0].count,
      totalCampingSites: totalCampingSites[0].count,
      pendingHikes: pendingHikes[0].count,
      pendingCampingSites: pendingCampingSites[0].count,
      featuredHikes: featuredHikes[0].count,
      featuredCampingSites: featuredCampingSites[0].count,
      pendingAlterations: pendingAlterations[0].count,
      totalFavorites: totalFavorites[0].count,
    },
  };
};
