import { pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";

export const facilityTypes = pgTable("facility_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  key: text("key").notNull().unique(), // Used as the JSON key (e.g., 'rvSites', 'tentSites')
  description: text("description"),
  icon: text("icon"), // Optional icon name or SVG
  displayOrder: integer("display_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FacilityType = typeof facilityTypes.$inferSelect;
export type NewFacilityType = typeof facilityTypes.$inferInsert;
