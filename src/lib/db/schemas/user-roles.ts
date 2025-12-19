import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { roleEnum } from './enums';

export const userRoles = pgTable('user_roles', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id').notNull().unique(),
	role: roleEnum('role').default('user').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

