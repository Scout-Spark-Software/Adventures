<script lang="ts">
  import Card from '../Card.svelte';
  import CheckIcon from '../icons/CheckIcon.svelte';

  export let siteType: string | undefined;
  export let petPolicy: string | undefined;
  export let firePolicy: string | undefined;
  export let reservationRequired: boolean | undefined;
  export let operatingSeasonStart: string | undefined;
  export let operatingSeasonEnd: string | undefined;

  $: hasPolicies = siteType || petPolicy || firePolicy || reservationRequired !== undefined || operatingSeasonStart || operatingSeasonEnd;
</script>

{#if hasPolicies}
  <Card>
    <h2 slot="header" class="text-xl font-bold text-gray-900 flex items-center gap-2">
      <svg
        class="w-5 h-5 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Site Policies
    </h2>
    <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#if siteType}
        <div>
          <dt class="text-sm font-medium text-gray-500">Site Type</dt>
          <dd class="text-gray-900 capitalize">
            {siteType.replace(/_/g, ' ')}
          </dd>
        </div>
      {/if}
      {#if petPolicy}
        <div>
          <dt class="text-sm font-medium text-gray-500">Pet Policy</dt>
          <dd class="text-gray-900 capitalize flex items-center gap-2">
            {#if petPolicy === 'allowed'}
              <CheckIcon size="sm" />
            {:else if petPolicy === 'not_allowed'}
              <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            {/if}
            {petPolicy.replace(/_/g, ' ')}
          </dd>
        </div>
      {/if}
      {#if firePolicy}
        <div>
          <dt class="text-sm font-medium text-gray-500">Fire Policy</dt>
          <dd class="text-gray-900 capitalize">
            {firePolicy.replace(/_/g, ' ')}
          </dd>
        </div>
      {/if}
      {#if reservationRequired !== undefined}
        <div>
          <dt class="text-sm font-medium text-gray-500">Reservation</dt>
          <dd class="text-gray-900">
            {reservationRequired ? 'Required' : 'Not Required'}
          </dd>
        </div>
      {/if}
      {#if operatingSeasonStart || operatingSeasonEnd}
        <div class="md:col-span-2">
          <dt class="text-sm font-medium text-gray-500 mb-1">Operating Season</dt>
          <dd class="text-gray-900">
            {#if operatingSeasonStart && operatingSeasonEnd}
              {operatingSeasonStart} - {operatingSeasonEnd}
            {:else if operatingSeasonStart}
              From {operatingSeasonStart}
            {:else}
              Until {operatingSeasonEnd}
            {/if}
          </dd>
        </div>
      {/if}
    </dl>
  </Card>
{/if}
