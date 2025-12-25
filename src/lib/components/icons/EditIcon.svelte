<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' | number = 'md';
  export let ariaLabel: string = 'Edit';

  const sizeMap = {
    sm: 4,
    md: 5,
    lg: 6
  };

  $: sizeValue = typeof size === 'number' ? size : sizeMap[size];
</script>

<svg
  class="w-{sizeValue} h-{sizeValue}"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
  aria-label={ariaLabel}
>
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
  />
</svg>
