<script lang="ts">
  import type { PageData } from "./$types";
  import CampingSiteCard from "$lib/components/CampingSiteCard.svelte";
  import CampingFilters from "$lib/components/CampingFilters.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { navigating } from "$app/stores";

  export let data: PageData;
</script>

<svelte:head>
  <title>Camping Sites - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">All Camping Sites</h1>
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
        <CampingFilters
          amenityTypes={data.amenityTypes}
          facilityTypes={data.facilityTypes}
          currentFilters={data.currentFilters}
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
              <LoadingSpinner size="lg" text="Loading camping sites..." />
            </div>
          </div>
        {/if}

        <!-- Results count -->
        {#if data.campingSites && data.campingSites.length > 0}
          <div class="mb-4 flex items-center justify-between">
            <p class="text-sm text-gray-600">
              <span class="font-semibold">{data.campingSites.length}</span>
              {data.campingSites.length === 1
                ? "camping site"
                : "camping sites"} found
            </p>
          </div>

          <!-- Camping Sites Grid -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {#each data.campingSites as campingSite}
              <CampingSiteCard {campingSite} />
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p class="text-gray-500 text-lg font-medium mb-2">
              No camping sites found
            </p>
            <p class="text-gray-400 text-sm">
              Try adjusting your filters or search criteria
            </p>
          </div>
        {/if}
      </main>
    </div>

    <!-- Mobile Filter Component (rendered in component itself as floating button) -->
    <div class="lg:hidden">
      <CampingFilters
        amenityTypes={data.amenityTypes}
        facilityTypes={data.facilityTypes}
        currentFilters={data.currentFilters}
      />
    </div>
  </div>
</div>
