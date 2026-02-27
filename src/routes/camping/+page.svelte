<script lang="ts">
  import type { PageData } from "./$types";
  import type { CampingSite, Address } from "$lib/db/schemas";
  import CampingSiteCard from "$lib/components/CampingSiteCard.svelte";
  import CampingFilters from "$lib/components/CampingFilters.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { Tent, Plus, BookOpen, LayoutGrid, List, Map } from "lucide-svelte";
  import { navigating } from "$app/stores";
  import ListingMap from "$lib/components/ListingMap.svelte";

  export let data: PageData;

  let viewMode: "grid" | "list" | "map" = "grid";

  type CampingWithAddress = CampingSite & {
    address?: Pick<Address, "city" | "state" | "latitude" | "longitude"> | null;
    bannerImageUrl?: string | null;
  };

  $: campingMarkers = ((data.campingSites as CampingWithAddress[]) ?? [])
    .filter((c) => c.address?.latitude && c.address?.longitude)
    .map((c) => ({
      id: c.id,
      name: c.name,
      lat: c.address!.latitude!,
      lng: c.address!.longitude!,
      href: `/camping/${c.id}`,
      color: "indigo" as const,
    }));
</script>

<svelte:head>
  <title>Camping Sites — Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-stone-100">
  <!-- Page header -->
  <div class="bg-white border-b border-stone-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style="background: linear-gradient(135deg, #059669, #34d399);"
          >
            <Tent size={22} class="text-white" />
          </div>
          <div>
            <p class="text-xs font-bold tracking-widest uppercase text-stone-400 mb-0.5">Explore</p>
            <h1 class="text-2xl font-black text-stone-900 leading-tight">Camping Sites</h1>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <a
            href="/essentials"
            class="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-full text-xs font-bold transition-all hover:opacity-90"
            style="background: rgba(251,146,60,0.08); border: 1px solid rgba(251,146,60,0.25); color: #c2410c;"
          >
            <BookOpen size={13} />
            <span class="hidden sm:inline">Essentials</span>
          </a>
          <a
            href="/submit?type=camping_site"
            class="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-full text-xs font-bold text-stone-950 transition-all hover:scale-105"
            style="background: linear-gradient(135deg, #86efac, #34d399);"
          >
            <Plus size={13} />
            <span class="hidden sm:inline">Submit</span>
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Two-column layout: filters sidebar + content -->
    <div class="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
      <!-- Filter Sidebar (desktop) -->
      <aside class="hidden lg:block">
        <CampingFilters
          amenityTypes={data.amenityTypes}
          facilityTypes={data.facilityTypes}
          councils={data.councils}
          currentFilters={data.currentFilters}
          userRole={data.userRole}
        />
      </aside>

      <!-- Main Content -->
      <main class="relative">
        <!-- Loading Overlay -->
        {#if $navigating}
          <div
            class="absolute inset-0 bg-stone-100/80 backdrop-blur-sm z-10 flex items-start justify-center pt-12"
          >
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <LoadingSpinner size="lg" destination={$navigating?.to?.url?.pathname} />
            </div>
          </div>
        {/if}

        {#if data.campingSites && data.campingSites.length > 0}
          <!-- Results count + view toggle -->
          <div class="flex items-center mb-4">
            <p class="text-sm text-stone-500">
              <span class="font-black text-stone-800">{data.campingSites.length}</span>
              {data.campingSites.length === 1 ? "site" : "sites"} found
            </p>
            <div class="flex items-center gap-0.5 ml-auto">
              <button
                on:click={() => (viewMode = "grid")}
                class="p-1.5 rounded transition-colors {viewMode === 'grid'
                  ? 'bg-stone-200 text-stone-800'
                  : 'text-stone-400 hover:text-stone-600'}"
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                on:click={() => (viewMode = "list")}
                class="p-1.5 rounded transition-colors {viewMode === 'list'
                  ? 'bg-stone-200 text-stone-800'
                  : 'text-stone-400 hover:text-stone-600'}"
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List size={16} />
              </button>
              <button
                on:click={() => (viewMode = "map")}
                class="p-1.5 rounded transition-colors {viewMode === 'map'
                  ? 'bg-stone-200 text-stone-800'
                  : 'text-stone-400 hover:text-stone-600'}"
                aria-label="Map view"
                aria-pressed={viewMode === "map"}
              >
                <Map size={16} />
              </button>
            </div>
          </div>

          {#if viewMode === "grid"}
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {#each data.campingSites as campingSite (campingSite.id)}
                <CampingSiteCard {campingSite} />
              {/each}
            </div>
          {:else if viewMode === "list"}
            <div class="flex flex-col gap-2">
              {#each data.campingSites as campingSite (campingSite.id)}
                <CampingSiteCard {campingSite} listView={true} />
              {/each}
            </div>
          {:else}
            <ListingMap markers={campingMarkers} />
          {/if}
        {:else}
          <div
            class="rounded-2xl border border-dashed border-stone-300 bg-white/60 py-16 text-center"
          >
            <Tent size={40} class="mx-auto mb-4" style="color: rgba(0,0,0,0.12);" />
            <p class="text-base font-black text-stone-700 mb-1">No camping sites found</p>
            <p class="text-sm text-stone-400">Try adjusting your filters or search criteria</p>
          </div>
        {/if}
      </main>
    </div>

    <!-- Mobile Filter Component -->
    <div class="lg:hidden">
      <CampingFilters
        amenityTypes={data.amenityTypes}
        facilityTypes={data.facilityTypes}
        councils={data.councils}
        currentFilters={data.currentFilters}
        userRole={data.userRole}
      />
    </div>
  </div>
</div>
