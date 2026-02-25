<script lang="ts">
  import type { PageData } from "./$types";
  import BackpackingCard from "$lib/components/BackpackingCard.svelte";
  import BackpackingFilters from "$lib/components/BackpackingFilters.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { navigating } from "$app/stores";

  export let data: PageData;
</script>

<svelte:head>
  <title>Backpacking - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">All Backpacking</h1>
      <div class="flex items-center gap-2">
        <a
          href="/submit?type=backpacking"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Submit
        </a>
        <a
          href="/essentials"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Scout Essentials
        </a>
      </div>
    </div>

    <!-- Two-column layout: filters sidebar + content -->
    <div class="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
      <!-- Filter Sidebar (desktop) -->
      <aside class="hidden lg:block">
        <BackpackingFilters
          currentFilters={data.currentFilters}
          userRole={data.userRole}
        />
      </aside>

      <!-- Main Content -->
      <main class="relative">
        <!-- Loading Overlay -->
        {#if $navigating}
          <div
            class="absolute inset-0 bg-white/75 backdrop-blur-sm z-10 flex items-start justify-center pt-12"
          >
            <div class="bg-white rounded-lg shadow-lg p-6">
              <LoadingSpinner size="lg" destination={$navigating?.to?.url?.pathname} />
            </div>
          </div>
        {/if}

        {#if data.backpackingEntries && data.backpackingEntries.length > 0}
          <div class="mb-4">
            <p class="text-sm text-gray-600">
              <span class="font-semibold">{data.backpackingEntries.length}</span>
              {data.backpackingEntries.length === 1 ? "entry" : "entries"} found
            </p>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {#each data.backpackingEntries as entry (entry.id)}
              <BackpackingCard backpacking={entry} />
            {/each}
          </div>
        {:else}
          <div class="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg
              class="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-gray-500 text-lg font-medium mb-2">No backpacking entries found</p>
            <p class="text-gray-400 text-sm">Check back soon or submit your own route</p>
          </div>
        {/if}
      </main>
    </div>

    <!-- Mobile Filter Component (rendered in component itself as floating button) -->
    <div class="lg:hidden">
      <BackpackingFilters
        currentFilters={data.currentFilters}
        userRole={data.userRole}
      />
    </div>
  </div>
</div>
