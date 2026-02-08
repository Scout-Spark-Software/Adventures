<script lang="ts">
  import type { PageData } from "./$types";
  import HikeCard from "$lib/components/HikeCard.svelte";
  import CampingSiteCard from "$lib/components/CampingSiteCard.svelte";

  export let data: PageData;
</script>

<svelte:head>
  <title>My Favorites - Scouts Adventures</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">My Favorites</h1>

    {#if data.hikes && data.hikes.length > 0}
      <div class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          Favorite Hikes
        </h2>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {#each data.hikes as hike}
            <HikeCard {hike} />
          {/each}
        </div>
      </div>
    {/if}

    {#if data.campingSites && data.campingSites.length > 0}
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          Favorite Camping Sites
        </h2>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {#each data.campingSites as campingSite}
            <CampingSiteCard {campingSite} />
          {/each}
        </div>
      </div>
    {/if}

    {#if (!data.hikes || data.hikes.length === 0) && (!data.campingSites || data.campingSites.length === 0)}
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
            stroke-width="1.5"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <p class="text-gray-500 text-lg font-medium mb-2">No favorites yet</p>
        <p class="text-gray-400 text-sm mb-6">
          Tap the heart icon on any hike or camping site to save it here.
        </p>
        <div class="flex justify-center gap-4">
          <a
            href="/hikes"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Browse Hikes
          </a>
          <a
            href="/camping"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Browse Camping Sites
          </a>
        </div>
      </div>
    {/if}
  </div>
</div>
