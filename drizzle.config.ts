import { defineConfig } from 'drizzle-kit';

const connectionString = process.env.DATABASE_NAME || process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_NAME, VITE_DATABASE_URL, or DATABASE_URL environment variable is not set');
}

export default defineConfig({
	schema: './src/lib/db/schemas/*.ts',
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		connectionString: connectionString
	}
});

