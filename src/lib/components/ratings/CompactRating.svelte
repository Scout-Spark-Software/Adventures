<script lang="ts">
  export let averageRating: number | null;
  export let totalRatings: number = 0;
  export let clickable: boolean = false;
  export let onRatingClick: (() => void) | null = null;

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
    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg transition-colors {clickable
      ? 'hover:bg-white cursor-pointer'
      : 'cursor-default'}"
  >
    <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
      <path
        d="M10 1l2.5 6.5L19 8l-5 4.5L15.5 19 10 15.5 4.5 19 6 12.5 1 8l6.5-.5L10 1z"
      />
    </svg>
    <span class="font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
    <span class="text-gray-600">({totalRatings})</span>
  </button>
{/if}
