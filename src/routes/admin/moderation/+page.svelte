<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;

	async function approveItem(entityType: string, entityId: string) {
		await fetch('/api/moderation', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ entityType, entityId, status: 'approved' })
		});
		window.location.reload();
	}

	async function rejectItem(entityType: string, entityId: string) {
		await fetch('/api/moderation', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ entityType, entityId, status: 'rejected' })
		});
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Moderation Queue - Scouts Adventures</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Moderation Queue</h1>

		{#if data.queue && data.queue.length > 0}
			<div class="space-y-4">
				{#each data.queue as item}
					<div class="bg-white rounded-lg shadow p-6">
						<div class="flex items-start justify-between mb-4">
							<div>
								<h3 class="text-lg font-semibold text-gray-900">
									{item.entityType === 'hike' ? 'Hike' : item.entityType === 'camping_site' ? 'Camping Site' : 'Alteration'}
								</h3>
								{#if item.entity}
									<p class="text-gray-600 mt-1">
										{item.entity.name || `Alteration for ${item.entity.fieldName}`}
									</p>
								{/if}
							</div>
							<div class="flex space-x-2">
								<button
									onclick={() => approveItem(item.entityType, item.entityId)}
									class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
								>
									Approve
								</button>
								<button
									onclick={() => rejectItem(item.entityType, item.entityId)}
									class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
								>
									Reject
								</button>
							</div>
						</div>
						{#if item.entity && item.entity.description}
							<p class="text-gray-700 text-sm">{item.entity.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-12">
				<p class="text-gray-500 text-lg">No items pending moderation.</p>
			</div>
		{/if}
	</div>
</div>

