import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const series = pgTable("series", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
