import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const campingSite = await fetch(`/api/camping-sites/${params.id}`).then((r) => {
		if (!r.ok) throw error(r.status, 'Camping site not found');
		return r.json();
	});

	const files = await fetch(
		`/api/files?entity_type=camping_site&entity_id=${params.id}`
	).then((r) => r.json());

	return {
		campingSite,
		files: files || []
	};
};

