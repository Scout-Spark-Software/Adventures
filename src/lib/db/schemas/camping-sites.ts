import { pgTable, text, timestamp, boolean, jsonb, uuid, numeric } from "drizzle-orm/pg-core";
import { statusEnum, petPolicyEnum, firePolicyEnum, siteTypeEnum } from "./enums";
import { addresses } from "./addresses";

export const campingSites = pgTable("camping_sites", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  addressId: uuid("address_id").references(() => addresses.id),
  capacity: text("capacity"),
  amenities: jsonb("amenities"),
  facilities: jsonb("facilities"),
  reservationInfo: text("reservation_info"),
  costPerNight: numeric("cost_per_night", { precision: 10, scale: 2 }),
  baseFee: numeric("base_fee", { precision: 10, scale: 2 }),
  operatingSeasonStart: text("operating_season_start"),
  operatingSeasonEnd: text("operating_season_end"),
  petPolicy: petPolicyEnum("pet_policy").notNull(),
  reservationRequired: boolean("reservation_required").default(false),
  siteType: siteTypeEnum("site_type").notNull(),
  firePolicy: firePolicyEnum("fire_policy").notNull(),
  status: statusEnum("status").default("pending").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CampingSite = typeof campingSites.$inferSelect;
export type NewCampingSite = typeof campingSites.$inferInsert;
