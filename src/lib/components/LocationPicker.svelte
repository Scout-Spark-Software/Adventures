<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { MapPin } from "lucide-svelte";
  import type L from "leaflet";
  import { TILE_LAYERS, DEFAULT_TILE_LAYER, getTileLayer, type TileLayerId } from "$lib/utils/map-tiles";

  export let address = "";
  export let city = "";
  export let state = "";
  export let country = "";
  export let postalCode = "";
  export let latitude: number | null = null;
  export let longitude: number | null = null;

  let mapContainer: HTMLDivElement;
  let map: L.Map | null = null;
  let marker: L.Marker | null = null;
  let leaflet: typeof L | null = null;
  let activeTileLayer: L.TileLayer | null = null;
  let activeLayerId: TileLayerId = DEFAULT_TILE_LAYER.id;

  function switchLayer(id: TileLayerId) {
    if (!map || !leaflet || id === activeLayerId) return;
    const def = getTileLayer(id);
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
    // Dynamically import Leaflet to avoid SSR issues
    leaflet = (await import("leaflet")).default;

    // Initialize map with default view
    const defaultLat = latitude || 37.7749;
    const defaultLng = longitude || -122.4194;

    map = leaflet.map(mapContainer).setView([defaultLat, defaultLng], latitude ? 13 : 4);

    // Add default tile layer
    const def = DEFAULT_TILE_LAYER;
    activeTileLayer = leaflet
      .tileLayer(def.url, { attribution: def.attribution, maxZoom: def.maxZoom })
      .addTo(map);

    // Add marker if coordinates exist
    if (latitude && longitude) {
      marker = leaflet
        .marker([latitude, longitude], {
          draggable: true,
        })
        .addTo(map);

      // Update coordinates when marker is dragged
      marker.on("dragend", () => {
        if (marker) {
          const pos = marker.getLatLng();
          latitude = pos.lat;
          longitude = pos.lng;
        }
      });
    }

    // Allow clicking on map to set location
    map.on("click", (e: L.LeafletMouseEvent) => {
      latitude = e.latlng.lat;
      longitude = e.latlng.lng;

      if (marker) {
        marker.setLatLng(e.latlng);
      } else if (leaflet) {
        marker = leaflet
          .marker(e.latlng, {
            draggable: true,
          })
          .addTo(map!);

        marker.on("dragend", () => {
          if (marker) {
            const pos = marker.getLatLng();
            latitude = pos.lat;
            longitude = pos.lng;
          }
        });
      }
    });
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });

  function getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;

          if (map && leaflet) {
            map.setView([latitude, longitude], 13);

            if (marker) {
              marker.setLatLng([latitude, longitude]);
            } else {
              marker = leaflet
                .marker([latitude, longitude], {
                  draggable: true,
                })
                .addTo(map);

              marker.on("dragend", () => {
                if (marker) {
                  const pos = marker.getLatLng();
                  latitude = pos.lat;
                  longitude = pos.lng;
                }
              });
            }
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to get your location. Please enter coordinates manually or click on the map."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }

  $: if (map && latitude != null && longitude != null && leaflet) {
    map.setView([latitude, longitude], 13);
    if (marker) {
      marker.setLatLng([latitude, longitude]);
    } else {
      marker = leaflet
        .marker([latitude, longitude], {
          draggable: true,
        })
        .addTo(map);

      marker.on("dragend", () => {
        if (marker) {
          const pos = marker.getLatLng();
          latitude = pos.lat;
          longitude = pos.lng;
        }
      });
    }
  }

  $: hasCoordinates = latitude !== null && longitude !== null;
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
</svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2 mb-4">
    <button
      type="button"
      on:click={getCurrentLocation}
      class="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
    >
      <MapPin size={16} />
      Use Current Location
    </button>
    {#if hasCoordinates}
      <span class="text-sm text-green-600">✓ Location set</span>
    {/if}
  </div>

  <!-- Interactive Map -->
  <div class="border rounded-lg overflow-hidden bg-gray-100" style="isolation: isolate;">
    <div bind:this={mapContainer} class="h-64 w-full"></div>
    <div class="bg-gray-50 px-3 py-2 text-xs text-gray-600 border-t">
      💡 Click on the map to set location, or drag the marker to adjust
    </div>
  </div>

  <!-- Tile layer toggle -->
  <div class="mb-4 flex justify-end">
    <div role="group" aria-label="Map tile layer" class="flex rounded-md overflow-hidden border border-gray-200 shadow-sm">
      {#each TILE_LAYERS as layer}
        <button
          type="button"
          aria-pressed={activeLayerId === layer.id}
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

  <div>
    <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
      Street Address
    </label>
    <input
      type="text"
      id="address"
      name="address"
      bind:value={address}
      placeholder="123 Main St"
      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
    />
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label for="city" class="block text-sm font-medium text-gray-700 mb-1"> City * </label>
      <input
        type="text"
        id="city"
        name="city"
        bind:value={city}
        placeholder="San Francisco"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
    <div>
      <label for="state" class="block text-sm font-medium text-gray-700 mb-1">
        State/Province *
      </label>
      <input
        type="text"
        id="state"
        name="state"
        bind:value={state}
        placeholder="CA"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label for="postal_code" class="block text-sm font-medium text-gray-700 mb-1">
        Postal Code
      </label>
      <input
        type="text"
        id="postal_code"
        name="postal_code"
        bind:value={postalCode}
        placeholder="94102"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
    <div>
      <label for="country" class="block text-sm font-medium text-gray-700 mb-1"> Country </label>
      <input
        type="text"
        id="country"
        name="country"
        bind:value={country}
        placeholder="USA"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label for="latitude" class="block text-sm font-medium text-gray-700 mb-1"> Latitude </label>
      <input
        type="number"
        step="any"
        id="latitude"
        name="latitude"
        bind:value={latitude}
        placeholder="37.7749"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
    <div>
      <label for="longitude" class="block text-sm font-medium text-gray-700 mb-1">
        Longitude
      </label>
      <input
        type="number"
        step="any"
        id="longitude"
        name="longitude"
        bind:value={longitude}
        placeholder="-122.4194"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  </div>
</div>

<style>
  :global(.leaflet-container) {
    font-family: inherit;
  }
</style>
