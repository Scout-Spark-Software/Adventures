<script lang="ts">
  import { navigating } from "$app/stores";

  export let size: "sm" | "md" | "lg" = "md";
  export let color: string = "currentColor";
  export let text: string | undefined = undefined;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  function labelFromPath(pathname: string | null | undefined): string {
    if (!pathname) return text ?? "Loading...";
    if (pathname.startsWith("/hikes")) return "Loading hikes...";
    if (pathname.startsWith("/backpacking")) return "Loading backpacking...";
    if (pathname.startsWith("/camping")) return "Loading camping sites...";
    if (pathname.startsWith("/favorites")) return "Loading favorites...";
    if (pathname.startsWith("/submit")) return "Loading submit form...";
    if (pathname.startsWith("/admin")) return "Loading admin...";
    if (pathname.startsWith("/essentials")) return "Loading essentials...";
    return "Loading...";
  }

  // Read destination from the store reactively — also accept an explicit
  // `destination` prop so a parent can pass $navigating.to?.url.pathname
  // directly, avoiding any child-mount timing issues.
  export let destination: string | null | undefined = undefined;

  $: destinationLabel = labelFromPath(destination ?? $navigating?.to?.url?.pathname);
</script>

{#if size === "lg"}
  <div class="flex flex-col items-center gap-3">
    <div class="trail-row">
      <span class="boot">🥾</span>
      <span class="dot dot1"></span>
      <span class="dot dot2"></span>
      <span class="dot dot3"></span>
    </div>
    <span class="text-sm font-medium text-gray-500">{destinationLabel}</span>
  </div>
{:else}
  <div class="inline-flex items-center gap-2">
    <svg
      class="animate-spin {sizeClasses[size]}"
      fill="none"
      viewBox="0 0 24 24"
      style="color: {color}"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
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
{/if}

<style>
  .trail-row {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    height: 48px;
  }

  .boot {
    font-size: 2rem;
    line-height: 1;
    animation: trailbounce 0.8s ease-in-out infinite;
  }

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: dotpop 0.8s ease-in-out infinite;
  }

  .dot1 {
    background-color: #6ee7b7;
    animation-delay: 0.1s;
  }
  .dot2 {
    background-color: #10b981;
    animation-delay: 0.25s;
  }
  .dot3 {
    background-color: #059669;
    animation-delay: 0.4s;
  }

  @keyframes trailbounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-14px);
    }
  }

  @keyframes dotpop {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.35;
    }
    50% {
      transform: scale(1.5);
      opacity: 1;
    }
  }
</style>
