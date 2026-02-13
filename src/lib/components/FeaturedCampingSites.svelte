<script lang="ts">
  import CampingSiteCard from "./CampingSiteCard.svelte";
  import type { CampingSite } from "$lib/types";

  export let campingSites: CampingSite[] = [];
</script>

{#if campingSites && campingSites.length > 0}
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Featured Camping Sites
          </h2>
          <p class="mt-1 text-sm text-slate-600">Perfect basecamp locations for scouts</p>
        </div>
        <a
          href="/camping"
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
        {#each campingSites as campingSite}
          <CampingSiteCard {campingSite} />
        {/each}
      </div>
    </div>
  </div>
{/if}
