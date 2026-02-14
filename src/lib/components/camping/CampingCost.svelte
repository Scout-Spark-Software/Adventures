<script lang="ts">
  import Card from "../Card.svelte";
  import { CircleDollarSignIcon, DollarSign } from "lucide-svelte";

  export let baseFee: string | undefined;
  export let costPerNight: string | undefined;

  $: hasCost = baseFee || costPerNight;
</script>

{#if hasCost}
  <Card>
    <h2 slot="header" class="text-xl font-bold text-gray-900 flex items-center gap-2">
      <CircleDollarSignIcon size={20} class="text-indigo-600" />
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
