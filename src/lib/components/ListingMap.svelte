<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type L from "leaflet";
  import { TILE_LAYERS, DEFAULT_TILE_LAYER, type TileLayerId } from "$lib/utils/map-tiles";

  export let markers: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    href: string;
    color: "emerald" | "indigo" | "amber";
  }> = [];
  export let height: string = "calc(100vh - 280px)";

  const colorMap: Record<string, string> = {
    emerald: "#059669",
    indigo: "#4f46e5",
    amber: "#d97706",
  };

  let mapContainer: HTMLDivElement;
  let map: L.Map | null = null;
  let leaflet: typeof L | null = null;
  let markerLayer: L.LayerGroup | null = null;
  let activeTileLayer: L.TileLayer | null = null;
  let activeLayerId: TileLayerId = DEFAULT_TILE_LAYER.id;

  function makeIcon(color: string) {
    const hex = colorMap[color] ?? colorMap.emerald;
    return leaflet!.divIcon({
      className: "",
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20S24 21 24 12C24 5.4 18.6 0 12 0z" fill="${hex}"/>
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

  function renderMarkers() {
    if (!map || !leaflet || !markerLayer) return;
    markerLayer.clearLayers();

    const bounds: [number, number][] = [];

    for (const m of markers) {
      const icon = makeIcon(m.color);
      const marker = leaflet.marker([m.lat, m.lng], { icon }).addTo(markerLayer);

      marker.bindPopup(
        `<div style="min-width:140px;">
          <p style="font-weight:700;font-size:13px;margin:0 0 6px;">${m.name}</p>
          <a href="${m.href}" style="font-size:12px;color:${colorMap[m.color]};font-weight:600;text-decoration:none;">View Details →</a>
        </div>`,
        { closeButton: false, maxWidth: 220 }
      );

      bounds.push([m.lat, m.lng]);
    }

    if (bounds.length === 1) {
      map.setView(bounds[0], 11);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40] });
    } else {
      // No markers — center on continental US
      map.setView([39.5, -98.35], 4);
    }
  }

  onMount(async () => {
    leaflet = (await import("leaflet")).default;

    map = leaflet.map(mapContainer).setView([39.5, -98.35], 4);

    const def = DEFAULT_TILE_LAYER;
    activeTileLayer = leaflet
      .tileLayer(def.url, { attribution: def.attribution, maxZoom: def.maxZoom })
      .addTo(map);

    markerLayer = leaflet.layerGroup().addTo(map);
    renderMarkers();
  });

  onDestroy(() => {
    if (map) map.remove();
  });

  // Re-render when markers prop changes
  $: if (map && leaflet && markerLayer) {
    renderMarkers();
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

<div class="relative isolate w-full rounded-xl overflow-hidden" style="height: {height};">
  <div bind:this={mapContainer} class="w-full h-full"></div>

  <!-- Tile layer toggle -->
  <div class="absolute bottom-2 right-2 z-[1000] flex rounded-md overflow-hidden shadow-md">
    {#each TILE_LAYERS as layer}
      <button
        type="button"
        on:click={() => switchLayer(layer.id)}
        class="px-2 py-1 text-xs font-medium border-r border-gray-200 last:border-r-0 transition-colors
          {activeLayerId === layer.id
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'}"
      >
        {layer.label}
      </button>
    {/each}
  </div>
</div>

<style>
  :global(.leaflet-container) {
    font-family: inherit;
  }
  :global(.leaflet-popup-content-wrapper) {
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  :global(.leaflet-popup-tip) {
    display: none;
  }
</style>
