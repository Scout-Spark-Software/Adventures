<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let rating: number = 0;
  export let size: "sm" | "md" | "lg" = "md";
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher();

  let hoveredRating: number = 0;

  $: sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  $: displayRating = hoveredRating || rating;

  function handleStarClick(newRating: number) {
    if (disabled) return;
    dispatch("change", newRating);
  }

  function handleStarHover(newRating: number) {
    if (disabled) return;
    hoveredRating = newRating;
  }

  function handleMouseLeave() {
    hoveredRating = 0;
  }

  function getStarFill(starIndex: number): number {
    const diff = displayRating - starIndex;
    if (diff >= 1) return 100;
    if (diff >= 0.5) return 50;
    return 0;
  }
</script>

<div class="flex items-center gap-2">
  <div class="flex items-center gap-1" on:mouseleave={handleMouseLeave}>
    {#each Array(5) as _, i}
      <div
        class="relative {sizeClasses[size]} {disabled
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer'}"
      >
        <!-- Left half button (for 0.5 increment) -->
        {#if !disabled}
          <button
            type="button"
            class="absolute left-0 top-0 w-1/2 h-full z-10 hover:scale-110 transition-transform"
            on:click={() => handleStarClick(i + 0.5)}
            on:mouseenter={() => handleStarHover(i + 0.5)}
            aria-label="Rate {i + 0.5} stars"
          />
        {/if}

        <!-- Right half button (for full star) -->
        {#if !disabled}
          <button
            type="button"
            class="absolute right-0 top-0 w-1/2 h-full z-10 hover:scale-110 transition-transform"
            on:click={() => handleStarClick(i + 1)}
            on:mouseenter={() => handleStarHover(i + 1)}
            aria-label="Rate {i + 1} stars"
          />
        {/if}

        <!-- Star visual -->
        {#if getStarFill(i) === 100}
          <!-- Full star -->
          <svg
            class="{sizeClasses[size]} pointer-events-none"
            viewBox="0 0 24 24"
          >
            <path
              fill="#FBBF24"
              stroke="#F59E0B"
              stroke-width="1"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        {:else if getStarFill(i) === 50}
          <!-- Half star -->
          <svg
            class="{sizeClasses[size]} pointer-events-none"
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient id="half-star-{i}">
                <stop offset="50%" stop-color="#FBBF24" />
                <stop offset="50%" stop-color="#E5E7EB" />
              </linearGradient>
            </defs>
            <path
              fill="url(#half-star-{i})"
              stroke="#F59E0B"
              stroke-width="1"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        {:else}
          <!-- Empty star -->
          <svg
            class="{sizeClasses[size]} pointer-events-none"
            viewBox="0 0 24 24"
          >
            <path
              fill="#E5E7EB"
              stroke="#F59E0B"
              stroke-width="1"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        {/if}
      </div>
    {/each}
  </div>

  <span class="text-gray-700 font-medium text-lg">
    {displayRating.toFixed(1)}
  </span>
</div>
