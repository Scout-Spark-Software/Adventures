<script lang="ts">
  import type { PageData } from "./$types";
  import HikeCard from "$lib/components/HikeCard.svelte";
  import CampingSiteCard from "$lib/components/CampingSiteCard.svelte";
  import BackpackingCard from "$lib/components/BackpackingCard.svelte";
  import { Heart, MountainIcon, Tent, Backpack } from "lucide-svelte";
  export let data: PageData;

  $: isEmpty =
    (!data.hikes || data.hikes.length === 0) &&
    (!data.campingSites || data.campingSites.length === 0) &&
    (!data.backpackingRoutes || data.backpackingRoutes.length === 0);

  $: totalCount =
    (data.hikes?.length ?? 0) +
    (data.campingSites?.length ?? 0) +
    (data.backpackingRoutes?.length ?? 0);
</script>

<svelte:head>
  <title>My Favorites — Adventure Spark</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<!-- Full-bleed dark banner, pulled up behind nav -->
<div class="relative overflow-hidden favorites-banner -mt-16">
  <div class="absolute inset-0 banner-gradient"></div>
  <div class="absolute inset-0 grain-overlay pointer-events-none"></div>
  <!-- Mountain silhouettes -->
  <div class="absolute bottom-0 left-0 right-0 pointer-events-none">
    <svg class="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
      <path
        d="M0,120 L0,80 L200,45 L400,70 L600,30 L800,60 L1000,35 L1200,65 L1440,40 L1440,120 Z"
        fill="rgba(6,78,59,0.35)"
      />
      <path
        d="M0,120 L0,95 L240,65 L480,85 L700,55 L920,78 L1140,58 L1440,72 L1440,120 Z"
        fill="rgba(2,44,34,0.55)"
      />
    </svg>
  </div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-14">
    <div class="flex items-end gap-5">
      <div
        class="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl border-2 border-white/20"
        style="background: linear-gradient(135deg, #e11d48, #f43f5e);"
      >
        <Heart size={28} class="text-white" fill="white" />
      </div>
      <div>
        <p
          class="text-xs font-bold tracking-widest uppercase mb-1"
          style="color: rgba(245,240,232,0.4);"
        >
          Your Collection
        </p>
        <h1 class="text-3xl sm:text-4xl font-black leading-tight" style="color: #f5f0e8;">
          My Favorites
        </h1>
        {#if !isEmpty}
          <p class="text-sm mt-1" style="color: rgba(245,240,232,0.5);">
            {totalCount} saved adventure{totalCount !== 1 ? "s" : ""}
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Main content -->
<div class="min-h-screen bg-stone-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    {#if isEmpty}
      <!-- Empty state -->
      <div class="max-w-md mx-auto text-center py-20">
        <div
          class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm"
          style="background: rgba(225,29,72,0.08); border: 1px solid rgba(225,29,72,0.15);"
        >
          <Heart size={36} style="color: rgba(225,29,72,0.4);" />
        </div>
        <h2 class="text-xl font-black text-stone-800 mb-2">Nothing saved yet</h2>
        <p class="text-sm text-stone-500 mb-8 leading-relaxed">
          Tap the heart icon on any trail, campsite, or backpacking route to save it here for easy
          access.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-3">
          <a
            href="/hikes"
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-stone-950 transition-all hover:scale-105"
            style="background: linear-gradient(135deg, #86efac, #34d399);"
          >
            <MountainIcon size={14} />
            Browse Hikes
          </a>
          <a
            href="/camping"
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
            style="background: rgba(6,78,59,0.08); border: 1px solid rgba(6,78,59,0.15); color: #065f46;"
          >
            <Tent size={14} />
            Browse Camping
          </a>
          <a
            href="/backpacking"
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
            style="background: rgba(251,146,60,0.08); border: 1px solid rgba(251,146,60,0.2); color: #c2410c;"
          >
            <Backpack size={14} />
            Backpacking
          </a>
        </div>
      </div>
    {:else}
      <!-- Hikes section -->
      <div class="mb-12">
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style="background: rgba(52,211,153,0.12);"
          >
            <MountainIcon size={15} style="color: #059669;" />
          </div>
          <div>
            <p class="text-xs font-bold tracking-widest uppercase" style="color: #059669;">
              Trails
            </p>
            <h2 class="text-lg font-black text-stone-800 leading-tight">Favorite Hikes</h2>
          </div>
          {#if data.hikes && data.hikes.length > 0}
            <span
              class="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
              style="background: rgba(52,211,153,0.1); color: #059669;">{data.hikes.length}</span
            >
          {/if}
        </div>
        {#if data.hikes && data.hikes.length > 0}
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {#each data.hikes as hike (hike.id)}
              <HikeCard {hike} />
            {/each}
          </div>
        {:else}
          <div
            class="rounded-2xl border border-dashed border-stone-300 bg-white/60 py-10 text-center"
          >
            <MountainIcon size={28} class="mx-auto mb-3" style="color: rgba(0,0,0,0.15);" />
            <p class="text-sm font-semibold text-stone-500 mb-1">No favorite hikes yet</p>
            <p class="text-xs text-stone-400 mb-4">
              Find a trail you love and tap the heart to save it.
            </p>
            <a
              href="/hikes"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-stone-950 transition-all hover:scale-105"
              style="background: linear-gradient(135deg, #86efac, #34d399);"
            >
              Browse Hikes
            </a>
          </div>
        {/if}
      </div>

      <!-- Divider -->
      <div class="border-t border-stone-200 mb-12"></div>

      <!-- Camping section -->
      <div class="mb-12">
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style="background: rgba(52,211,153,0.12);"
          >
            <Tent size={15} style="color: #059669;" />
          </div>
          <div>
            <p class="text-xs font-bold tracking-widest uppercase" style="color: #059669;">
              Campsites
            </p>
            <h2 class="text-lg font-black text-stone-800 leading-tight">Favorite Camping Sites</h2>
          </div>
          {#if data.campingSites && data.campingSites.length > 0}
            <span
              class="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
              style="background: rgba(52,211,153,0.1); color: #059669;"
              >{data.campingSites.length}</span
            >
          {/if}
        </div>
        {#if data.campingSites && data.campingSites.length > 0}
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {#each data.campingSites as campingSite (campingSite.id)}
              <CampingSiteCard {campingSite} />
            {/each}
          </div>
        {:else}
          <div
            class="rounded-2xl border border-dashed border-stone-300 bg-white/60 py-10 text-center"
          >
            <Tent size={28} class="mx-auto mb-3" style="color: rgba(0,0,0,0.15);" />
            <p class="text-sm font-semibold text-stone-500 mb-1">No favorite camping sites yet</p>
            <p class="text-xs text-stone-400 mb-4">
              Find a campsite you love and tap the heart to save it.
            </p>
            <a
              href="/camping"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-stone-950 transition-all hover:scale-105"
              style="background: linear-gradient(135deg, #86efac, #34d399);"
            >
              Browse Camping
            </a>
          </div>
        {/if}
      </div>

      <!-- Backpacking section -->
      <div class="border-t border-stone-200 mb-12"></div>
      <div>
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style="background: rgba(251,146,60,0.1);"
          >
            <Backpack size={15} style="color: #c2410c;" />
          </div>
          <div>
            <p class="text-xs font-bold tracking-widest uppercase" style="color: #c2410c;">
              Routes
            </p>
            <h2 class="text-lg font-black text-stone-800 leading-tight">
              Favorite Backpacking Routes
            </h2>
          </div>
          {#if data.backpackingRoutes && data.backpackingRoutes.length > 0}
            <span
              class="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
              style="background: rgba(251,146,60,0.1); color: #c2410c;"
              >{data.backpackingRoutes.length}</span
            >
          {/if}
        </div>
        {#if data.backpackingRoutes && data.backpackingRoutes.length > 0}
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {#each data.backpackingRoutes as route (route.id)}
              <BackpackingCard backpacking={route} />
            {/each}
          </div>
        {:else}
          <div
            class="rounded-2xl border border-dashed border-stone-300 bg-white/60 py-10 text-center"
          >
            <Backpack size={28} class="mx-auto mb-3" style="color: rgba(0,0,0,0.15);" />
            <p class="text-sm font-semibold text-stone-500 mb-1">
              No favorite backpacking routes yet
            </p>
            <p class="text-xs text-stone-400 mb-4">
              Find a route you love and tap the heart to save it.
            </p>
            <a
              href="/backpacking"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
              style="background: rgba(251,146,60,0.1); border: 1px solid rgba(251,146,60,0.25); color: #c2410c;"
            >
              Browse Routes
            </a>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .favorites-banner {
    background-color: #0c0f0a;
  }
  .banner-gradient {
    background:
      radial-gradient(ellipse 60% 120% at 80% 50%, rgba(225, 29, 72, 0.1) 0%, transparent 55%),
      radial-gradient(ellipse 50% 100% at 10% 60%, rgba(52, 211, 153, 0.08) 0%, transparent 55%),
      linear-gradient(160deg, #0a1a0d 0%, #060d09 100%);
  }
  .grain-overlay {
    opacity: 0.04;
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");
    background-size: 200px 200px;
  }
</style>
