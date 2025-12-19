import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export function requireAuth(event: RequestEvent) {
	if (!event.locals.user || !event.locals.userId) {
		throw redirect(302, '/login');
	}
	return event.locals.user;
}

export async function requireAdmin(event: RequestEvent) {
	const user = requireAuth(event);
	const { isAdmin } = await import('./index');
	const isUserAdmin = await isAdmin(user.id);
	if (!isUserAdmin) {
		throw redirect(302, '/');
	}
	return user;
}

export async function requireModerator(event: RequestEvent) {
	const user = requireAuth(event);
	const { isModerator } = await import('./index');
	const isUserModerator = await isModerator(user.id);
	if (!isUserModerator) {
		throw redirect(302, '/');
	}
	return user;
}

