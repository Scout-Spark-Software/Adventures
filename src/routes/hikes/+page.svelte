<script lang="ts">
  import type { PageData } from "./$types";
  import HikeCard from "$lib/components/HikeCard.svelte";
  import HikeFilters from "$lib/components/HikeFilters.svelte";

  export let data: PageData;
</script>

<svelte:head>
  <title>Hikes - Scouts Adventures</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">All Hikes</h1>

    <!-- Two-column layout: filters sidebar + content -->
    <div class="lg:grid lg:grid-cols-[320px_1fr] lg:gap-8">
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
          <div class="mb-6 flex items-center justify-between">
            <p class="text-sm text-gray-600">
              <span class="font-semibold">{data.hikes.length}</span>
              {data.hikes.length === 1 ? "hike" : "hikes"} found
            </p>
          </div>

          <!-- Hikes Grid -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
