<script lang="ts">
  import type { ComponentType } from "svelte";

  export let title: string;
  export let icon: ComponentType | undefined = undefined;
  export let description: string = "";
</script>

<div
  class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
>
  <div
    class="bg-gradient-to-r from-indigo-50 to-white px-5 py-3 border-b border-gray-200"
  >
    <div class="flex items-center gap-2">
      {#if icon}
        <div
          class="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <svelte:component this={icon} size={16} class="text-indigo-600" />
        </div>
      {/if}
      <div>
        <h3 class="text-base font-semibold text-gray-900">{title}</h3>
        {#if description}
          <p class="text-xs text-gray-600 mt-0.5">{description}</p>
        {/if}
      </div>
    </div>
  </div>
  <div class="px-5 py-4">
    <slot />
  </div>
</div>
