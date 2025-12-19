import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stackAuth } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	// Get the access token
	const accessToken = cookies.get('stack_access_token');

	if (accessToken) {
		try {
			// Sign out with Stack Auth
			await stackAuth.signOut(accessToken);
		} catch (error) {
			console.error('Logout error:', error);
		}
	}

	// Clear the session cookie
	cookies.delete('stack_access_token', { path: '/' });

	// Redirect to login page
	throw redirect(303, '/login');
};

