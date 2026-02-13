<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let variant: "success" | "error" | "warning" | "info" = "info";
  export let title: string | undefined = undefined;
  export let message: string;
  export let dismissible: boolean = false;

  const dispatch = createEventDispatcher();

  const variantClasses = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const iconPaths = {
    success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    warning:
      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  function handleDismiss() {
    dispatch("dismiss");
  }
</script>

<div class="rounded-md border p-4 {variantClasses[variant]}">
  <div class="flex items-start gap-3">
    <svg
      class="w-5 h-5 flex-shrink-0 mt-0.5 {iconColors[variant]}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d={iconPaths[variant]}
      />
    </svg>

    <div class="flex-1">
      {#if title}
        <h3 class="text-sm font-medium mb-1">{title}</h3>
      {/if}
      <p class="text-sm {title ? '' : 'font-medium'}">{message}</p>
    </div>

    {#if dismissible}
      <button
        type="button"
        class="flex-shrink-0 text-gray-400 hover:text-gray-600"
        on:click={handleDismiss}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    {/if}
  </div>
</div>
