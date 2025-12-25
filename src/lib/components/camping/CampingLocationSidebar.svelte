<script lang="ts">
  import Card from '../Card.svelte';
  import LocationIcon from '../icons/LocationIcon.svelte';

  export let address: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  } | undefined;
</script>

{#if address}
  <Card>
    <h3 slot="header" class="text-lg font-bold text-gray-900 flex items-center gap-2">
      <LocationIcon size="md" />
      Location
    </h3>

    <div class="space-y-3 text-gray-700">
      {#if address.address}
        <p class="font-medium">{address.address}</p>
      {/if}
      <p>
        {#if address.city}{address.city}{/if}{#if address.city && address.state}, {/if}{#if address.state}{address.state}{/if}
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
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open in Google Maps
          </a>
        </div>
      {/if}
    </div>
  </Card>
{/if}
