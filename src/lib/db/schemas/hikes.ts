import { pgTable, text, timestamp, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { statusEnum } from './enums';

export const hikes = pgTable('hikes', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	location: text('location').notNull(),
	latitude: text('latitude'),
	longitude: text('longitude'),
	difficulty: text('difficulty'),
	distance: text('distance'),
	duration: text('duration'),
	elevation: text('elevation'),
	trailType: text('trail_type'),
	features: jsonb('features'),
	status: statusEnum('status').default('pending').notNull(),
	featured: boolean('featured').default(false).notNull(),
	createdBy: uuid('created_by').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type Hike = typeof hikes.$inferSelect;
export type NewHike = typeof hikes.$inferInsert;

