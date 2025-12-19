import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/auth/middleware';

export const load: PageServerLoad = async (event) => {
	const user = await requireAdmin(event);
	return { user };
};

