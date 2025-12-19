import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/auth/middleware';

export const load: PageServerLoad = async ({ fetch }) => {
	const [hikes, campingSites] = await Promise.all([
		fetch('/api/hikes?status=approved').then((r) => r.json()),
		fetch('/api/camping-sites?status=approved').then((r) => r.json())
	]);

	return {
		hikes: hikes || [],
		campingSites: campingSites || []
	};
};

