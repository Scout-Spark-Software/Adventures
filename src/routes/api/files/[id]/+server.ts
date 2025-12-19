import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { files } from '$lib/db/schemas';
import { eq } from 'drizzle-orm';
import { requireAuth } from '$lib/auth/middleware';
import { deleteFile } from '$lib/storage/blob';

export const GET: RequestHandler = async ({ params }) => {
	const file = await db.query.files.findFirst({
		where: eq(files.id, params.id)
	});

	if (!file) {
		throw error(404, 'File not found');
	}

	return json(file);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = requireAuth({ locals } as any);

	const file = await db.query.files.findFirst({
		where: eq(files.id, params.id)
	});

	if (!file) {
		throw error(404, 'File not found');
	}

	// Only uploader or admin can delete
	if (file.uploadedBy !== user.id) {
		const { isAdmin } = await import('$lib/auth');
		const isUserAdmin = await isAdmin(user.id);
		if (!isUserAdmin) {
			throw error(403, 'Not authorized to delete this file');
		}
	}

	// Extract pathname from URL
	const urlObj = new URL(file.fileUrl);
	const pathname = urlObj.pathname;

	// Delete from Vercel Blob
	await deleteFile(pathname);

	// Delete from database
	await db.delete(files).where(eq(files.id, params.id));

	return json({ success: true });
};

