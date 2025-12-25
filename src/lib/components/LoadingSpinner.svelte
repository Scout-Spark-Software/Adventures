<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let color: string = 'currentColor';
  export let text: string | undefined = undefined;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
</script>

<div class="inline-flex items-center gap-2">
  <svg
    class="animate-spin {sizeClasses[size]}"
    fill="none"
    viewBox="0 0 24 24"
    style="color: {color}"
  >
    <circle
      class="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
    />
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
  {#if text}
    <span class="text-sm text-gray-600">{text}</span>
  {/if}
</div>
