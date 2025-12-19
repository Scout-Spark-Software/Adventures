import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const status = url.searchParams.get('status') || '';
	const params = new URLSearchParams();
	if (status) params.append('status', status);
	
	const campingSites = await fetch(`/api/camping-sites?${params.toString()}`).then((r) => r.json());
	return { campingSites: campingSites || [] };
};

