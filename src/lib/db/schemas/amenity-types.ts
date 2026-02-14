import { pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";

export const amenityTypes = pgTable("amenity_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  key: text("key").notNull().unique(), // Used as the JSON key (e.g., 'water', 'electricity')
  description: text("description"),
  icon: text("icon"), // Optional icon name or SVG
  displayOrder: integer("display_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AmenityType = typeof amenityTypes.$inferSelect;
export type NewAmenityType = typeof amenityTypes.$inferInsert;
