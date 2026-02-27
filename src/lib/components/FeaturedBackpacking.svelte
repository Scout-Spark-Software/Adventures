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
  <section class="bg-stone-50 py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-end justify-between mb-10">
        <div>
          <p class="text-xs font-bold tracking-widest uppercase mb-2" style="color: #d97706;">
            Backpacking
          </p>
          <h2 class="text-3xl font-black text-stone-900 leading-tight">Featured Routes</h2>
        </div>
        <a
          href="/backpacking"
          class="group inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
          style="color: #d97706;"
        >
          View all
          <ArrowRight size={15} class="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {#each routes as route (route.id)}
          <BackpackingCard backpacking={route} />
        {/each}
      </div>
    </div>
  </section>
{/if}
