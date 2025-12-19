import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { campingSites } from '$lib/db/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '$lib/auth/middleware';
import { addToModerationQueue } from '$lib/moderation';

export const GET: RequestHandler = async ({ url, locals }) => {
	const status = url.searchParams.get('status');
	const featured = url.searchParams.get('featured');
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');

	const conditions = [];

	if (status) {
		conditions.push(eq(campingSites.status, status as 'pending' | 'approved' | 'rejected'));
	} else {
		// By default, only show approved camping sites to non-admins
		if (!locals.userId) {
			conditions.push(eq(campingSites.status, 'approved'));
		}
	}

	if (featured === 'true') {
		conditions.push(eq(campingSites.featured, true));
		// Featured items must also be approved
		conditions.push(eq(campingSites.status, 'approved'));
	}

	const results = await db.query.campingSites.findMany({
		where: conditions.length > 0 ? and(...conditions) : undefined,
		limit,
		offset,
		orderBy: [desc(campingSites.createdAt)]
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
		capacity,
		amenities,
		facilities,
		reservationInfo
	} = body;

	if (!name || !location) {
		throw error(400, 'Name and location are required');
	}

	const [newCampingSite] = await db
		.insert(campingSites)
		.values({
			name,
			description,
			location,
			latitude,
			longitude,
			capacity,
			amenities: amenities ? JSON.parse(JSON.stringify(amenities)) : null,
			facilities: facilities ? JSON.parse(JSON.stringify(facilities)) : null,
			reservationInfo,
			status: 'pending',
			createdBy: user.id
		})
		.returning();

	// Add to moderation queue
	await addToModerationQueue('camping_site', newCampingSite.id);

	return json(newCampingSite, { status: 201 });
};

