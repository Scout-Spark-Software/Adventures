import { pgTable, uuid, numeric, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { hikes } from "./hikes";
import { campingSites } from "./camping-sites";

export const ratingAggregates = pgTable(
  "rating_aggregates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    hikeId: uuid("hike_id")
      .references(() => hikes.id, { onDelete: "cascade" })
      .unique(),
    campingSiteId: uuid("camping_site_id")
      .references(() => campingSites.id, { onDelete: "cascade" })
      .unique(),
    averageRating: numeric("average_rating", { precision: 3, scale: 2 }),
    totalRatings: integer("total_ratings").default(0).notNull(),
    totalReviews: integer("total_reviews").default(0).notNull(),
  },
  (table) => ({
    hikeIdIdx: index("rating_aggregates_hike_id_idx").on(table.hikeId),
    campingSiteIdIdx: index("rating_aggregates_camping_site_id_idx").on(
      table.campingSiteId,
    ),
  }),
);

export const ratingAggregatesRelations = relations(
  ratingAggregates,
  ({ one }) => ({
    hike: one(hikes, {
      fields: [ratingAggregates.hikeId],
      references: [hikes.id],
    }),
    campingSite: one(campingSites, {
      fields: [ratingAggregates.campingSiteId],
      references: [campingSites.id],
    }),
  }),
);

export type RatingAggregate = typeof ratingAggregates.$inferSelect;
export type NewRatingAggregate = typeof ratingAggregates.$inferInsert;
