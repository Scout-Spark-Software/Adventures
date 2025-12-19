import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/auth/middleware';

export const load: PageServerLoad = async (event) => {
	const user = requireAuth(event);
	return {
		user
	};
};

