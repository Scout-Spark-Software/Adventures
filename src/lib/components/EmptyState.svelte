<script lang="ts">
  export let title: string;
  export let description: string | undefined = undefined;
  export let iconName: 'hike' | 'camping' | 'favorite' | 'note' | 'search' | undefined = undefined;
  export let actionText: string | undefined = undefined;
  export let actionHref: string | undefined = undefined;

  const icons = {
    hike: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    camping: 'M12 3L3 21h18L12 3z',
    favorite: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    note: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
  };
</script>

<div class="text-center py-12 bg-white rounded-lg shadow-sm">
  {#if $$slots.icon}
    <slot name="icon" />
  {:else if iconName}
    <svg
      class="w-16 h-16 mx-auto text-gray-300 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d={icons[iconName]}
      />
    </svg>
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
