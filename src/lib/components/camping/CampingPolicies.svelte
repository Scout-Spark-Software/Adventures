<script lang="ts">
  import Card from '../Card.svelte';

  export let capacity: string | undefined;
  export let reservationInfo: string | undefined;
  export let policies: string | undefined;

  $: hasAnyPolicies = capacity || reservationInfo || policies;
</script>

{#if hasAnyPolicies}
  <Card>
    <h3 slot="header" class="text-lg font-bold text-gray-900">
      Policies & Information
    </h3>
    <div class="space-y-4">
      {#if capacity}
        <div>
          <dt class="text-sm font-medium text-gray-500 mb-1">Capacity</dt>
          <dd class="text-gray-900">{capacity}</dd>
        </div>
      {/if}
      {#if reservationInfo}
        <div>
          <dt class="text-sm font-medium text-gray-500 mb-1">Reservation Info</dt>
          <dd class="text-gray-900 whitespace-pre-wrap">{reservationInfo}</dd>
        </div>
      {/if}
      {#if policies}
        <div>
          <dt class="text-sm font-medium text-gray-500 mb-1">Policies</dt>
          <dd class="text-gray-900 whitespace-pre-wrap">{policies}</dd>
        </div>
      {/if}
    </div>
  </Card>
{/if}
