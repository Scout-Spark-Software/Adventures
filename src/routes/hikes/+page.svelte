<script lang="ts">
  import type { PageData } from "./$types";
  import HikeCard from "$lib/components/HikeCard.svelte";
  import HikeFilters from "$lib/components/HikeFilters.svelte";

  export let data: PageData;
</script>

<svelte:head>
  <title>Hikes - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">All Hikes</h1>
      <a
        href="/essentials"
        class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        Scout Essentials
      </a>
    </div>

    <!-- Two-column layout: filters sidebar + content -->
    <div class="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
      <!-- Filter Sidebar (desktop) -->
      <aside class="hidden lg:block">
        <HikeFilters
          featureTypes={data.featureTypes}
          trailTypes={data.trailTypes}
          currentFilters={data.currentFilters}
        />
      </aside>

      <!-- Main Content -->
      <main>
        <!-- Results count -->
        {#if data.hikes && data.hikes.length > 0}
          <div class="mb-4 flex items-center justify-between">
            <p class="text-sm text-gray-600">
              <span class="font-semibold">{data.hikes.length}</span>
              {data.hikes.length === 1 ? "hike" : "hikes"} found
            </p>
          </div>

          <!-- Hikes Grid -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {#each data.hikes as hike}
              <HikeCard {hike} />
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
            <p class="text-gray-500 text-lg font-medium mb-2">No hikes found</p>
            <p class="text-gray-400 text-sm">
              Try adjusting your filters or search criteria
            </p>
          </div>
        {/if}
      </main>
    </div>

    <!-- Mobile Filter Component (rendered in component itself as floating button) -->
    <div class="lg:hidden">
      <HikeFilters
        featureTypes={data.featureTypes}
        trailTypes={data.trailTypes}
        currentFilters={data.currentFilters}
      />
    </div>
  </div>
</div>
