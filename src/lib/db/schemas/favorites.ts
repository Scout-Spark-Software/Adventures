import { pgTable, uuid, timestamp, text, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { hikes } from "./hikes";
import { campingSites } from "./camping-sites";
import { backpacking } from "./backpacking";

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    hikeId: uuid("hike_id").references(() => hikes.id),
    campingSiteId: uuid("camping_site_id").references(() => campingSites.id),
    backpackingId: uuid("backpacking_id").references(() => backpacking.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userHikeUnique: uniqueIndex("favorites_user_hike_unique")
      .on(table.userId, table.hikeId)
      .where(sql`${table.hikeId} IS NOT NULL`),
    userCampingUnique: uniqueIndex("favorites_user_camping_unique")
      .on(table.userId, table.campingSiteId)
      .where(sql`${table.campingSiteId} IS NOT NULL`),
    userBackpackingUnique: uniqueIndex("favorites_user_backpacking_unique")
      .on(table.userId, table.backpackingId)
      .where(sql`${table.backpackingId} IS NOT NULL`),
    userIdIdx: index("favorites_user_id_idx").on(table.userId),
    hikeIdIdx: index("favorites_hike_id_idx").on(table.hikeId),
    campingSiteIdIdx: index("favorites_camping_site_id_idx").on(table.campingSiteId),
    backpackingIdIdx: index("favorites_backpacking_id_idx").on(table.backpackingId),
  })
);

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
