import { pgTable, text, numeric, integer } from "drizzle-orm/pg-core";

export const completionStats = pgTable("completion_stats", {
  userId: text("user_id").primaryKey(),
  totalMiles: numeric("total_miles").default("0").notNull(),
  totalNights: integer("total_nights").default(0).notNull(),
  tripCount: integer("trip_count").default(0).notNull(),
});

export type CompletionStats = typeof completionStats.$inferSelect;
export type NewCompletionStats = typeof completionStats.$inferInsert;
