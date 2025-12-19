<script lang="ts">
	import type { PageData } from './$types';
	import HikeCard from '$lib/components/HikeCard.svelte';
	import CampingSiteCard from '$lib/components/CampingSiteCard.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>Scouts Adventures - Discover Hikes & Camping Sites</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Hero Section -->
	<div class="bg-indigo-700">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
			<div class="text-center">
				<h1 class="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
					Scouts Adventures
				</h1>
				<p class="mt-3 max-w-md mx-auto text-base text-indigo-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
					Discover amazing hiking trails and camping sites for scouts
				</p>
			</div>
		</div>
	</div>

	<!-- Featured Hikes -->
	{#if data.featuredHikes && data.featuredHikes.length > 0}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-3xl font-bold text-gray-900">Featured Hikes</h2>
				<a href="/hikes" class="text-indigo-600 hover:text-indigo-800 font-medium">
					View All →
				</a>
			</div>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.featuredHikes as hike}
					<HikeCard {hike} />
				{/each}
			</div>
		</div>
	{/if}

	<!-- Featured Camping Sites -->
	{#if data.featuredCampingSites && data.featuredCampingSites.length > 0}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-3xl font-bold text-gray-900">Featured Camping Sites</h2>
				<a href="/camping" class="text-indigo-600 hover:text-indigo-800 font-medium">
					View All →
				</a>
			</div>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.featuredCampingSites as campingSite}
					<CampingSiteCard {campingSite} />
				{/each}
			</div>
		</div>
	{/if}

	<!-- Empty State -->
	{#if (!data.featuredHikes || data.featuredHikes.length === 0) && (!data.featuredCampingSites || data.featuredCampingSites.length === 0)}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
			<p class="text-gray-500 text-lg">No featured adventures yet. Check back soon!</p>
		</div>
	{/if}
</div>
