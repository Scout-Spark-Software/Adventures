<script lang="ts">
  import Card from "../Card.svelte";

  export let baseFee: string | undefined;
  export let costPerNight: string | undefined;

  $: hasCost = baseFee || costPerNight;
</script>

{#if hasCost}
  <Card>
    <h2 slot="header" class="text-xl font-bold text-gray-900 flex items-center gap-2">
      <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Cost & Fees
    </h2>
    <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#if baseFee}
        <div>
          <dt class="text-sm font-medium text-gray-500">Base Fee</dt>
          <dd class="text-2xl font-bold text-gray-900">
            ${parseFloat(baseFee).toFixed(2)}
          </dd>
        </div>
      {/if}
      {#if costPerNight}
        <div>
          <dt class="text-sm font-medium text-gray-500">Cost Per Night</dt>
          <dd class="text-2xl font-bold text-gray-900">
            ${parseFloat(costPerNight).toFixed(2)}
          </dd>
        </div>
      {/if}
    </dl>
  </Card>
{/if}
