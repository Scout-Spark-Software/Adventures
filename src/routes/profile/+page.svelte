<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;

	async function handleLogout() {
		await fetch('/logout', { method: 'POST' });
		goto('/login');
	}
</script>

<div class="min-h-screen bg-gray-50 py-12">
	<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="bg-white shadow rounded-lg">
			<div class="px-4 py-5 sm:p-6">
				<h1 class="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
				
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700">Email</label>
						<p class="mt-1 text-sm text-gray-900">{data.user.email}</p>
					</div>
					{#if data.user.name}
						<div>
							<label class="block text-sm font-medium text-gray-700">Name</label>
							<p class="mt-1 text-sm text-gray-900">{data.user.name}</p>
						</div>
					{/if}
				</div>

				<div class="mt-6">
					<button
						onclick={handleLogout}
						class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

