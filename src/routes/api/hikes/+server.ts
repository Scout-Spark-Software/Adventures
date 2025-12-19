import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { hikes } from '$lib/db/schemas';
import { eq, and, or, desc } from 'drizzle-orm';
import { requireAuth } from '$lib/auth/middleware';
import { addToModerationQueue } from '$lib/moderation';

export const GET: RequestHandler = async ({ url, locals }) => {
	const status = url.searchParams.get('status');
	const featured = url.searchParams.get('featured');
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');

	const conditions = [];

	if (status) {
		conditions.push(eq(hikes.status, status as 'pending' | 'approved' | 'rejected'));
	} else {
		// By default, only show approved hikes to non-admins
		if (!locals.userId) {
			conditions.push(eq(hikes.status, 'approved'));
		}
	}

	if (featured === 'true') {
		conditions.push(eq(hikes.featured, true));
		// Featured items must also be approved
		conditions.push(eq(hikes.status, 'approved'));
	}

	const results = await db.query.hikes.findMany({
		where: conditions.length > 0 ? and(...conditions) : undefined,
		limit,
		offset,
		orderBy: [desc(hikes.createdAt)]
	});

	return json(results);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireAuth({ locals } as any);

	const body = await request.json();
	const {
		name,
		description,
		location,
		latitude,
		longitude,
		difficulty,
		distance,
		duration,
		elevation,
		trailType,
		features
	} = body;

	if (!name || !location) {
		throw error(400, 'Name and location are required');
	}

	const [newHike] = await db
		.insert(hikes)
		.values({
			name,
			description,
			location,
			latitude,
			longitude,
			difficulty,
			distance,
			duration,
			elevation,
			trailType,
			features: features ? JSON.parse(JSON.stringify(features)) : null,
			status: 'pending',
			createdBy: user.id
		})
		.returning();

	// Add to moderation queue
	await addToModerationQueue('hike', newHike.id);

	return json(newHike, { status: 201 });
};

