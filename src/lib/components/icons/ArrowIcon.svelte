<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' | number = 'md';
  export let ariaLabel: string = 'Arrow';
  export let direction: 'up' | 'down' | 'left' | 'right' = 'up';

  const sizeMap = {
    sm: 4,
    md: 5,
    lg: 6
  };

  $: sizeValue = typeof size === 'number' ? size : sizeMap[size];

  const paths = {
    up: 'M5 10l7-7m0 0l7 7m-7-7v18',
    down: 'M19 14l-7 7m0 0l-7-7m7 7V3',
    left: 'M10 19l-7-7m0 0l7-7m-7 7h18',
    right: 'M14 5l7 7m0 0l-7 7m7-7H3'
  };
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
    d={paths[direction]}
  />
</svg>
