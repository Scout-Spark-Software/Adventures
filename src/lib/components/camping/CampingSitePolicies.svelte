<script lang="ts">
  import Card from "../Card.svelte";
  import {
    Check,
    CircleCheck,
    AlertTriangle,
    FileText,
    X,
    PawPrintIcon,
    FlameKindlingIcon,
  } from "lucide-svelte";
  import { SITE_TYPE_LABELS } from "$lib/db/schemas/enums";

  export let siteType: string | undefined;
  export let petPolicy: string | undefined;
  export let firePolicy: string | undefined;
  export let reservationRequired: boolean | undefined;
  export let operatingSeasonStart: string | undefined;
  export let operatingSeasonEnd: string | undefined;

  $: hasPolicies =
    siteType ||
    petPolicy ||
    firePolicy ||
    reservationRequired !== undefined ||
    operatingSeasonStart ||
    operatingSeasonEnd;
</script>

{#if hasPolicies}
  <Card>
    <h2 slot="header" class="text-xl font-bold text-gray-900 flex items-center gap-2">
      <FileText size={20} class="text-indigo-600" />
      Site Policies
    </h2>
    <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#if siteType}
        <div>
          <dt class="text-sm font-medium text-gray-500">Site Type</dt>
          <dd class="text-gray-900">
            {SITE_TYPE_LABELS[siteType] ?? siteType}
          </dd>
        </div>
      {/if}
      {#if petPolicy}
        <div>
          <dt class="text-sm font-medium text-gray-500">Pet Policy</dt>
          <dd class="text-gray-900 capitalize flex items-center gap-2">
            {#if petPolicy === "allowed"}
              <PawPrintIcon size={16} />
            {:else if petPolicy === "not_allowed"}
              <X size={16} class="text-red-600" />
            {/if}
            {petPolicy.replace(/_/g, " ")}
          </dd>
        </div>
      {/if}
      {#if firePolicy}
        <div>
          <dt class="text-sm font-medium text-gray-500">Fire Policy</dt>
          <dd class="text-gray-900 capitalize flex items-center gap-2">
            <FlameKindlingIcon size={16} />
            {firePolicy.replace(/_/g, " ")}
          </dd>
        </div>
      {/if}
      {#if reservationRequired !== undefined}
        <div>
          <dt class="text-sm font-medium text-gray-500">Reservation</dt>
          <dd class="text-gray-900">
            {reservationRequired ? "Required" : "Not Required"}
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
