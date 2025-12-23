import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { hikes } from "./hikes";
import { campingSites } from "./camping-sites";
import { fileEntityTypeEnum, fileTypeEnum } from "./enums";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: fileEntityTypeEnum("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  fileType: fileTypeEnum("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
