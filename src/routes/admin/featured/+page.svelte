<script lang="ts">
  import { ChevronRight, Star, Mountain, Tent, Backpack } from "lucide-svelte";
  import type { PageData } from "./$types";
  import { invalidateAll } from "$app/navigation";

  export let data: PageData;

  let processingIds = new Set<string>();

  $: featuredHikesCount = data.hikes.filter((h) => h.featured).length;
  $: featuredCampingSitesCount = data.campingSites.filter((c) => c.featured).length;
  $: featuredBackpackingCount = (data.backpackingRoutes || []).filter(
    (b: any) => b.featured
  ).length;

  async function toggleFeatured(
    type: "hike" | "camping_site" | "backpacking",
    id: string,
    currentlyFeatured: boolean
  ) {
    if (processingIds.has(id)) return;

    if (!currentlyFeatured) {
      if (type === "hike" && featuredHikesCount >= 3) {
        alert("Maximum of 3 featured hikes reached. Remove one first.");
        return;
      }
      if (type === "camping_site" && featuredCampingSitesCount >= 3) {
        alert("Maximum of 3 featured camping sites reached. Remove one first.");
        return;
      }
      if (type === "backpacking" && featuredBackpackingCount >= 3) {
        alert("Maximum of 3 featured backpacking routes reached. Remove one first.");
        return;
      }
    }

    processingIds.add(id);
    processingIds = processingIds;

    const apiPath =
      type === "hike" ? "hikes" : type === "camping_site" ? "camping-sites" : "backpacking";

    try {
      const response = await fetch(`/api/${apiPath}/${id}/featured`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentlyFeatured }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to update featured status: ${error.message || "Unknown error"}`);
        return;
      }

      await invalidateAll();
    } catch (error) {
      console.error("Failed to toggle featured status:", error);
      alert("Failed to update featured status. Please try again.");
    } finally {
      processingIds.delete(id);
      processingIds = processingIds;
    }
  }

  function formatLocation(address: any): string {
    if (!address) return "—";
    const parts = [address.city, address.state].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "—";
  }
</script>

<svelte:head>
  <title>Featured Items - Adventure Spark</title>
</svelte:head>

<div class="grain"></div>

<div class="relative z-10 min-h-screen pt-10 pb-16">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-1.5 text-sm mb-6">
      <a href="/admin" class="text-stone-400 hover:text-stone-200 transition-colors">Admin</a>
      <ChevronRight size={14} class="text-stone-600" />
      <span class="text-stone-200 font-medium">Featured Items</span>
    </nav>

    <div class="flex items-center gap-3 mb-10">
      <div class="p-2.5 bg-sky-500/15 border border-sky-500/25 rounded-xl">
        <Star size={20} class="text-sky-400" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-stone-100">Manage Featured Items</h1>
        <p class="text-sm text-stone-400">Up to 3 featured items per category</p>
      </div>
    </div>

    <!-- Hikes Section -->
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-4">
        <Mountain size={16} class="text-emerald-400" />
        <h2 class="text-base font-bold text-stone-200">Hikes</h2>
        <span class="text-xs text-stone-500 ml-1">{featuredHikesCount}/3 featured</span>
      </div>
      <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-white/10">
              <th
                class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider"
                >Name</th
              >
              <th
                class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider hidden sm:table-cell"
                >Location</th
              >
              <th
                class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider"
                >Status</th
              >
              <th
                class="px-5 py-3 text-right text-xs font-semibold text-stone-400 uppercase tracking-wider"
                >Action</th
              >
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            {#each data.hikes as hike (hike.id)}
              <tr class="hover:bg-white/3 transition-colors">
                <td class="px-5 py-3.5 text-sm font-medium text-stone-200">
                  {hike.name}
                </td>
                <td class="px-5 py-3.5 text-sm text-stone-500 hidden sm:table-cell">
                  {formatLocation(hike.address)}
                </td>
                <td class="px-5 py-3.5">
                  {#if hike.featured}
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    >
                      <Star size={10} />
                      Featured
                    </span>
                  {:else}
                    <span class="text-xs text-stone-600">—</span>
                  {/if}
                </td>
                <td class="px-5 py-3.5 text-right">
                  <button
                    on:click={() => toggleFeatured("hike", hike.slug, hike.featured)}
                    disabled={processingIds.has(hike.slug)}
                    class="{hike.featured
                      ? 'text-stone-400 hover:text-red-300 border-white/10 hover:border-red-500/30'
                      : 'text-emerald-400 hover:text-emerald-300 border-emerald-500/30 hover:border-emerald-400/50'} text-xs font-semibold border rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {processingIds.has(hike.slug) ? "..." : hike.featured ? "Remove" : "Feature"}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Camping Sites Section -->
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-4">
        <Tent size={16} class="text-sky-400" />
        <h2 class="text-base font-bold text-stone-200">Camping Sites</h2>
        <span class="text-xs text-stone-500 ml-1">{featuredCampingSitesCount}/3 featured</span>
      </div>
      <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-white/10">
              <th
                class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider"
                >Name</th
              >
              <th
                class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider hidden sm:table-cell"
                >Location</th
              >
              <th
                class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider"
                >Status</th
              >
              <th
                class="px-5 py-3 text-right text-xs font-semibold text-stone-400 uppercase tracking-wider"
                >Action</th
              >
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            {#each data.campingSites as campingSite (campingSite.id)}
              <tr class="hover:bg-white/3 transition-colors">
                <td class="px-5 py-3.5 text-sm font-medium text-stone-200">
                  {campingSite.name}
                </td>
                <td class="px-5 py-3.5 text-sm text-stone-500 hidden sm:table-cell">
                  {formatLocation(campingSite.address)}
                </td>
                <td class="px-5 py-3.5">
                  {#if campingSite.featured}
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    >
                      <Star size={10} />
                      Featured
                    </span>
                  {:else}
                    <span class="text-xs text-stone-600">—</span>
                  {/if}
                </td>
                <td class="px-5 py-3.5 text-right">
                  <button
                    on:click={() =>
                      toggleFeatured("camping_site", campingSite.slug, campingSite.featured)}
                    disabled={processingIds.has(campingSite.slug)}
                    class="{campingSite.featured
                      ? 'text-stone-400 hover:text-red-300 border-white/10 hover:border-red-500/30'
                      : 'text-emerald-400 hover:text-emerald-300 border-emerald-500/30 hover:border-emerald-400/50'} text-xs font-semibold border rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {processingIds.has(campingSite.slug)
                      ? "..."
                      : campingSite.featured
                        ? "Remove"
                        : "Feature"}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Backpacking Section -->
    {#if data.backpackingRoutes && data.backpackingRoutes.length > 0}
      <div>
        <div class="flex items-center gap-2 mb-4">
          <Backpack size={16} class="text-amber-400" />
          <h2 class="text-base font-bold text-stone-200">Backpacking Routes</h2>
          <span class="text-xs text-stone-500 ml-1">{featuredBackpackingCount}/3 featured</span>
        </div>
        <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-white/10">
                <th
                  class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider"
                  >Name</th
                >
                <th
                  class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider hidden sm:table-cell"
                  >Location</th
                >
                <th
                  class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider"
                  >Status</th
                >
                <th
                  class="px-5 py-3 text-right text-xs font-semibold text-stone-400 uppercase tracking-wider"
                  >Action</th
                >
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              {#each data.backpackingRoutes as route (route.id)}
                <tr class="hover:bg-white/3 transition-colors">
                  <td class="px-5 py-3.5 text-sm font-medium text-stone-200">{route.name}</td>
                  <td class="px-5 py-3.5 text-sm text-stone-500 hidden sm:table-cell"
                    >{formatLocation(route.address)}</td
                  >
                  <td class="px-5 py-3.5">
                    {#if route.featured}
                      <span
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      >
                        <Star size={10} />
                        Featured
                      </span>
                    {:else}
                      <span class="text-xs text-stone-600">—</span>
                    {/if}
                  </td>
                  <td class="px-5 py-3.5 text-right">
                    <button
                      on:click={() => toggleFeatured("backpacking", route.slug, route.featured)}
                      disabled={processingIds.has(route.slug)}
                      class="{route.featured
                        ? 'text-stone-400 hover:text-red-300 border-white/10 hover:border-red-500/30'
                        : 'text-emerald-400 hover:text-emerald-300 border-emerald-500/30 hover:border-emerald-400/50'} text-xs font-semibold border rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {processingIds.has(route.slug) ? "..." : route.featured ? "Remove" : "Feature"}
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .grain {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }
</style>
