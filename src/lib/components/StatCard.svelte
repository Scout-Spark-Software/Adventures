<script lang="ts">
  import type { Snippet } from "svelte";
  export let label: string;
  export let value: string | number;
  export let subtitle: string | undefined = undefined;
  export let variant: "default" | "glass" = "default";
  // Svelte 5: declare children snippet type to avoid type errors when slot content is passed
  export const children: Snippet | undefined = undefined;

  const variantClasses = {
    default: "bg-white rounded-lg px-4 py-2 shadow-md",
    glass: "bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg",
  };
</script>

<div class={variantClasses[variant]}>
  <div class="flex items-center gap-2">
    {#if $$slots.icon}
      <div class="text-indigo-600">
        <slot name="icon" />
      </div>
    {/if}

    <div>
      <div class="text-xs text-gray-500">{label}</div>

      {#if $$slots.value}
        <slot name="value" />
      {:else}
        <div class="font-semibold text-gray-900">{value}</div>
      {/if}

      {#if subtitle}
        <div class="text-xs text-gray-400">{subtitle}</div>
      {/if}
    </div>
  </div>
</div>
