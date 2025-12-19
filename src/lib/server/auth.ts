import {
	STACK_PROJECT_ID,
	STACK_PUBLISHABLE_CLIENT_KEY,
	STACK_SECRET_SERVER_KEY
} from '$env/static/private';

if (!STACK_PROJECT_ID || !STACK_PUBLISHABLE_CLIENT_KEY || !STACK_SECRET_SERVER_KEY) {
	throw new Error(
		'Stack Auth environment variables are not set. ' +
			'Please ensure STACK_PROJECT_ID, STACK_PUBLISHABLE_CLIENT_KEY, and STACK_SECRET_SERVER_KEY are in your .env file.'
	);
}

const STACK_API_URL = 'https://api.stack-auth.com/api/v1';

interface StackAuthHeaders {
	'Content-Type': string;
	'x-stack-project-id': string;
	'x-stack-publishable-client-key': string;
	'x-stack-secret-server-key'?: string;
	'x-stack-access-type': string;
}

function getHeaders(includeSecret = false): StackAuthHeaders {
	const headers: StackAuthHeaders = {
		'Content-Type': 'application/json',
		'x-stack-project-id': STACK_PROJECT_ID,
		'x-stack-publishable-client-key': STACK_PUBLISHABLE_CLIENT_KEY,
		'x-stack-access-type': 'server'
	};

	if (includeSecret) {
		headers['x-stack-secret-server-key'] = STACK_SECRET_SERVER_KEY;
	}

	return headers;
}

export const stackAuth = {
	async signUp(email: string, password: string, name?: string) {
		// First, sign up the user
		const response = await fetch(`${STACK_API_URL}/auth/password/sign-up`, {
			method: 'POST',
			headers: getHeaders(true),
			body: JSON.stringify({
				email,
				password
			})
		});

		if (!response.ok) {
			const text = await response.text();
			let errorMessage = 'Signup failed';
			try {
				const error = JSON.parse(text);
				errorMessage = error.message || error.error || errorMessage;
			} catch {
				errorMessage = text || errorMessage;
			}
			throw new Error(errorMessage);
		}

		const result = await response.json();

		// If name is provided, update the user profile
		if (name && result.access_token) {
			try {
				await fetch(`${STACK_API_URL}/users/me`, {
					method: 'PATCH',
					headers: {
						...getHeaders(true),
						'x-stack-access-token': result.access_token
					},
					body: JSON.stringify({
						display_name: name
					})
				});
			} catch (error) {
				// Don't fail signup if profile update fails
				console.error('Failed to update display name:', error);
			}
		}

		return result;
	},

	async signIn(email: string, password: string) {
		const response = await fetch(`${STACK_API_URL}/auth/password/sign-in`, {
			method: 'POST',
			headers: getHeaders(true),
			body: JSON.stringify({
				email,
				password
			})
		});

		if (!response.ok) {
			const text = await response.text();
			console.error('Stack Auth API error response:', {
				status: response.status,
				statusText: response.statusText,
				body: text
			});
			let errorMessage = 'Sign in failed';
			try {
				const error = JSON.parse(text);
				errorMessage = error.message || error.error || errorMessage;
			} catch {
				errorMessage = text || errorMessage;
			}
			throw new Error(errorMessage);
		}

		return response.json();
	},

	async verifySession(accessToken: string) {
		const response = await fetch(`${STACK_API_URL}/users/me`, {
			method: 'GET',
			headers: {
				...getHeaders(true),
				'x-stack-access-token': accessToken
			}
		});

		if (!response.ok) {
			return null;
		}

		return response.json();
	},

	async signOut(accessToken: string) {
		const response = await fetch(`${STACK_API_URL}/auth/password/sign-out`, {
			method: 'POST',
			headers: {
				...getHeaders(true),
				'x-stack-access-token': accessToken
			}
		});

		return response.ok;
	}
};
