import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uuid,
  numeric,
  customType,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});
import {
  statusEnum,
  difficultyEnum,
  distanceUnitEnum,
  durationUnitEnum,
  elevationUnitEnum,
  trailTypeEnum,
} from "./enums";
import { addresses } from "./addresses";

export const hikes = pgTable("hikes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  addressId: uuid("address_id").references(() => addresses.id),
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
  searchVector: tsvector("search_vector"),
  status: statusEnum("status").default("pending").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Hike = typeof hikes.$inferSelect;
export type NewHike = typeof hikes.$inferInsert;
