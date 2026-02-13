<script lang="ts">
  import { fade } from "svelte/transition";
  import { Info } from "lucide-svelte";

  export let text: string;
  export let position: "top" | "bottom" | "left" | "right" = "top";

  let showTooltip = false;
</script>

<span class="relative inline-flex items-center">
  <button
    type="button"
    class="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
    on:mouseenter={() => (showTooltip = true)}
    on:mouseleave={() => (showTooltip = false)}
    on:focus={() => (showTooltip = true)}
    on:blur={() => (showTooltip = false)}
    aria-label={text}
  >
    <Info size={16} />
  </button>

  {#if showTooltip}
    <div
      transition:fade={{ duration: 150 }}
      class="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg max-w-xs {position ===
        'top' || position === 'bottom'
        ? 'left-1/2 -translate-x-1/2'
        : ''}"
      class:bottom-full={position === "top"}
      class:top-full={position === "bottom"}
      class:right-full={position === "left"}
      class:left-full={position === "right"}
      class:mb-2={position === "top"}
      class:mt-2={position === "bottom"}
      class:mr-2={position === "left"}
      class:ml-2={position === "right"}
    >
      {text}
      <div
        class="absolute w-2 h-2 bg-gray-900 transform rotate-45 {position ===
          'top' || position === 'bottom'
          ? 'left-1/2 -translate-x-1/2'
          : ''}"
        class:bottom-0={position === "top"}
        class:top-0={position === "bottom"}
        class:-mb-1={position === "top"}
        class:-mt-1={position === "bottom"}
      />
    </div>
  {/if}
</span>
