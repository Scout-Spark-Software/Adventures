<script lang="ts">
  import type { Hike, Address } from "$lib/db/schemas";
  import ModerationBadge from "./ModerationBadge.svelte";

  export let hike: Hike & { address?: Pick<Address, "city" | "state"> | null };

  $: locationText = hike.address
    ? [hike.address.city, hike.address.state].filter(Boolean).join(", ")
    : "";
</script>

<a
  href="/hikes/{hike.id}"
  class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
>
  <!-- Image Placeholder -->
  <div
    class="relative h-40 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 overflow-hidden"
  >
    <!-- Decorative mountain/hill shapes -->
    <div class="absolute inset-0">
      <svg
        class="absolute bottom-0 w-full h-32"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 Q300,10 600,60 T1200,60 L1200,120 L0,120 Z"
          fill="rgba(255,255,255,0.1)"
        />
      </svg>
      <svg
        class="absolute bottom-0 w-full h-24"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,80 Q200,20 400,80 T800,80 T1200,80 L1200,120 L0,120 Z"
          fill="rgba(255,255,255,0.15)"
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
          {hike.difficulty.charAt(0).toUpperCase() +
            hike.difficulty.slice(1).replace("_", " ")}
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
          <svg
            class="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          {hike.distance}
        </span>
      {/if}
      {#if hike.duration}
        <span
          class="inline-flex items-center px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-gray-700"
        >
          <svg
            class="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
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
        <svg
          class="w-4 h-4 mr-1.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span class="line-clamp-1">{locationText}</span>
      </div>
    {/if}

    <div
      class="flex items-center justify-between pt-2 border-t border-gray-100"
    >
      <span
        class="text-sm font-medium text-indigo-600 group-hover:text-indigo-700"
      >
        View Details
      </span>
      <svg
        class="w-4 h-4 text-indigo-600 transition-transform group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  </div>
</a>
