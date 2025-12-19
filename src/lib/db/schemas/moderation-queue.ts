import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { statusEnum, entityTypeEnum } from './enums';

export const moderationQueue = pgTable('moderation_queue', {
	id: uuid('id').defaultRandom().primaryKey(),
	entityType: entityTypeEnum('entity_type').notNull(),
	entityId: uuid('entity_id').notNull(),
	status: statusEnum('status').default('pending').notNull(),
	reviewedBy: uuid('reviewed_by'),
	reviewedAt: timestamp('reviewed_at'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export type ModerationQueue = typeof moderationQueue.$inferSelect;
export type NewModerationQueue = typeof moderationQueue.$inferInsert;

