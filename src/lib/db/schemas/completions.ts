import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  check,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { hikes } from "./hikes";
import { campingSites } from "./camping-sites";
import { backpacking } from "./backpacking";
import { distanceUnitEnum, durationUnitEnum, elevationUnitEnum } from "./enums";

export const tripCompletions = pgTable(
  "trip_completions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    hikeId: uuid("hike_id").references(() => hikes.id, { onDelete: "cascade" }),
    campingSiteId: uuid("camping_site_id").references(() => campingSites.id, {
      onDelete: "cascade",
    }),
    backpackingId: uuid("backpacking_id").references(() => backpacking.id, {
      onDelete: "cascade",
    }),
    distance: numeric("distance"),
    distanceUnit: distanceUnitEnum("distance_unit"),
    duration: numeric("duration"),
    durationUnit: durationUnitEnum("duration_unit"),
    elevation: numeric("elevation"),
    elevationUnit: elevationUnitEnum("elevation_unit"),
    nights: integer("nights"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    entityCheck: check(
      "trip_completions_entity_check",
      sql`(${table.hikeId} IS NOT NULL AND ${table.campingSiteId} IS NULL AND ${table.backpackingId} IS NULL) OR (${table.hikeId} IS NULL AND ${table.campingSiteId} IS NOT NULL AND ${table.backpackingId} IS NULL) OR (${table.hikeId} IS NULL AND ${table.campingSiteId} IS NULL AND ${table.backpackingId} IS NOT NULL)`
    ),
    nightsCheck: check(
      "trip_completions_nights_check",
      sql`${table.nights} IS NULL OR (${table.nights} >= 1 AND ${table.nights} <= 90)`
    ),
    userIdIdx: index("trip_completions_user_id_idx").on(table.userId),
    hikeIdIdx: index("trip_completions_hike_id_idx").on(table.hikeId),
    campingSiteIdIdx: index("trip_completions_camping_site_id_idx").on(table.campingSiteId),
    backpackingIdIdx: index("trip_completions_backpacking_id_idx").on(table.backpackingId),
  })
);

export const tripCompletionsRelations = relations(tripCompletions, ({ one }) => ({
  hike: one(hikes, {
    fields: [tripCompletions.hikeId],
    references: [hikes.id],
  }),
  campingSite: one(campingSites, {
    fields: [tripCompletions.campingSiteId],
    references: [campingSites.id],
  }),
  backpacking: one(backpacking, {
    fields: [tripCompletions.backpackingId],
    references: [backpacking.id],
  }),
}));

export type TripCompletion = typeof tripCompletions.$inferSelect;
export type NewTripCompletion = typeof tripCompletions.$inferInsert;
