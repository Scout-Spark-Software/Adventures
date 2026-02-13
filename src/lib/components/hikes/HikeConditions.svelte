<script lang="ts">
  import Card from "../Card.svelte";
  import Badge from "../Badge.svelte";
  import CheckIcon from "../icons/CheckIcon.svelte";

  export let dogFriendly: boolean | undefined = undefined;
  export let waterSources: boolean | undefined = undefined;
  export let bestSeason: string[] | undefined = undefined;
  export let permitsRequired: string | undefined = undefined;
  export let parkingInfo: string | undefined = undefined;

  $: hasAnyConditions =
    dogFriendly ||
    waterSources ||
    (bestSeason && bestSeason.length > 0) ||
    permitsRequired ||
    parkingInfo;
</script>

{#if hasAnyConditions}
  <Card>
    <h2 slot="header" class="text-xl font-bold text-gray-900 flex items-center gap-2">
      <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Trail Conditions & Access
    </h2>

    <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {#if dogFriendly}
        <div class="flex items-start gap-3">
          <div
            class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
          >
            <CheckIcon size="lg" />
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Dog-Friendly</dt>
            <dd class="text-gray-900 font-medium">Yes</dd>
          </div>
        </div>
      {/if}

      {#if waterSources}
        <div class="flex items-start gap-3">
          <div
            class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
          >
            <CheckIcon size="lg" />
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Water Sources</dt>
            <dd class="text-gray-900 font-medium">Available on trail</dd>
          </div>
        </div>
      {/if}

      {#if bestSeason && Array.isArray(bestSeason) && bestSeason.length > 0}
        <div class="md:col-span-2">
          <dt class="text-sm font-medium text-gray-500 mb-2">Best Season to Visit</dt>
          <dd class="flex flex-wrap gap-2">
            {#each bestSeason as season}
              <Badge variant="primary" size="md">
                {season}
              </Badge>
            {/each}
          </dd>
        </div>
      {/if}

      {#if permitsRequired}
        <div class="md:col-span-2">
          <dt class="text-sm font-medium text-gray-500 mb-2">Permits/Passes Required</dt>
          <dd class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div class="flex items-start gap-2">
              <svg
                class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span class="text-gray-900">{permitsRequired}</span>
            </div>
          </dd>
        </div>
      {/if}

      {#if parkingInfo}
        <div class="md:col-span-2">
          <dt class="text-sm font-medium text-gray-500 mb-2">Parking Information</dt>
          <dd class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p class="text-gray-900 whitespace-pre-wrap">{parkingInfo}</p>
          </dd>
        </div>
      {/if}
    </dl>
  </Card>
{/if}
