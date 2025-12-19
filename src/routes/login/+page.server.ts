import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		// Placeholder for Neon Auth login
		// This will be replaced with actual Neon Auth implementation
		return fail(401, { error: 'Authentication not yet configured' });
	}
};

