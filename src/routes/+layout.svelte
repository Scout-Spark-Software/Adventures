<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let user = $state<{ id: string; email: string; name?: string } | null>(null);

	$effect(() => {
		// Check if user is logged in (placeholder - will be replaced with actual auth check)
		// For now, we'll check localStorage or cookies
		const checkAuth = async () => {
			// This will be replaced with actual auth check
		};
		checkAuth();
	});
</script>

<nav class="bg-white shadow">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-16">
			<div class="flex">
				<div class="flex-shrink-0 flex items-center">
					<a href="/" class="text-2xl font-bold text-indigo-600">Scouts Adventures</a>
				</div>
				<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
					<a
						href="/hikes"
						class="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
					>
						Hikes
					</a>
					<a
						href="/camping"
						class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
					>
						Camping Sites
					</a>
				</div>
			</div>
			<div class="flex items-center">
				{#if user}
					<a
						href="/favorites"
						class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
					>
						Favorites
					</a>
					<a
						href="/submit"
						class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
					>
						Submit
					</a>
					<a
						href="/profile"
						class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
					>
						Profile
					</a>
				{:else}
					<a
						href="/login"
						class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
					>
						Login
					</a>
					<a
						href="/signup"
						class="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
					>
						Sign Up
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>

<main>
	<slot />
</main>

<footer class="bg-white border-t mt-12">
	<div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
		<p class="text-center text-gray-500 text-sm">
			&copy; {new Date().getFullYear()} Scouts Adventures. All rights reserved.
		</p>
	</div>
</footer>
