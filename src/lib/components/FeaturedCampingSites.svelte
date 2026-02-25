<script lang="ts">
  import CampingSiteCard from "./CampingSiteCard.svelte";
  import { Tent, ArrowRight } from "lucide-svelte";
  import type { CampingSite } from "$lib/db/schemas";

  export let campingSites: CampingSite[] = [];
</script>

{#if campingSites && campingSites.length > 0}
  <section class="bg-white py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-end justify-between mb-10">
        <div>
          <p class="text-xs font-bold tracking-widest uppercase mb-2" style="color: #059669;">Camping</p>
          <h2 class="text-3xl font-black text-stone-900 leading-tight">Featured Campsites</h2>
        </div>
        <a
          href="/camping"
          class="group inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
          style="color: #059669;"
        >
          View all
          <ArrowRight size={15} class="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {#each campingSites as campingSite (campingSite.id)}
          <CampingSiteCard {campingSite} />
        {/each}
      </div>
    </div>
  </section>
{/if}
