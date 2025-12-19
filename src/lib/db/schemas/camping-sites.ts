import { pgTable, text, timestamp, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { statusEnum } from './enums';

export const campingSites = pgTable('camping_sites', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	location: text('location').notNull(),
	latitude: text('latitude'),
	longitude: text('longitude'),
	capacity: text('capacity'),
	amenities: jsonb('amenities'),
	facilities: jsonb('facilities'),
	reservationInfo: text('reservation_info'),
	status: statusEnum('status').default('pending').notNull(),
	featured: boolean('featured').default(false).notNull(),
	createdBy: uuid('created_by').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type CampingSite = typeof campingSites.$inferSelect;
export type NewCampingSite = typeof campingSites.$inferInsert;

