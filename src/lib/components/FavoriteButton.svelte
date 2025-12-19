<script lang="ts">
	import { onMount } from 'svelte';

	export let hikeId: string | null = null;
	export let campingSiteId: string | null = null;
	export let userId: string | null = null;

	let isFavorite = $state(false);
	let loading = $state(false);

	onMount(async () => {
		if (!userId) return;
		await checkFavorite();
	});

	async function checkFavorite() {
		if (!userId) return;
		try {
			const params = new URLSearchParams();
			if (hikeId) params.append('hike_id', hikeId);
			if (campingSiteId) params.append('camping_site_id', campingSiteId);
			const response = await fetch(`/api/favorites/${hikeId || campingSiteId}?${params}`);
			const data = await response.json();
			isFavorite = data.isFavorite;
		} catch (error) {
			console.error('Error checking favorite:', error);
		}
	}

	async function toggleFavorite() {
		if (!userId) {
			window.location.href = '/login';
			return;
		}
		loading = true;
		try {
			if (isFavorite) {
				const params = new URLSearchParams();
				if (hikeId) params.append('hike_id', hikeId);
				if (campingSiteId) params.append('camping_site_id', campingSiteId);
				await fetch(`/api/favorites/${hikeId || campingSiteId}?${params}`, {
					method: 'DELETE'
				});
			} else {
				await fetch('/api/favorites', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ hikeId, campingSiteId })
				});
			}
			isFavorite = !isFavorite;
		} catch (error) {
			console.error('Error toggling favorite:', error);
		} finally {
			loading = false;
		}
	}
</script>

<button
	onclick={toggleFavorite}
	disabled={loading || !userId}
	class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
>
	{#if isFavorite}
		<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
			<path
				fill-rule="evenodd"
				d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
				clip-rule="evenodd"
			/>
		</svg>
	{:else}
		<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
			/>
		</svg>
	{/if}
</button>

