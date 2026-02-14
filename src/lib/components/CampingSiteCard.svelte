<script lang="ts">
  import type { CampingSite, Address } from "$lib/db/schemas";
  import { SITE_TYPE_LABELS } from "$lib/db/schemas/enums";
  import ModerationBadge from "./ModerationBadge.svelte";
  import { Users, DollarSign, MapPin, ChevronRight } from "lucide-svelte";

  export let campingSite: CampingSite & {
    address?: Pick<Address, "city" | "state"> | null;
  };

  $: locationText = campingSite.address
    ? [campingSite.address.city, campingSite.address.state].filter(Boolean).join(", ")
    : "";
</script>

<a
  href="/camping/{campingSite.id}"
  class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
>
  <!-- Image Placeholder -->
  <div
    class="relative h-40 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 overflow-hidden"
  >
    <!-- Decorative tent/tree shapes -->
    <div class="absolute inset-0">
      <svg class="absolute bottom-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,60 Q300,10 600,60 T1200,60 L1200,120 L0,120 Z" fill="rgba(255,255,255,0.1)" />
      </svg>
      <svg class="absolute bottom-0 w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path
          d="M0,80 Q200,20 400,80 T800,80 T1200,80 L1200,120 L0,120 Z"
          fill="rgba(255,255,255,0.15)"
        />
      </svg>
    </div>

    <!-- Site Type Badge -->
    {#if campingSite.siteType}
      <div class="absolute top-3 left-3">
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-blue-100/90 text-blue-800"
        >
          {SITE_TYPE_LABELS[campingSite.siteType] ?? campingSite.siteType}
        </span>
      </div>
    {/if}

    <!-- Moderation Badge -->
    <div class="absolute top-3 right-3">
      <ModerationBadge status={campingSite.status} />
    </div>

    <!-- Capacity & Cost overlay -->
    <div class="absolute bottom-3 left-3 right-3 flex gap-2">
      {#if campingSite.capacity}
        <span
          class="inline-flex items-center px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-gray-700"
        >
          <Users size={12} class="mr-1" />
          {campingSite.capacity} people
        </span>
      {/if}
      {#if campingSite.costPerNight}
        <span
          class="inline-flex items-center px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-gray-700"
        >
          <DollarSign size={12} class="mr-1" />
          ${campingSite.costPerNight}/night
        </span>
      {/if}
    </div>
  </div>

  <div class="p-4">
    <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
      {campingSite.name}
    </h3>

    {#if campingSite.description}
      <p class="text-gray-600 mb-3 line-clamp-2 text-sm leading-relaxed">
        {campingSite.description}
      </p>
    {/if}

    {#if locationText}
      <div class="flex items-center text-sm text-gray-500 mb-2">
        <MapPin size={16} class="mr-1.5 flex-shrink-0" />
        <span class="line-clamp-1">{locationText}</span>
      </div>
    {/if}

    <div class="flex items-center justify-between pt-2 border-t border-gray-100">
      <span class="text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
        View Details
      </span>
      <ChevronRight
        size={16}
        class="text-indigo-600 transition-transform group-hover:translate-x-1"
      />
    </div>
  </div>
</a>
