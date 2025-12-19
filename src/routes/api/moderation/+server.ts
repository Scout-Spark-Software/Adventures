import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { moderationQueue, hikes, campingSites, alterations } from '$lib/db/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { requireModerator } from '$lib/auth/middleware';
import { updateModerationStatus } from '$lib/moderation';

export const GET: RequestHandler = async ({ url, locals }) => {
	const user = await requireModerator({ locals } as any);

	const status = url.searchParams.get('status') || 'pending';
	const entityType = url.searchParams.get('entity_type') as
		| 'hike'
		| 'camping_site'
		| 'alteration'
		| null;
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');

	const conditions = [eq(moderationQueue.status, status as 'pending' | 'approved' | 'rejected')];

	if (entityType) {
		conditions.push(eq(moderationQueue.entityType, entityType));
	}

	const queueItems = await db.query.moderationQueue.findMany({
		where: and(...conditions),
		limit,
		offset,
		orderBy: [desc(moderationQueue.createdAt)]
	});

	// Fetch the actual entities
	const enrichedItems = await Promise.all(
		queueItems.map(async (item) => {
			let entity = null;

			if (item.entityType === 'hike') {
				entity = await db.query.hikes.findFirst({
					where: eq(hikes.id, item.entityId)
				});
			} else if (item.entityType === 'camping_site') {
				entity = await db.query.campingSites.findFirst({
					where: eq(campingSites.id, item.entityId)
				});
			} else if (item.entityType === 'alteration') {
				entity = await db.query.alterations.findFirst({
					where: eq(alterations.id, item.entityId)
				});
			}

			return {
				...item,
				entity
			};
		})
	);

	return json(enrichedItems);
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	const user = await requireModerator({ locals } as any);

	const body = await request.json();
	const { entityType, entityId, status } = body;

	if (!entityType || !entityId || !status) {
		throw error(400, 'entityType, entityId, and status are required');
	}

	if (!['approved', 'rejected'].includes(status)) {
		throw error(400, 'status must be "approved" or "rejected"');
	}

	// Update moderation status
	await updateModerationStatus(entityType, entityId, status, user.id);

	// Update the actual entity status
	if (entityType === 'hike') {
		await db
			.update(hikes)
			.set({
				status,
				updatedAt: new Date()
			})
			.where(eq(hikes.id, entityId));
	} else if (entityType === 'camping_site') {
		await db
			.update(campingSites)
			.set({
				status,
				updatedAt: new Date()
			})
			.where(eq(campingSites.id, entityId));
	} else if (entityType === 'alteration') {
		await db
			.update(alterations)
			.set({
				status,
				reviewedBy: user.id,
				reviewedAt: new Date()
			})
			.where(eq(alterations.id, entityId));
	}

	return json({ success: true });
};

