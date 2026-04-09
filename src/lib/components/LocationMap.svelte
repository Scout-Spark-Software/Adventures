<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type L from "leaflet";
  import { TILE_LAYERS, DEFAULT_TILE_LAYER, type TileLayerId } from "$lib/utils/map-tiles";

  export let latitude: number;
  export let longitude: number;
  export let height = "300px";

  let mapContainer: HTMLDivElement;
  let map: L.Map | null = null;
  let marker: L.Marker | null = null;
  let leaflet: typeof L | null = null;
  let activeTileLayer: L.TileLayer | null = null;
  let activeLayerId: TileLayerId = DEFAULT_TILE_LAYER.id;

  function makeMarkerIcon(L: typeof import("leaflet")) {
    return L.divIcon({
      className: "",
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20S24 21 24 12C24 5.4 18.6 0 12 0z" fill="#4f46e5"/>
        <circle cx="12" cy="11" r="4" fill="white" opacity="0.9"/>
      </svg>`,
      iconSize: [24, 32],
      iconAnchor: [12, 32],
      popupAnchor: [0, -32],
    });
  }

  function switchLayer(id: TileLayerId) {
    if (!map || !leaflet || id === activeLayerId) return;
    const def = TILE_LAYERS.find((t) => t.id === id)!;
    if (activeTileLayer) {
      activeTileLayer.remove();
    }
    activeTileLayer = leaflet.tileLayer(def.url, {
      attribution: def.attribution,
      maxZoom: def.maxZoom,
    }).addTo(map);
    activeLayerId = id;
  }

  onMount(async () => {
    leaflet = (await import("leaflet")).default;

    map = leaflet.map(mapContainer).setView([latitude, longitude], 13);

    const def = DEFAULT_TILE_LAYER;
    activeTileLayer = leaflet
      .tileLayer(def.url, { attribution: def.attribution, maxZoom: def.maxZoom })
      .addTo(map);

    const icon = makeMarkerIcon(leaflet);
    marker = leaflet.marker([latitude, longitude], { icon }).addTo(map);
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });

  // Update map when coordinates change
  $: if (map && leaflet && latitude && longitude) {
    map.setView([latitude, longitude], 13);
    if (marker) {
      marker.setLatLng([latitude, longitude]);
    } else {
      const icon = makeMarkerIcon(leaflet);
      marker = leaflet.marker([latitude, longitude], { icon }).addTo(map);
    }
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
</svelte:head>

<div class="isolate w-full rounded-lg overflow-hidden" style="height: {height};">
  <div bind:this={mapContainer} class="w-full h-full"></div>
</div>

<!-- Tile layer toggle -->
<div class="mt-1.5 flex justify-end">
  <div class="flex rounded-md overflow-hidden border border-gray-200 shadow-sm">
    {#each TILE_LAYERS as layer}
      <button
        type="button"
        on:click={() => switchLayer(layer.id)}
        class="px-2.5 py-1 text-xs font-medium border-r border-gray-200 last:border-r-0 transition-colors
          {activeLayerId === layer.id
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'}"
      >
        {layer.label}
      </button>
    {/each}
  </div>
</div>

<style>
  :global(.leaflet-container) {
    font-family: inherit;
    border-radius: 0.5rem;
  }
</style>
