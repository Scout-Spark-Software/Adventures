<script lang="ts">
  import type { PageData } from "./$types";
  import type { Backpacking, Address } from "$lib/db/schemas";
  import BackpackingCard from "$lib/components/BackpackingCard.svelte";
  import BackpackingFilters from "$lib/components/BackpackingFilters.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { Backpack, Plus, BookOpen, LayoutGrid, List, Map, ChevronLeft, ChevronRight } from "lucide-svelte";
  import { navigating, page as pageStore } from "$app/stores";
  import ListingMap from "$lib/components/ListingMap.svelte";

  export let data: PageData;

  let viewMode: "grid" | "list" | "map" = "grid";

  type BackpackingWithAddress = Backpacking & {
    address?: Pick<Address, "city" | "state" | "latitude" | "longitude"> | null;
    bannerImageUrl?: string | null;
  };

  $: backpackingMarkers = ((data.backpackingEntries as BackpackingWithAddress[]) ?? [])
    .filter((b) => b.address?.latitude && b.address?.longitude)
    .map((b) => ({
      id: b.id,
      name: b.name,
      lat: b.address!.latitude!,
      lng: b.address!.longitude!,
      href: `/backpacking/${b.id}`,
      color: "amber" as const,
    }));

  $: totalPages = Math.ceil(data.total / data.pageSize);

  function pageUrl(p: number): string {
    const params = new URLSearchParams($pageStore.url.searchParams);
    params.set("page", String(p));
    return `/backpacking?${params.toString()}`;
  }

  $: pageNumbers = (() => {
    const pages: (number | "…")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= data.page - 2 && i <= data.page + 2)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "…") {
        pages.push("…");
      }
    }
    return pages;
  })();
</script>

<svelte:head>
  <title>Backpacking Routes — Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-stone-100">
  <!-- Page header -->
  <div class="bg-white border-b border-stone-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style="background: linear-gradient(135deg, #d97706, #fbbf24);"
          >
            <Backpack size={22} class="text-white" />
          </div>
          <div>
            <p class="text-xs font-bold tracking-widest uppercase text-stone-400 mb-0.5">Explore</p>
            <h1 class="text-2xl font-black text-stone-900 leading-tight">Backpacking Routes</h1>
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
            href="/submit?type=backpacking"
            class="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-full text-xs font-bold text-stone-950 transition-all hover:scale-105"
            style="background: linear-gradient(135deg, #fde68a, #fbbf24);"
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
        <BackpackingFilters
          featureTypes={data.featureTypes}
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

        {#if data.backpackingEntries && data.backpackingEntries.length > 0}
          <!-- Results count + view toggle -->
          <div class="flex items-center mb-4">
            <p class="text-sm text-stone-500">
              <span class="font-black text-stone-800">{data.total}</span>
              {data.total === 1 ? "route" : "routes"} found
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
              {#each data.backpackingEntries as entry (entry.id)}
                <BackpackingCard backpacking={entry} />
              {/each}
            </div>
          {:else if viewMode === "list"}
            <div class="flex flex-col gap-2">
              {#each data.backpackingEntries as entry (entry.id)}
                <BackpackingCard backpacking={entry} listView={true} />
              {/each}
            </div>
          {:else}
            <ListingMap markers={backpackingMarkers} />
          {/if}

          <!-- Pagination -->
          {#if totalPages > 1 && viewMode !== "map"}
            <div class="flex items-center justify-center gap-1 mt-8">
              <a
                href={pageUrl(data.page - 1)}
                class="p-2 rounded-lg transition-colors {data.page <= 1
                  ? 'pointer-events-none text-stone-300'
                  : 'text-stone-500 hover:bg-stone-200 hover:text-stone-800'}"
                aria-label="Previous page"
                aria-disabled={data.page <= 1}
              >
                <ChevronLeft size={18} />
              </a>

              {#each pageNumbers as pg}
                {#if pg === "…"}
                  <span class="px-2 text-stone-400 text-sm select-none">…</span>
                {:else}
                  <a
                    href={pageUrl(pg)}
                    class="min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors {pg === data.page
                      ? 'bg-amber-500 text-white'
                      : 'text-stone-600 hover:bg-stone-200'}"
                    aria-current={pg === data.page ? 'page' : undefined}
                  >
                    {pg}
                  </a>
                {/if}
              {/each}

              <a
                href={pageUrl(data.page + 1)}
                class="p-2 rounded-lg transition-colors {data.page >= totalPages
                  ? 'pointer-events-none text-stone-300'
                  : 'text-stone-500 hover:bg-stone-200 hover:text-stone-800'}"
                aria-label="Next page"
                aria-disabled={data.page >= totalPages}
              >
                <ChevronRight size={18} />
              </a>
            </div>
          {/if}
        {:else}
          <div
            class="rounded-2xl border border-dashed border-stone-300 bg-white/60 py-16 text-center"
          >
            <Backpack size={40} class="mx-auto mb-4" style="color: rgba(0,0,0,0.12);" />
            <p class="text-base font-black text-stone-700 mb-1">No backpacking routes found</p>
            <p class="text-sm text-stone-400">Check back soon or submit your own route</p>
          </div>
        {/if}
      </main>
    </div>

    <!-- Mobile Filter Component -->
    <div class="lg:hidden">
      <BackpackingFilters
        councils={data.councils}
        currentFilters={data.currentFilters}
        userRole={data.userRole}
      />
    </div>
  </div>
</div>
