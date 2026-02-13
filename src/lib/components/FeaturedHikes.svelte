<script lang="ts">
  import HikeCard from "./HikeCard.svelte";
  import { TrendingUp, ArrowRight } from "lucide-svelte";
  import type { Hike } from "../db/schemas";

  export let hikes: Hike[] = [];
</script>

{#if hikes && hikes.length > 0}
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp size={24} class="text-sky-600" />
          Featured Hikes
        </h2>
        <p class="mt-1 text-sm text-slate-600">
          Handpicked trails for your next adventure
        </p>
      </div>
      <a
        href="/hikes"
        class="group inline-flex items-center gap-2 text-sky-700 hover:text-sky-800 font-semibold transition-colors"
      >
        View All
        <ArrowRight
          size={20}
          class="group-hover:translate-x-1 transition-transform"
        />
      </a>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each hikes as hike}
        <HikeCard {hike} />
      {/each}
    </div>
  </div>
{/if}
