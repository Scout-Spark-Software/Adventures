<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type L from "leaflet";

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

  function makeIcon(color: string) {
    const hex = colorMap[color] ?? colorMap.emerald;
    return leaflet!.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;border-radius:50%;background:${hex};border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.45);"></div>`,
      iconAnchor: [7, 7],
      popupAnchor: [0, -12],
    });
  }

  function renderMarkers() {
    if (!map || !leaflet || !markerLayer) return;
    markerLayer.clearLayers();

    const bounds: [number, number][] = [];

    for (const m of markers) {
      const icon = makeIcon(m.color);
      const marker = leaflet
        .marker([m.lat, m.lng], { icon })
        .addTo(markerLayer);

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

    leaflet
      .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      })
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

<div bind:this={mapContainer} style="height: {height};" class="w-full rounded-xl overflow-hidden"></div>

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
