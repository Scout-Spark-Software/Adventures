<script lang="ts">
  export let size: "sm" | "md" | "lg" | number = "md";
  export let ariaLabel: string = "Camping";

  const sizeMap = {
    sm: 4,
    md: 5,
    lg: 6,
  };

  $: sizeValue = typeof size === "number" ? size : sizeMap[size];
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
    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
  />
</svg>
