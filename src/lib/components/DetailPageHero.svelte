<script lang="ts">
  import Badge from "./Badge.svelte";
  import StatCard from "./StatCard.svelte";
  import LocationIcon from "./icons/LocationIcon.svelte";

  export let title: string;
  export let location: { city?: string; state?: string } | undefined =
    undefined;
  export let badges: Array<{
    text: string;
    variant?: "success" | "warning" | "error" | "info" | "neutral" | "primary";
  }> = [];
  export let stats: Array<{ label: string; value: string; icon?: any }> = [];
  export let backgroundType: "gradient" | "image" = "gradient";
  export let backgroundUrl: string | undefined = undefined;
  export let editUrl: string | undefined = undefined;
  export let showEdit: boolean = false;
  export let editText: string = "Edit";
</script>

<div
  class="relative h-72 overflow-hidden {backgroundType === 'gradient'
    ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600'
    : ''}"
  style={backgroundType === "image" && backgroundUrl
    ? `background-image: url(${backgroundUrl}); background-size: cover; background-position: center;`
    : ""}
>
  <!-- Decorative mountain/hill shapes for gradient background -->
  {#if backgroundType === "gradient"}
    <div class="absolute inset-0">
      <svg
        class="absolute bottom-0 w-full h-64"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 Q300,10 600,60 T1200,60 L1200,120 L0,120 Z"
          fill="rgba(255,255,255,0.1)"
        />
      </svg>
      <svg
        class="absolute bottom-0 w-full h-48"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,80 Q200,20 400,80 T800,80 T1200,80 L1200,120 L0,120 Z"
          fill="rgba(255,255,255,0.15)"
        />
      </svg>
      <svg
        class="absolute bottom-0 w-full h-32"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,90 Q150,50 300,90 T600,90 T900,90 T1200,90 L1200,120 L0,120 Z"
          fill="rgba(255,255,255,0.2)"
        />
      </svg>
    </div>
  {/if}

  <!-- Overlay Content -->
  <div
    class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8"
  >
    <div class="w-full">
      <div class="flex items-start justify-between mb-4">
        <div>
          <!-- Badges Section -->
          {#if $$slots.badges}
            <div class="flex items-center gap-3 mb-3">
              <slot name="badges" />
            </div>
          {:else if badges.length > 0}
            <div class="flex items-center gap-3 mb-3">
              {#each badges as badge}
                <Badge variant={badge.variant || "neutral"} size="md">
                  {badge.text}
                </Badge>
              {/each}
            </div>
          {/if}

          <!-- Title -->
          <h1
            class="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2"
          >
            {title}
          </h1>

          <!-- Location -->
          {#if location && (location.city || location.state)}
            <div class="flex items-center text-white/90 text-lg drop-shadow">
              <LocationIcon size="md" />
              <span class="ml-2">
                {#if location.city}{location.city}{/if}{#if location.city && location.state},
                {/if}{#if location.state}{location.state}{/if}
              </span>
            </div>
          {/if}
        </div>

        <!-- Actions Section -->
        {#if $$slots.actions}
          <div class="flex items-center gap-3">
            <slot name="actions" />
          </div>
        {:else if showEdit && editUrl}
          <div class="flex items-center gap-3">
            <a
              href={editUrl}
              class="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg shadow-lg hover:bg-white transition-colors"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>{editText}</span>
            </a>
            <slot name="favorite-button" />
          </div>
        {/if}
      </div>

      <!-- Stats Section -->
      {#if $$slots.stats}
        <div class="flex flex-wrap gap-3 mt-6">
          <slot name="stats" />
        </div>
      {:else if stats.length > 0}
        <div class="flex flex-wrap gap-3 mt-6">
          {#each stats as stat}
            <StatCard label={stat.label} value={stat.value} variant="glass">
              {#if stat.icon}
                <svelte:component this={stat.icon} slot="icon" size="md" />
              {/if}
            </StatCard>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
