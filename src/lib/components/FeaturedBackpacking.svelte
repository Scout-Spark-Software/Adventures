<script lang="ts">
  import BackpackingCard from "./BackpackingCard.svelte";
  import { Backpack, ArrowRight } from "lucide-svelte";
  import type { Backpacking, Address } from "$lib/db/schemas";

  export let routes: (Backpacking & {
    address?: Pick<Address, "city" | "state"> | null;
    bannerImageUrl?: string | null;
  })[] = [];
</script>

{#if routes && routes.length > 0}
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Backpack size={24} class="text-amber-600" />
            Featured Backpacking Routes
          </h2>
          <p class="mt-1 text-sm text-slate-600">Multi-day wilderness adventures for scouts</p>
        </div>
        <a
          href="/backpacking"
          class="group inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-semibold transition-colors"
        >
          View All
          <ArrowRight size={20} class="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each routes as route (route.id)}
          <BackpackingCard backpacking={route} />
        {/each}
      </div>
    </div>
  </div>
{/if}
