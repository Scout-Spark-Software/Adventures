<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' | number = 'md';
  export let ariaLabel: string = 'Map';

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
    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
  />
</svg>
