import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const councils = pgTable("councils", {
  id: uuid("id").defaultRandom().primaryKey(),
  councilNumber: integer("council_number").notNull().unique(),
  name: text("name").notNull(),
  headquartersCity: text("headquarters_city"),
  headquartersState: text("headquarters_state"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Council = typeof councils.$inferSelect;
export type NewCouncil = typeof councils.$inferInsert;
