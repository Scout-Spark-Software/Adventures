import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const trailTypes = pgTable("trail_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  key: text("key").notNull().unique(), // Machine-readable key (e.g., 'loop', 'out-and-back')
  description: text("description"),
  icon: text("icon"), // Optional icon name or SVG
  displayOrder: integer("display_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TrailType = typeof trailTypes.$inferSelect;
export type NewTrailType = typeof trailTypes.$inferInsert;
