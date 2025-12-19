<script lang="ts">
	import type { PageData } from './$types';
	import HikeCard from '$lib/components/HikeCard.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>Hikes - Scouts Adventures</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">All Hikes</h1>

		{#if data.hikes && data.hikes.length > 0}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.hikes as hike}
					<HikeCard {hike} />
				{/each}
			</div>
		{:else}
			<div class="text-center py-12">
				<p class="text-gray-500 text-lg">No hikes found.</p>
			</div>
		{/if}
	</div>
</div>

