<script lang="ts">
  import Card from "../Card.svelte";
  import LocationMap from "../LocationMap.svelte";
  import { MapPin, ExternalLink } from "lucide-svelte";

  export let address:
    | {
        address?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
      }
    | undefined;
</script>

{#if address}
  <Card>
    <h2 slot="header" class="text-lg font-bold text-gray-900 flex items-center gap-2">
      <MapPin size={20} />
      Location
    </h2>

    {#if address.latitude && address.longitude}
      <div class="mb-4">
        <LocationMap latitude={address.latitude} longitude={address.longitude} height="250px" />
      </div>
      <div class="flex gap-2 mb-4">
        <a
          href="https://www.openstreetmap.org/?mlat={address.latitude}&mlon={address.longitude}#map=15/{address.latitude}/{address.longitude}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
        >
          <ExternalLink size={16} />
          OpenStreetMap
        </a>
      </div>
    {/if}

    <div class="space-y-3 text-gray-700">
      {#if address.address}
        <p class="font-medium">{address.address}</p>
      {/if}
      <p>
        {#if address.city}{address.city}{/if}{#if address.city && address.state},
        {/if}{#if address.state}{address.state}{/if}
        {#if address.postalCode}
          {address.postalCode}
        {/if}
      </p>
      {#if address.country}
        <p>{address.country}</p>
      {/if}
      {#if address.latitude && address.longitude}
        <div class="pt-3 border-t border-gray-200">
          <p class="text-xs text-gray-500 mb-2">GPS Coordinates</p>
          <p class="text-sm font-mono bg-gray-50 p-2 rounded mb-2">
            {address.latitude}, {address.longitude}
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query={address.latitude},{address.longitude}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
          >
            <ExternalLink size={12} />
            Open in Google Maps
          </a>
        </div>
      {/if}
    </div>
  </Card>
{/if}
