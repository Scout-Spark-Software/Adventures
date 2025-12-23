import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { hikes } from "./hikes";
import { campingSites } from "./camping-sites";

export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  hikeId: uuid("hike_id").references(() => hikes.id, { onDelete: "cascade" }),
  campingSiteId: uuid("camping_site_id").references(() => campingSites.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notesRelations = relations(notes, ({ one }) => ({
  hike: one(hikes, {
    fields: [notes.hikeId],
    references: [hikes.id],
  }),
  campingSite: one(campingSites, {
    fields: [notes.campingSiteId],
    references: [campingSites.id],
  }),
}));

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
