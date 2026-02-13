<script lang="ts">
  export let size: "sm" | "md" | "lg" | number = "md";
  export let ariaLabel: string = "Time";

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
    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
  />
</svg>
