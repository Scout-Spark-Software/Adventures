<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let type = $state<'hike' | 'camping_site'>('hike');
</script>

<svelte:head>
	<title>Submit Adventure - Scouts Adventures</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
	<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Submit New Adventure</h1>

		<div class="bg-white shadow rounded-lg p-6">
			<div class="mb-6">
				<label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
				<select bind:value={type} class="block w-full rounded-md border-gray-300 shadow-sm">
					<option value="hike">Hike</option>
					<option value="camping_site">Camping Site</option>
				</select>
			</div>

			{#if type === 'hike'}
				<form method="POST" action="?/submitHike" use:enhance>
					<div class="space-y-4">
						<div>
							<label for="name" class="block text-sm font-medium text-gray-700">
								Name *
							</label>
							<input
								type="text"
								id="name"
								name="name"
								required
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							/>
						</div>
						<div>
							<label for="description" class="block text-sm font-medium text-gray-700">
								Description
							</label>
							<textarea
								id="description"
								name="description"
								rows="4"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							></textarea>
						</div>
						<div>
							<label for="location" class="block text-sm font-medium text-gray-700">
								Location *
							</label>
							<input
								type="text"
								id="location"
								name="location"
								required
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							/>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="difficulty" class="block text-sm font-medium text-gray-700">
									Difficulty
								</label>
								<input
									type="text"
									id="difficulty"
									name="difficulty"
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>
							<div>
								<label for="distance" class="block text-sm font-medium text-gray-700">
									Distance
								</label>
								<input
									type="text"
									id="distance"
									name="distance"
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="duration" class="block text-sm font-medium text-gray-700">
									Duration
								</label>
								<input
									type="text"
									id="duration"
									name="duration"
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>
							<div>
								<label for="elevation" class="block text-sm font-medium text-gray-700">
									Elevation
								</label>
								<input
									type="text"
									id="elevation"
									name="elevation"
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>
						</div>
						<div>
							<label for="trail_type" class="block text-sm font-medium text-gray-700">
								Trail Type
							</label>
							<input
								type="text"
								id="trail_type"
								name="trail_type"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							/>
						</div>
						<button
							type="submit"
							class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Submit Hike
						</button>
					</div>
				</form>
			{:else}
				<form method="POST" action="?/submitCampingSite" use:enhance>
					<div class="space-y-4">
						<div>
							<label for="name" class="block text-sm font-medium text-gray-700">
								Name *
							</label>
							<input
								type="text"
								id="name"
								name="name"
								required
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							/>
						</div>
						<div>
							<label for="description" class="block text-sm font-medium text-gray-700">
								Description
							</label>
							<textarea
								id="description"
								name="description"
								rows="4"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							></textarea>
						</div>
						<div>
							<label for="location" class="block text-sm font-medium text-gray-700">
								Location *
							</label>
							<input
								type="text"
								id="location"
								name="location"
								required
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							/>
						</div>
						<div>
							<label for="capacity" class="block text-sm font-medium text-gray-700">
								Capacity
							</label>
							<input
								type="text"
								id="capacity"
								name="capacity"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							/>
						</div>
						<div>
							<label for="reservation_info" class="block text-sm font-medium text-gray-700">
								Reservation Info
							</label>
							<textarea
								id="reservation_info"
								name="reservation_info"
								rows="3"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							></textarea>
						</div>
						<button
							type="submit"
							class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Submit Camping Site
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>

