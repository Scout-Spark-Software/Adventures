import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { hikes } from './hikes';
import { campingSites } from './camping-sites';

export const favorites = pgTable('favorites', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id').notNull(),
	hikeId: uuid('hike_id').references(() => hikes.id),
	campingSiteId: uuid('camping_site_id').references(() => campingSites.id),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

