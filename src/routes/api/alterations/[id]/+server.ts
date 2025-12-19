import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { alterations, hikes, campingSites } from '$lib/db/schemas';
import { eq } from 'drizzle-orm';
import { requireModerator } from '$lib/auth/middleware';
import { updateModerationStatus } from '$lib/moderation';

export const GET: RequestHandler = async ({ params }) => {
	const alteration = await db.query.alterations.findFirst({
		where: eq(alterations.id, params.id)
	});

	if (!alteration) {
		throw error(404, 'Alteration not found');
	}

	return json(alteration);
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const user = await requireModerator({ locals } as any);

	const body = await request.json();
	const { status, apply } = body;

	if (!status || !['approved', 'rejected'].includes(status)) {
		throw error(400, 'status must be "approved" or "rejected"');
	}

	const alteration = await db.query.alterations.findFirst({
		where: eq(alterations.id, params.id)
	});

	if (!alteration) {
		throw error(404, 'Alteration not found');
	}

	// Update moderation status
	await updateModerationStatus('alteration', alteration.id, status, user.id);

	// Update alteration record
	const [updatedAlteration] = await db
		.update(alterations)
		.set({
			status,
			reviewedBy: user.id,
			reviewedAt: new Date()
		})
		.where(eq(alterations.id, params.id))
		.returning();

	// If approved and apply is true, apply the alteration to the entity
	if (status === 'approved' && apply) {
		if (alteration.hikeId) {
			await db
				.update(hikes)
				.set({
					[alteration.fieldName]: alteration.newValue,
					updatedAt: new Date()
				})
				.where(eq(hikes.id, alteration.hikeId));
		} else if (alteration.campingSiteId) {
			await db
				.update(campingSites)
				.set({
					[alteration.fieldName]: alteration.newValue,
					updatedAt: new Date()
				})
				.where(eq(campingSites.id, alteration.campingSiteId));
		}
	}

	return json(updatedAlteration);
};

