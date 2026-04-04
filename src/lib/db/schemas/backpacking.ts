import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uuid,
  numeric,
  integer,
  customType,
} from "drizzle-orm/pg-core";
import {
  statusEnum,
  difficultyEnum,
  distanceUnitEnum,
  durationUnitEnum,
  elevationUnitEnum,
  trailTypeEnum,
  campingStyleEnum,
} from "./enums";
import { addresses } from "./addresses";
import { councils } from "./councils";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const backpacking = pgTable("backpacking", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  addressId: uuid("address_id").references(() => addresses.id),
  councilId: uuid("council_id").references(() => councils.id),
  difficulty: difficultyEnum("difficulty"),
  distance: numeric("distance"),
  distanceUnit: distanceUnitEnum("distance_unit").default("miles"),
  duration: numeric("duration"),
  durationUnit: durationUnitEnum("duration_unit").default("hours"),
  elevation: numeric("elevation"),
  elevationUnit: elevationUnitEnum("elevation_unit").default("feet"),
  trailType: trailTypeEnum("trail_type"),
  features: jsonb("features"),
  dogFriendly: boolean("dog_friendly").default(false),
  permitsRequired: text("permits_required"),
  bestSeason: jsonb("best_season"),
  waterSources: boolean("water_sources").default(false),
  parkingInfo: text("parking_info"),
  numberOfDays: integer("number_of_days"),
  numberOfNights: integer("number_of_nights"),
  campingStyle: campingStyleEnum("camping_style"),
  resupplyPoints: jsonb("resupply_points"),
  waterAvailability: text("water_availability"),
  waypoints: jsonb("waypoints"),
  slug: text("slug").unique().notNull(),
  searchVector: tsvector("search_vector"),
  status: statusEnum("status").default("pending").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Backpacking = typeof backpacking.$inferSelect;
export type NewBackpacking = typeof backpacking.$inferInsert;
