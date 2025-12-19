import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAuth } from '$lib/auth/middleware';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);
	return {};
};

export const actions: Actions = {
	submitHike: async ({ request, locals, fetch }) => {
		const user = requireAuth({ locals } as any);
		const formData = await request.formData();

		const hikeData = {
			name: formData.get('name'),
			description: formData.get('description'),
			location: formData.get('location'),
			latitude: formData.get('latitude'),
			longitude: formData.get('longitude'),
			difficulty: formData.get('difficulty'),
			distance: formData.get('distance'),
			duration: formData.get('duration'),
			elevation: formData.get('elevation'),
			trailType: formData.get('trail_type'),
			features: formData.get('features') ? JSON.parse(formData.get('features') as string) : null
		};

		const response = await fetch('/api/hikes', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(hikeData)
		});

		if (!response.ok) {
			return { error: 'Failed to submit hike' };
		}

		const hike = await response.json();
		throw redirect(302, `/hikes/${hike.id}`);
	},

	submitCampingSite: async ({ request, locals, fetch }) => {
		const user = requireAuth({ locals } as any);
		const formData = await request.formData();

		const campingSiteData = {
			name: formData.get('name'),
			description: formData.get('description'),
			location: formData.get('location'),
			latitude: formData.get('latitude'),
			longitude: formData.get('longitude'),
			capacity: formData.get('capacity'),
			amenities: formData.get('amenities')
				? JSON.parse(formData.get('amenities') as string)
				: null,
			facilities: formData.get('facilities')
				? JSON.parse(formData.get('facilities') as string)
				: null,
			reservationInfo: formData.get('reservation_info')
		};

		const response = await fetch('/api/camping-sites', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(campingSiteData)
		});

		if (!response.ok) {
			return { error: 'Failed to submit camping site' };
		}

		const campingSite = await response.json();
		throw redirect(302, `/camping/${campingSite.id}`);
	}
};

