import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { hikes } from "./hikes";
import { campingSites } from "./camping-sites";
import { statusEnum } from "./enums";

export const alterations = pgTable("alterations", {
  id: uuid("id").defaultRandom().primaryKey(),
  hikeId: uuid("hike_id").references(() => hikes.id),
  campingSiteId: uuid("camping_site_id").references(() => campingSites.id),
  fieldName: text("field_name").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value").notNull(),
  reason: text("reason"),
  status: statusEnum("status").default("pending").notNull(),
  submittedBy: text("submitted_by").notNull(),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Alteration = typeof alterations.$inferSelect;
export type NewAlteration = typeof alterations.$inferInsert;
