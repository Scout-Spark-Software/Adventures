import { pgEnum } from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('status', ['pending', 'approved', 'rejected']);
export const roleEnum = pgEnum('role', ['admin', 'moderator', 'user']);
export const entityTypeEnum = pgEnum('entity_type', ['hike', 'camping_site', 'alteration']);
export const fileEntityTypeEnum = pgEnum('file_entity_type', ['hike', 'camping_site']);
export const fileTypeEnum = pgEnum('file_type', ['image', 'document']);

