<script lang="ts">
  import LoadingSpinner from "./LoadingSpinner.svelte";

  export let variant: "primary" | "secondary" | "danger" | "ghost" | "gradient" = "primary";
  export let size: "sm" | "md" | "lg" = "md";
  export let loading: boolean = false;
  export let disabled: boolean = false;
  export let href: string | undefined = undefined;
  export let type: "button" | "submit" | "reset" = "button";
  export let fullWidth: boolean = false;

  const variantClasses = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    ghost: "text-gray-700 hover:bg-gray-100",
    gradient:
      "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-sm",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  $: classes = `inline-flex items-center justify-center gap-2 rounded-lg transition-colors font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}`;

  $: isDisabled = disabled || loading;
</script>

{#if href && !isDisabled}
  <a {href} class={classes}>
    <slot name="icon-left" />
    {#if loading}
      <LoadingSpinner size="sm" />
    {/if}
    <slot />
    <slot name="icon-right" />
  </a>
{:else}
  <button {type} class={classes} disabled={isDisabled} on:click>
    <slot name="icon-left" />
    {#if loading}
      <LoadingSpinner size="sm" />
    {/if}
    <slot />
    <slot name="icon-right" />
  </button>
{/if}
