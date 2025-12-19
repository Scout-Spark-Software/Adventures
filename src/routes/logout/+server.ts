import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	// Clear auth cookie
	cookies.delete('session', { path: '/' });
	throw redirect(302, '/login');
};

