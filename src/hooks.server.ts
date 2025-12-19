import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// For now, we'll use a simple session-based auth
// Neon Auth integration will be added when credentials are available
const authHandle: Handle = async ({ event, resolve }) => {
	// Placeholder for Neon Auth integration
	// This will be replaced with actual Neon Auth implementation
	event.locals.user = null;
	event.locals.userId = null;

	return resolve(event);
};

export const handle: Handle = sequence(authHandle);

