<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Admin Dashboard - Scouts Adventures</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<a
				href="/admin/moderation"
				class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
			>
				<h2 class="text-xl font-semibold text-gray-900 mb-2">Moderation Queue</h2>
				<p class="text-gray-600">Review and approve pending submissions</p>
			</a>

			<a
				href="/admin/featured"
				class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
			>
				<h2 class="text-xl font-semibold text-gray-900 mb-2">Featured Items</h2>
				<p class="text-gray-600">Manage featured hikes and camping sites</p>
			</a>
		</div>
	</div>
</div>

