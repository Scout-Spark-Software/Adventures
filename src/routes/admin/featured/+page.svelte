<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	async function toggleFeatured(type: 'hike' | 'camping_site', id: string, currentlyFeatured: boolean) {
		await fetch(`/api/${type === 'hike' ? 'hikes' : 'camping-sites'}/${id}/featured`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ featured: !currentlyFeatured })
		});
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Featured Items - Scouts Adventures</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Manage Featured Items</h1>

		<div class="mb-12">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">Hikes</h2>
			<div class="bg-white shadow rounded-lg overflow-hidden">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Name
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Location
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Featured
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Action
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.hikes as hike}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{hike.name}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{hike.location}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{hike.featured ? 'Yes' : 'No'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button
										onclick={() => toggleFeatured('hike', hike.id, hike.featured)}
										class="text-indigo-600 hover:text-indigo-900"
									>
										{hike.featured ? 'Remove from Featured' : 'Add to Featured'}
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div>
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">Camping Sites</h2>
			<div class="bg-white shadow rounded-lg overflow-hidden">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Name
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Location
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Featured
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Action
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.campingSites as campingSite}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{campingSite.name}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{campingSite.location}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{campingSite.featured ? 'Yes' : 'No'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button
										onclick={() =>
											toggleFeatured('camping_site', campingSite.id, campingSite.featured)}
										class="text-indigo-600 hover:text-indigo-900"
									>
										{campingSite.featured ? 'Remove from Featured' : 'Add to Featured'}
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

