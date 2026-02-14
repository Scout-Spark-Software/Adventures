<script lang="ts">
  import CampingSiteCard from "./CampingSiteCard.svelte";
  import { Tent, ArrowRight } from "lucide-svelte";
  import type { CampingSite } from "$lib/db/schemas";

  export let campingSites: CampingSite[] = [];
</script>

{#if campingSites && campingSites.length > 0}
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Tent size={24} class="text-sky-600" />
            Featured Camping Sites
          </h2>
          <p class="mt-1 text-sm text-slate-600">Perfect basecamp locations for scouts</p>
        </div>
        <a
          href="/camping"
          class="group inline-flex items-center gap-2 text-sky-700 hover:text-sky-800 font-semibold transition-colors"
        >
          View All
          <ArrowRight size={20} class="group-hover:translate-x-1 transition-transform" />
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
