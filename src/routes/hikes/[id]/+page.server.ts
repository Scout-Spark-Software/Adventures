import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const hike = await fetch(`/api/hikes/${params.id}`).then((r) => {
		if (!r.ok) throw error(r.status, 'Hike not found');
		return r.json();
	});

	const files = await fetch(`/api/files?entity_type=hike&entity_id=${params.id}`).then((r) =>
		r.json()
	);

	return {
		hike,
		files: files || []
	};
};

