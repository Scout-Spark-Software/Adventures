import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  check,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { hikes } from "./hikes";
import { campingSites } from "./camping-sites";

export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    hikeId: uuid("hike_id").references(() => hikes.id, { onDelete: "cascade" }),
    campingSiteId: uuid("camping_site_id").references(() => campingSites.id, {
      onDelete: "cascade",
    }),
    rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
    reviewText: text("review_text"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    entityCheck: check(
      "ratings_entity_check",
      sql`(${table.hikeId} IS NOT NULL AND ${table.campingSiteId} IS NULL) OR (${table.hikeId} IS NULL AND ${table.campingSiteId} IS NOT NULL)`
    ),
    ratingValueCheck: check(
      "ratings_value_check",
      sql`${table.rating}::numeric >= 1.0 AND ${table.rating}::numeric <= 5.0 AND (${table.rating}::numeric * 2) = FLOOR(${table.rating}::numeric * 2)`
    ),
    userIdIdx: index("ratings_user_id_idx").on(table.userId),
    hikeIdIdx: index("ratings_hike_id_idx").on(table.hikeId),
    campingSiteIdIdx: index("ratings_camping_site_id_idx").on(table.campingSiteId),
    userHikeUnique: uniqueIndex("ratings_user_hike_unique_idx")
      .on(table.userId, table.hikeId)
      .where(sql`${table.hikeId} IS NOT NULL`),
    userCampingUnique: uniqueIndex("ratings_user_camping_unique_idx")
      .on(table.userId, table.campingSiteId)
      .where(sql`${table.campingSiteId} IS NOT NULL`),
    hasReviewIdx: index("ratings_has_review_idx")
      .on(table.hikeId, table.campingSiteId)
      .where(sql`${table.reviewText} IS NOT NULL`),
  })
);

export const ratingsRelations = relations(ratings, ({ one }) => ({
  hike: one(hikes, {
    fields: [ratings.hikeId],
    references: [hikes.id],
  }),
  campingSite: one(campingSites, {
    fields: [ratings.campingSiteId],
    references: [campingSites.id],
  }),
}));

export type Rating = typeof ratings.$inferSelect;
export type NewRating = typeof ratings.$inferInsert;
