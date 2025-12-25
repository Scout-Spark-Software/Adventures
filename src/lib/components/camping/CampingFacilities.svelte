<script lang="ts">
  import Card from '../Card.svelte';
  import CheckIcon from '../icons/CheckIcon.svelte';

  export let facilities: {
    rvSites?: boolean;
    tentSites?: boolean;
    cabins?: boolean;
    playground?: boolean;
    boatLaunch?: boolean;
    fishing?: boolean;
    swimming?: boolean;
    hikingTrails?: boolean;
  } | undefined;

  $: hasFacilities = facilities && Object.values(facilities).some(v => v === true);
</script>

{#if hasFacilities}
  <Card>
    <h3 slot="header" class="text-lg font-bold text-gray-900">Facilities</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      {#if facilities?.rvSites}
        <div class="flex items-center text-gray-700">
          <CheckIcon size="md" />
          <span class="ml-2">RV Sites</span>
        </div>
      {/if}
      {#if facilities?.tentSites}
        <div class="flex items-center text-gray-700">
          <CheckIcon size="md" />
          <span class="ml-2">Tent Sites</span>
        </div>
      {/if}
      {#if facilities?.cabins}
        <div class="flex items-center text-gray-700">
          <CheckIcon size="md" />
          <span class="ml-2">Cabins</span>
        </div>
      {/if}
      {#if facilities?.playground}
        <div class="flex items-center text-gray-700">
          <CheckIcon size="md" />
          <span class="ml-2">Playground</span>
        </div>
      {/if}
      {#if facilities?.boatLaunch}
        <div class="flex items-center text-gray-700">
          <CheckIcon size="md" />
          <span class="ml-2">Boat Launch</span>
        </div>
      {/if}
      {#if facilities?.fishing}
        <div class="flex items-center text-gray-700">
          <CheckIcon size="md" />
          <span class="ml-2">Fishing</span>
        </div>
      {/if}
      {#if facilities?.swimming}
        <div class="flex items-center text-gray-700">
          <CheckIcon size="md" />
          <span class="ml-2">Swimming</span>
        </div>
      {/if}
      {#if facilities?.hikingTrails}
        <div class="flex items-center text-gray-700">
          <CheckIcon size="md" />
          <span class="ml-2">Hiking Trails</span>
        </div>
      {/if}
    </div>
  </Card>
{/if}
