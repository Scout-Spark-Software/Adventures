<script lang="ts">
  export let size: "sm" | "md" | "lg" | number = "md";
  export let ariaLabel: string = "Search";

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
    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
  />
</svg>
