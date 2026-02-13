<script lang="ts">
  import Card from "../Card.svelte";
  import { Check } from "lucide-svelte";

  export let amenities:
    | {
        water?: boolean;
        electricity?: boolean;
        restrooms?: boolean;
        showers?: boolean;
        wifi?: boolean;
        firePits?: boolean;
        picnicTables?: boolean;
        trashDisposal?: boolean;
      }
    | undefined;

  $: hasAmenities =
    amenities && Object.values(amenities).some((v) => v === true);
</script>

{#if hasAmenities}
  <Card>
    <h3 slot="header" class="text-lg font-bold text-gray-900">Amenities</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      {#if amenities?.water}
        <div class="flex items-center text-gray-700">
          <Check size={20} />
          <span class="ml-2">Water</span>
        </div>
      {/if}
      {#if amenities?.electricity}
        <div class="flex items-center text-gray-700">
          <Check size={20} />
          <span class="ml-2">Electricity</span>
        </div>
      {/if}
      {#if amenities?.restrooms}
        <div class="flex items-center text-gray-700">
          <Check size={20} />
          <span class="ml-2">Restrooms</span>
        </div>
      {/if}
      {#if amenities?.showers}
        <div class="flex items-center text-gray-700">
          <Check size={20} />
          <span class="ml-2">Showers</span>
        </div>
      {/if}
      {#if amenities?.wifi}
        <div class="flex items-center text-gray-700">
          <Check size={20} />
          <span class="ml-2">WiFi</span>
        </div>
      {/if}
      {#if amenities?.firePits}
        <div class="flex items-center text-gray-700">
          <Check size={20} />
          <span class="ml-2">Fire Pits</span>
        </div>
      {/if}
      {#if amenities?.picnicTables}
        <div class="flex items-center text-gray-700">
          <Check size={20} />
          <span class="ml-2">Picnic Tables</span>
        </div>
      {/if}
      {#if amenities?.trashDisposal}
        <div class="flex items-center text-gray-700">
          <Check size={20} />
          <span class="ml-2">Trash Disposal</span>
        </div>
      {/if}
    </div>
  </Card>
{/if}
