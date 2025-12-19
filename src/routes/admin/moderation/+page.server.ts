import type { PageServerLoad } from './$types';
import { requireModerator } from '$lib/auth/middleware';

export const load: PageServerLoad = async ({ fetch }) => {
	const queue = await fetch('/api/moderation?status=pending').then((r) => r.json());
	return { queue: queue || [] };
};

