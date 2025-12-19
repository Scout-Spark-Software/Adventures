import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { stackAuth } from '$lib/server/auth';

const authHandle: Handle = async ({ event, resolve }) => {
	// Get the access token from cookies
	const accessToken = event.cookies.get('stack_access_token');

	if (accessToken) {
		try {
			// Validate the session with Stack Auth
			const user = await stackAuth.verifySession(accessToken);
			console.log('Stack Auth user response:', user);

			if (user) {
				// Set user info in locals for use throughout the app
				event.locals.user = {
					id: user.id,
					email: user.primary_email,
					name: user.display_name || user.primary_email
				};
				event.locals.userId = user.id;
				console.log('User set in locals:', event.locals.user);
			} else {
				// Invalid or expired session
				event.locals.user = null;
				event.locals.userId = null;
			}
		} catch (error) {
			// Session validation failed
			console.error('Session validation error:', error);
			event.locals.user = null;
			event.locals.userId = null;
		}
	} else {
		// No session token
		console.log('No access token found in cookies');
		event.locals.user = null;
		event.locals.userId = null;
	}

	return resolve(event);
};

export const handle: Handle = sequence(authHandle);

