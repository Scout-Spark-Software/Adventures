import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const status = url.searchParams.get('status') || '';
	const params = new URLSearchParams();
	if (status) params.append('status', status);
	
	const hikes = await fetch(`/api/hikes?${params.toString()}`).then((r) => r.json());
	return { hikes: hikes || [] };
};

