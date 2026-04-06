<script lang="ts">
  import type { CampingSite, Address } from "$lib/db/schemas";
  import { SITE_TYPE_LABELS } from "$lib/db/schemas/enums";
  import ModerationBadge from "./ModerationBadge.svelte";
  import { Users, DollarSign, MapPin, ChevronRight } from "lucide-svelte";

  export let campingSite: CampingSite & {
    address?: Pick<Address, "city" | "state"> | null;
    bannerImageUrl?: string | null;
  };
  export let listView: boolean = false;
  export let priority: boolean = false;

  $: locationText = campingSite.address
    ? [campingSite.address.city, campingSite.address.state].filter(Boolean).join(", ")
    : "";
</script>

{#if listView}
  <a
    href="/camping/{campingSite.slug}"
    class="group bg-white rounded-xl border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-stretch overflow-hidden"
  >
    <!-- Thumbnail -->
    <div
      class="relative w-36 self-stretch flex-shrink-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 overflow-hidden"
    >
      {#if campingSite.bannerImageUrl}
        <img
          src={campingSite.bannerImageUrl}
          alt={campingSite.name}
          class="absolute inset-0 w-full h-full object-cover"
          width="144"
          height="144"
          loading="lazy"
          decoding="async"
        />
      {:else}
        <div class="absolute inset-0">
          <svg
            class="absolute bottom-0 w-full h-16 text-indigo-600/30"
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0 200 L0 120 L150 60 L300 100 L450 30 L600 80 L750 20 L900 70 L1050 40 L1200 90 L1200 200 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      {/if}
      {#if campingSite.siteType}
        <div class="absolute bottom-1.5 left-1.5">
          <span
            class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full backdrop-blur-sm bg-blue-100/90 text-blue-800"
          >
            {SITE_TYPE_LABELS[campingSite.siteType] ?? campingSite.siteType}
          </span>
        </div>
      {/if}
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0 px-4 py-4">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <h3 class="font-bold text-gray-900 line-clamp-1">{campingSite.name}</h3>
          {#if campingSite.description}
            <p class="text-sm text-gray-500 line-clamp-1 mt-0.5">{campingSite.description}</p>
          {/if}
          <div class="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
            {#if locationText}
              <span class="flex items-center text-xs text-gray-400">
                <MapPin size={11} class="mr-1 flex-shrink-0" />{locationText}
              </span>
            {/if}
            {#if campingSite.capacity}
              <span class="flex items-center text-xs text-gray-500">
                <Users size={11} class="mr-1 flex-shrink-0" />{campingSite.capacity} people
              </span>
            {/if}
            {#if campingSite.costPerNight}
              <span class="flex items-center text-xs text-gray-500">
                <DollarSign size={11} class="mr-1 flex-shrink-0" />${campingSite.costPerNight}/night
              </span>
            {/if}
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <ModerationBadge status={campingSite.status} />
          <ChevronRight
            size={16}
            class="text-indigo-600 transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </div>
  </a>
{:else}
  <a
    href="/camping/{campingSite.slug}"
    class="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 block border border-gray-100 hover:border-emerald-200"
  >
    <!-- Image -->
    <div
      class="relative h-32 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 overflow-hidden"
    >
      {#if campingSite.bannerImageUrl}
        <img
          src={campingSite.bannerImageUrl}
          alt={campingSite.name}
          class="absolute inset-0 w-full h-full object-cover"
          width="400"
          height="128"
          loading={priority ? "eager" : "lazy"}
          fetchpriority={priority ? "high" : "auto"}
          decoding={priority ? "sync" : "async"}
        />
      {:else}
        <!-- Decorative mountain shapes -->
        <div class="absolute inset-0">
          <svg
            class="absolute bottom-0 w-full h-28 text-indigo-600/30"
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0 200 L0 120 L150 60 L300 100 L450 30 L600 80 L750 20 L900 70 L1050 40 L1200 90 L1200 200 Z"
              fill="currentColor"
            />
          </svg>
          <svg
            class="absolute bottom-0 w-full h-24 text-indigo-700/25"
            viewBox="0 0 1200 160"
            preserveAspectRatio="none"
          >
            <path
              d="M0 160 L0 100 L200 50 L400 90 L600 30 L800 70 L1000 45 L1200 80 L1200 160 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      {/if}

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
        <p class="text-gray-600 mb-3 line-clamp-1 text-sm leading-relaxed">
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
{/if}
