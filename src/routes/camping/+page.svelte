<script lang="ts">
  import type { PageData } from "./$types";
  import CampingSiteCard from "$lib/components/CampingSiteCard.svelte";
  import CampingFilters from "$lib/components/CampingFilters.svelte";

  export let data: PageData;
</script>

<svelte:head>
  <title>Camping Sites - Scouts Adventures</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">All Camping Sites</h1>

    <!-- Two-column layout: filters sidebar + content -->
    <div class="lg:grid lg:grid-cols-[320px_1fr] lg:gap-8">
      <!-- Filter Sidebar (desktop) -->
      <aside class="hidden lg:block">
        <CampingFilters
          amenityTypes={data.amenityTypes}
          facilityTypes={data.facilityTypes}
          currentFilters={data.currentFilters}
        />
      </aside>

      <!-- Main Content -->
      <main>
        <!-- Results count -->
        {#if data.campingSites && data.campingSites.length > 0}
          <div class="mb-6 flex items-center justify-between">
            <p class="text-sm text-gray-600">
              <span class="font-semibold">{data.campingSites.length}</span>
              {data.campingSites.length === 1
                ? "camping site"
                : "camping sites"} found
            </p>
          </div>

          <!-- Camping Sites Grid -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
