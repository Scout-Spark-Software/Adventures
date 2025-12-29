<script lang="ts">
  export let averageRating: number | null = null;
  export let totalRatings: number = 0;
  export let clickable: boolean = false;
  export let onRatingClick: (() => void) | undefined = undefined;

  function handleClick() {
    if (clickable && onRatingClick) {
      onRatingClick();
    }
  }
</script>

{#if averageRating !== null && totalRatings > 0}
  <button
    type="button"
    on:click={handleClick}
    disabled={!clickable}
    class="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 {clickable
      ? 'hover:bg-white cursor-pointer'
      : 'cursor-default'} transition-colors"
  >
    <!-- Star Icon -->
    <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
      <path
        d="M10 1l2.5 6.5L19 8l-5 4.5L15.5 19 10 15.5 4.5 19 6 12.5 1 8l6.5-.5L10 1z"
      />
    </svg>

    <!-- Rating Number -->
    <span class="font-semibold text-gray-900">
      {averageRating.toFixed(1)}
    </span>

    <!-- Count -->
    <span class="text-sm text-gray-600">
      ({totalRatings})
    </span>
  </button>
{/if}
