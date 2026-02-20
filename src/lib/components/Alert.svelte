<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    CheckCircle as _CheckCircle,
    XCircle as _XCircle,
    AlertTriangle as _AlertTriangle,
    Info as _Info,
    X as _X,
  } from "lucide-svelte";

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

  const iconComponents = {
    success: _CheckCircle,
    error: _XCircle,
    warning: _AlertTriangle,
    info: _Info,
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
    <svelte:component
      this={iconComponents[variant]}
      size={20}
      class="flex-shrink-0 mt-0.5 {iconColors[variant]}"
    />

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
        <svelte:component this={_X} size={20} />
      </button>
    {/if}
  </div>
</div>
