import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const [featuredHikes, featuredCampingSites] = await Promise.all([
		fetch('/api/hikes?featured=true&limit=6').then((r) => r.json()),
		fetch('/api/camping-sites?featured=true&limit=6').then((r) => r.json())
	]);

	return {
		featuredHikes: featuredHikes || [],
		featuredCampingSites: featuredCampingSites || []
	};
};

