<script lang="ts">
  export let rating: number;
  export let totalRatings: number = 0;
  export let size: "sm" | "md" | "lg" = "md";
  export let showCount: boolean = true;

  $: sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  $: textSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  function getStarFill(starIndex: number): number {
    const diff = rating - starIndex;
    if (diff >= 1) return 100;
    if (diff >= 0.5) return 50;
    return 0;
  }
</script>

<div class="flex items-center gap-2">
  <div class="flex items-center gap-1">
    {#each Array(5) as _, i}
      <svg class={sizeClasses[size]} viewBox="0 0 24 24">
        <defs>
          <linearGradient id="star-display-{i}-{rating}">
            <stop offset="{getStarFill(i)}%" stop-color="#FBBF24" />
            <stop offset="{getStarFill(i)}%" stop-color="#E5E7EB" />
          </linearGradient>
        </defs>
        <path
          fill="url(#star-display-{i}-{rating})"
          stroke="#F59E0B"
          stroke-width="1"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    {/each}
  </div>

  {#if showCount}
    <span class="{textSize[size]} text-gray-600 font-medium">
      {rating.toFixed(1)} ({totalRatings}
      {totalRatings === 1 ? "rating" : "ratings"})
    </span>
  {/if}
</div>
