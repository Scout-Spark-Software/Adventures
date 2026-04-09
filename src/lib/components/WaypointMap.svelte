<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { TILE_LAYERS, DEFAULT_TILE_LAYER, type TileLayerId } from "$lib/utils/map-tiles";

  type Waypoint = {
    lat: number;
    lng: number;
    label?: string;
  };

  /** Existing waypoints to display/edit */
  export let waypoints: Waypoint[] = [];

  /** When true, clicking the map adds a new waypoint */
  export let editable = false;

  export let height = "400px";

  /** Starting center used when no waypoints exist yet */
  export let centerLat = 39.5;
  export let centerLng = -98.35;
  export let zoom = 4;

  /** Optional reference pin (e.g. the trailhead address) — read-only, not part of waypoints */
  export let referenceLat: number | null = null;
  export let referenceLng: number | null = null;
  export let referenceLabel = "Trailhead";

  let mapContainer: HTMLDivElement;
  let map: any = null;
  let leaflet: any = null;
  let drawnMarkers: any[] = [];
  let polyline: any = null;
  let referenceMarker: any = null;
  let activeTileLayer: any = null;
  let activeLayerId: TileLayerId = DEFAULT_TILE_LAYER.id;

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

  function emitChange() {
    waypoints = [...waypoints];
  }

  function buildIcon(index: number) {
    return leaflet.divIcon({
      className: "",
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20S24 21 24 12C24 5.4 18.6 0 12 0z" fill="#4f46e5"/>
        <text x="12" y="15" text-anchor="middle" fill="white" font-size="10" font-weight="700" font-family="sans-serif">${index + 1}</text>
      </svg>`,
      iconSize: [24, 32],
      iconAnchor: [12, 32],
    });
  }

  function buildReferenceIcon() {
    return leaflet.divIcon({
      className: "",
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20S24 21 24 12C24 5.4 18.6 0 12 0z" fill="#f59e0b"/>
        <circle cx="12" cy="11" r="4" fill="white" opacity="0.9"/>
      </svg>`,
      iconSize: [24, 32],
      iconAnchor: [12, 32],
    });
  }

  function redraw() {
    if (!map || !leaflet) return;

    drawnMarkers.forEach((m) => m.remove());
    drawnMarkers = [];

    if (polyline) {
      polyline.remove();
      polyline = null;
    }

    // Reference marker (non-interactive, amber pin)
    if (referenceMarker) {
      referenceMarker.remove();
      referenceMarker = null;
    }
    if (referenceLat != null && referenceLng != null) {
      referenceMarker = leaflet
        .marker([referenceLat, referenceLng], {
          icon: buildReferenceIcon(),
          interactive: false,
          keyboard: false,
        })
        .addTo(map);
      referenceMarker.bindTooltip(referenceLabel, { permanent: false, direction: "top" });
      // Only pan to reference if no waypoints yet
      if (waypoints.length === 0) {
        map.setView([referenceLat, referenceLng], 13);
      }
    }

    if (waypoints.length > 1) {
      polyline = leaflet
        .polyline(
          waypoints.map((w: Waypoint) => [w.lat, w.lng]),
          { color: "#4f46e5", weight: 3, opacity: 0.8 }
        )
        .addTo(map);
    }

    waypoints.forEach((wp: Waypoint, i: number) => {
      const m = leaflet
        .marker([wp.lat, wp.lng], { icon: buildIcon(i), draggable: editable })
        .addTo(map);

      if (editable) {
        m.on("contextmenu", () => {
          waypoints = waypoints.filter((_: Waypoint, idx: number) => idx !== i);
          emitChange();
          redraw();
        });

        m.on("dragend", () => {
          const pos = m.getLatLng();
          waypoints[i] = { ...waypoints[i], lat: pos.lat, lng: pos.lng };
          emitChange();
          redraw();
        });
      }

      const label = wp.label || `Waypoint ${i + 1}`;
      m.bindTooltip(label, { permanent: false, direction: "top" });
      drawnMarkers.push(m);
    });

    if (waypoints.length > 0) {
      map.fitBounds(
        waypoints.map((w: Waypoint) => [w.lat, w.lng]),
        { padding: [40, 40], maxZoom: 14 }
      );
    }
  }

  onMount(async () => {
    leaflet = (await import("leaflet")).default;

    map = leaflet.map(mapContainer).setView([centerLat, centerLng], zoom);

    const def = DEFAULT_TILE_LAYER;
    activeTileLayer = leaflet
      .tileLayer(def.url, { attribution: def.attribution, maxZoom: def.maxZoom })
      .addTo(map);

    if (editable) {
      map.on("click", (e: any) => {
        waypoints = [...waypoints, { lat: e.latlng.lat, lng: e.latlng.lng }];
        emitChange();
        redraw();
      });
    }

    redraw();
  });

  onDestroy(() => {
    if (map) map.remove();
  });

  $: if (map && leaflet) redraw();
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
</svelte:head>

<div class="relative">
  <div class="isolate w-full rounded-lg overflow-hidden" style="height: {height};">
    <div bind:this={mapContainer} class="w-full h-full"></div>
  </div>

  <div class="mt-1.5 flex items-center justify-between">
    {#if editable}
      <span class="text-xs text-gray-500"
        >Click map to add waypoints &bull; Right-click a marker to remove &bull; Drag to reposition</span
      >
    {:else}
      <span></span>
    {/if}

    <div class="flex items-center gap-2">
      {#if editable && waypoints.length > 0}
        <button
          type="button"
          on:click={() => {
            waypoints = [];
            emitChange();
            redraw();
          }}
          class="text-xs text-red-500 hover:text-red-700 font-medium"
        >
          Clear all
        </button>
      {/if}

      <!-- Tile layer toggle -->
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
  </div>
</div>

<style>
  :global(.leaflet-container) {
    font-family: inherit;
    border-radius: 0.5rem;
  }
</style>
