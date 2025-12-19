<script lang="ts">
	import type { PageData } from './$types';
	import FavoriteButton from '$lib/components/FavoriteButton.svelte';
	import ModerationBadge from '$lib/components/ModerationBadge.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.hike.name} - Scouts Adventures</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="bg-white shadow rounded-lg overflow-hidden">
			<div class="p-6">
				<div class="flex items-start justify-between mb-4">
					<div class="flex-1">
						<h1 class="text-3xl font-bold text-gray-900 mb-2">{data.hike.name}</h1>
						<ModerationBadge status={data.hike.status} />
					</div>
					<FavoriteButton hikeId={data.hike.id} userId={null} />
				</div>

				{#if data.hike.description}
					<div class="prose max-w-none mb-6">
						<p class="text-gray-700">{data.hike.description}</p>
					</div>
				{/if}

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					{#if data.hike.location}
						<div>
							<h3 class="text-sm font-medium text-gray-500 mb-1">Location</h3>
							<p class="text-gray-900">{data.hike.location}</p>
						</div>
					{/if}
					{#if data.hike.difficulty}
						<div>
							<h3 class="text-sm font-medium text-gray-500 mb-1">Difficulty</h3>
							<p class="text-gray-900">{data.hike.difficulty}</p>
						</div>
					{/if}
					{#if data.hike.distance}
						<div>
							<h3 class="text-sm font-medium text-gray-500 mb-1">Distance</h3>
							<p class="text-gray-900">{data.hike.distance}</p>
						</div>
					{/if}
					{#if data.hike.duration}
						<div>
							<h3 class="text-sm font-medium text-gray-500 mb-1">Duration</h3>
							<p class="text-gray-900">{data.hike.duration}</p>
						</div>
					{/if}
					{#if data.hike.elevation}
						<div>
							<h3 class="text-sm font-medium text-gray-500 mb-1">Elevation</h3>
							<p class="text-gray-900">{data.hike.elevation}</p>
						</div>
					{/if}
					{#if data.hike.trailType}
						<div>
							<h3 class="text-sm font-medium text-gray-500 mb-1">Trail Type</h3>
							<p class="text-gray-900">{data.hike.trailType}</p>
						</div>
					{/if}
				</div>

				{#if data.files && data.files.length > 0}
					<div class="mt-6">
						<h3 class="text-lg font-medium text-gray-900 mb-4">Images & Documents</h3>
						<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
							{#each data.files as file}
								{#if file.fileType === 'image'}
									<img
										src={file.fileUrl}
										alt={file.fileName}
										class="w-full h-48 object-cover rounded-lg"
									/>
								{:else}
									<a
										href={file.fileUrl}
										target="_blank"
										class="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200"
									>
										<p class="text-sm font-medium text-gray-900">{file.fileName}</p>
									</a>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

