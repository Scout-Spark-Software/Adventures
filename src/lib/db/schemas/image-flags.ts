import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { statusEnum } from "./enums";
import { files } from "./files";

export const imageFlags = pgTable("image_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileId: uuid("file_id")
    .notNull()
    .references(() => files.id, { onDelete: "cascade" }),
  flaggedBy: text("flagged_by").notNull(),
  reason: text("reason"),
  status: statusEnum("status").default("pending").notNull(),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const imageFlagsRelations = relations(imageFlags, ({ one }) => ({
  file: one(files, {
    fields: [imageFlags.fileId],
    references: [files.id],
  }),
}));

export type ImageFlag = typeof imageFlags.$inferSelect;
export type NewImageFlag = typeof imageFlags.$inferInsert;
