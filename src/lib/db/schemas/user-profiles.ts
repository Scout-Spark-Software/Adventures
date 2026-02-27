import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { councils } from "./councils";

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id").primaryKey(),
  councilId: uuid("council_id").references(() => councils.id),
  unitType: text("unit_type"),
  unitNumber: text("unit_number"),
  showUnitInfo: boolean("show_unit_info").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  council: one(councils, {
    fields: [userProfiles.councilId],
    references: [councils.id],
  }),
}));

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
