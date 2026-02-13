<script lang="ts">
  import HikeCard from "./HikeCard.svelte";
  import type { Hike } from "$lib/types";

  export let hikes: Hike[] = [];
</script>

{#if hikes && hikes.length > 0}
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          Featured Hikes
        </h2>
        <p class="mt-1 text-sm text-slate-600">Handpicked trails for your next adventure</p>
      </div>
      <a
        href="/hikes"
        class="group inline-flex items-center gap-2 text-sky-700 hover:text-sky-800 font-semibold transition-colors"
      >
        View All
        <svg
          class="w-5 h-5 group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </a>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each hikes as hike}
        <HikeCard {hike} />
      {/each}
    </div>
  </div>
{/if}
