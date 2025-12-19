import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schemas';

// In SvelteKit/Vite, VITE_ prefixed variables are available via import.meta.env (not process.env)
// For server-only secrets, DATABASE_URL (without VITE_ prefix) works with process.env
// For Node.js scripts, only process.env is available
const databaseUrl = process.env.DATABASE_URL || (typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_DATABASE_URL : undefined);

if (!databaseUrl) {
	throw new Error(
		'DATABASE_URL or VITE_DATABASE_URL environment variable is not set. ' +
			'Please create a .env file in the project root with one of these variables set.'
	);
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

