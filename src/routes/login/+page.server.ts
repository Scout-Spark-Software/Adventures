import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { stackAuth } from '$lib/server/auth';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		try {
			// Sign in with Stack Auth
			const result = await stackAuth.signIn(email, password);

			// Set the access token cookie
			if (result.access_token) {
				cookies.set('stack_access_token', result.access_token, {
					path: '/',
					httpOnly: true,
					sameSite: 'lax',
					secure: process.env.NODE_ENV === 'production',
					maxAge: 60 * 60 * 24 * 7 // 7 days
				});
			}

			// Redirect to home or dashboard
			throw redirect(303, '/');
		} catch (error) {
			// SvelteKit redirects throw a special Redirect object with a status property
			// We need to re-throw it so SvelteKit can handle the redirect
			if (typeof error === 'object' && error !== null && 'status' in error && 'location' in error) {
				throw error;
			}
			console.error('Login error:', error);
			return fail(500, {
				error: error instanceof Error ? error.message : 'An unexpected error occurred'
			});
		}
	}
};

