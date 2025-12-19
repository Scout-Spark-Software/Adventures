<script lang="ts">
	import type { PageData } from './$types';
	import HikeCard from '$lib/components/HikeCard.svelte';
	import CampingSiteCard from '$lib/components/CampingSiteCard.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>My Favorites - Scouts Adventures</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">My Favorites</h1>

		{#if data.hikes && data.hikes.length > 0}
			<div class="mb-12">
				<h2 class="text-2xl font-semibold text-gray-900 mb-4">Favorite Hikes</h2>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.hikes as hike}
						<HikeCard {hike} />
					{/each}
				</div>
			</div>
		{/if}

		{#if data.campingSites && data.campingSites.length > 0}
			<div>
				<h2 class="text-2xl font-semibold text-gray-900 mb-4">Favorite Camping Sites</h2>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.campingSites as campingSite}
						<CampingSiteCard {campingSite} />
					{/each}
				</div>
			</div>
		{/if}

		{#if (!data.hikes || data.hikes.length === 0) && (!data.campingSites || data.campingSites.length === 0)}
			<div class="text-center py-12">
				<p class="text-gray-500 text-lg">You haven't favorited any adventures yet.</p>
			</div>
		{/if}
	</div>
</div>

