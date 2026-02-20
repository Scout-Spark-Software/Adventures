<script lang="ts">
  import Card from "../Card.svelte";
  import Badge from "../Badge.svelte";
  import { Check, CircleCheck, AlertTriangle } from "lucide-svelte";

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
      <CircleCheck size={24} class="text-indigo-600" />
      Trail Conditions & Access
    </h2>

    <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {#if dogFriendly}
        <div class="flex items-start gap-3">
          <div
            class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
          >
            <Check size={24} />
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
            <Check size={24} />
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
            {#each bestSeason as season (season)}
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
              <AlertTriangle size={20} class="text-yellow-600 flex-shrink-0 mt-0.5" />
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
