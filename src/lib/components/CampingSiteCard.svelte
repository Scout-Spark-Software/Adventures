<script lang="ts">
	import type { CampingSite } from '$lib/db/schemas';
	import ModerationBadge from './ModerationBadge.svelte';

	export let campingSite: CampingSite;
</script>

<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
	<div class="p-6">
		<div class="flex items-start justify-between mb-2">
			<h3 class="text-xl font-semibold text-gray-900">{campingSite.name}</h3>
			<ModerationBadge status={campingSite.status} />
		</div>
		{#if campingSite.description}
			<p class="text-gray-600 mb-4 line-clamp-2">{campingSite.description}</p>
		{/if}
		<div class="space-y-2 text-sm text-gray-500">
			{#if campingSite.location}
				<p class="flex items-center">
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					{campingSite.location}
				</p>
			{/if}
			{#if campingSite.capacity}
				<p>Capacity: {campingSite.capacity}</p>
			{/if}
		</div>
		<div class="mt-4">
			<a
				href="/camping/{campingSite.id}"
				class="text-indigo-600 hover:text-indigo-800 font-medium"
			>
				View Details →
			</a>
		</div>
	</div>
</div>

