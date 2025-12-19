// See https://kit.svelte.dev/docs/types#app
// for information about these types
declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
				name?: string;
			} | null;
			userId: string | null;
		}
		// interface Error {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
