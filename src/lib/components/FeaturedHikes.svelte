<script lang="ts">
  import HikeCard from "./HikeCard.svelte";
  import { TrendingUp, ArrowRight } from "lucide-svelte";
  import type { Hike } from "../db/schemas";

  export let hikes: Hike[] = [];
</script>

{#if hikes && hikes.length > 0}
  <section class="bg-stone-50 py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-end justify-between mb-10">
        <div>
          <p class="text-xs font-bold tracking-widest uppercase mb-2" style="color: #16a34a;">
            Trails
          </p>
          <h2 class="text-3xl font-black text-stone-900 leading-tight">Featured Hikes</h2>
        </div>
        <a
          href="/hikes"
          class="group inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
          style="color: #16a34a;"
        >
          View all
          <ArrowRight size={15} class="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {#each hikes as hike, i (hike.id)}
          <HikeCard {hike} priority={i === 0} />
        {/each}
      </div>
    </div>
  </section>
{/if}
