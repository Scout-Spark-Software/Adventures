<script lang="ts">
  import { TrendingUp, Triangle, Heart, PenLine, Search } from "lucide-svelte";

  export let title: string;
  export let description: string | undefined = undefined;
  export let iconName: "hike" | "camping" | "favorite" | "note" | "search" | undefined = undefined;
  export let actionText: string | undefined = undefined;
  export let actionHref: string | undefined = undefined;

  const icons = {
    hike: TrendingUp,
    camping: Triangle,
    favorite: Heart,
    note: PenLine,
    search: Search,
  };
</script>

<div class="text-center py-12 bg-white rounded-lg shadow-sm">
  {#if $$slots.icon}
    <slot name="icon" />
  {:else if iconName}
    <svelte:component this={icons[iconName]} size={64} class="mx-auto text-gray-300 mb-4" />
  {/if}

  <p class="text-gray-500 text-lg font-medium mb-2">{title}</p>

  {#if description}
    <p class="text-gray-400 text-sm mb-4">{description}</p>
  {/if}

  {#if $$slots.actions}
    <div class="mt-4">
      <slot name="actions" />
    </div>
  {:else if actionText && actionHref}
    <a
      href={actionHref}
      class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm mt-4"
    >
      {actionText}
    </a>
  {/if}
</div>
