<script lang="ts">
  import { onMount, onDestroy } from "svelte";

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

  function emitChange() {
    waypoints = [...waypoints];
  }

  function buildIcon(index: number) {
    return leaflet.divIcon({
      className: "",
      html: `<div style="
        width:28px;height:28px;
        background:#4f46e5;
        border:2px solid white;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        color:white;font-size:11px;font-weight:700;
        box-shadow:0 2px 6px rgba(0,0,0,.4);
      ">${index + 1}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  function buildReferenceIcon() {
    return leaflet.divIcon({
      className: "",
      html: `<div style="
        width:22px;height:22px;
        background:#f59e0b;
        border:2px solid white;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 6px rgba(0,0,0,.4);
      "><svg viewBox="0 0 24 24" width="12" height="12" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
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

    leaflet
      .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      })
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
  <div bind:this={mapContainer} style="height: {height};" class="w-full rounded-lg"></div>

  {#if editable}
    <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
      <span
        >Click map to add waypoints &bull; Right-click a marker to remove &bull; Drag to
        reposition</span
      >
      {#if waypoints.length > 0}
        <button
          type="button"
          on:click={() => {
            waypoints = [];
            emitChange();
            redraw();
          }}
          class="text-red-500 hover:text-red-700 font-medium"
        >
          Clear all
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  :global(.leaflet-container) {
    font-family: inherit;
    border-radius: 0.5rem;
  }
</style>
