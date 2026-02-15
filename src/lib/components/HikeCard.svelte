<script lang="ts">
  import type { Hike, Address } from "$lib/db/schemas";
  import ModerationBadge from "./ModerationBadge.svelte";
  import { TrendingUp, Clock, MapPin, ChevronRight } from "lucide-svelte";

  export let hike: Hike & { address?: Pick<Address, "city" | "state"> | null };

  $: locationText = hike.address
    ? [hike.address.city, hike.address.state].filter(Boolean).join(", ")
    : "";
</script>

<a
  href="/hikes/{hike.id}"
  class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
>
  <!-- Image Placeholder -->
  <div
    class="relative h-40 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 overflow-hidden"
  >
    <!-- Decorative mountain shapes -->
    <div class="absolute inset-0">
      <svg
        class="absolute bottom-0 w-full h-28 text-green-600/30"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0 200 L0 120 L150 60 L300 100 L450 30 L600 80 L750 20 L900 70 L1050 40 L1200 90 L1200 200 Z"
          fill="currentColor"
        />
      </svg>
      <svg
        class="absolute bottom-0 w-full h-24 text-green-700/25"
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
      >
        <path
          d="M0 160 L0 100 L200 50 L400 90 L600 30 L800 70 L1000 45 L1200 80 L1200 160 Z"
          fill="currentColor"
        />
      </svg>
    </div>

    <!-- Difficulty Badge -->
    {#if hike.difficulty}
      <div class="absolute top-3 left-3">
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm
					{hike.difficulty === 'easy'
            ? 'bg-green-100/90 text-green-800'
            : hike.difficulty === 'moderate'
              ? 'bg-yellow-100/90 text-yellow-800'
              : hike.difficulty === 'hard'
                ? 'bg-orange-100/90 text-orange-800'
                : 'bg-red-100/90 text-red-800'}"
        >
          {hike.difficulty.charAt(0).toUpperCase() + hike.difficulty.slice(1).replace("_", " ")}
        </span>
      </div>
    {/if}

    <!-- Moderation Badge -->
    <div class="absolute top-3 right-3">
      <ModerationBadge status={hike.status} />
    </div>

    <!-- Distance & Duration overlay -->
    <div class="absolute bottom-3 left-3 right-3 flex gap-2">
      {#if hike.distance}
        <span
          class="inline-flex items-center px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-gray-700"
        >
          <TrendingUp size={12} class="mr-1" />
          {hike.distance}
        </span>
      {/if}
      {#if hike.duration}
        <span
          class="inline-flex items-center px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-gray-700"
        >
          <Clock size={12} class="mr-1" />
          {hike.duration}
        </span>
      {/if}
    </div>
  </div>

  <div class="p-4">
    <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
      {hike.name}
    </h3>

    {#if hike.description}
      <p class="text-gray-600 mb-3 line-clamp-2 text-sm leading-relaxed">
        {hike.description}
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
