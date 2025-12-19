import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/auth/middleware';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const user = requireAuth({ locals } as any);

	const favorites = await fetch('/api/favorites').then((r) => r.json());

	// Fetch the actual hikes and camping sites
	const hikeIds = favorites.filter((f: any) => f.hikeId).map((f: any) => f.hikeId);
	const campingSiteIds = favorites
		.filter((f: any) => f.campingSiteId)
		.map((f: any) => f.campingSiteId);

	const [hikes, campingSites] = await Promise.all([
		hikeIds.length > 0
			? Promise.all(
					hikeIds.map((id: string) =>
						fetch(`/api/hikes/${id}`).then((r) => r.json()).catch(() => null)
					)
				).then((results) => results.filter((r) => r !== null))
			: Promise.resolve([]),
		campingSiteIds.length > 0
			? Promise.all(
					campingSiteIds.map((id: string) =>
						fetch(`/api/camping-sites/${id}`).then((r) => r.json()).catch(() => null)
					)
				).then((results) => results.filter((r) => r !== null))
			: Promise.resolve([])
	]);

	return {
		favorites,
		hikes: hikes || [],
		campingSites: campingSites || []
	};
};

