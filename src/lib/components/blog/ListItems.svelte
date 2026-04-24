<script lang="ts">
  import ListItems from "./ListItems.svelte";

  export let items: unknown[];
  export let style: string;

  interface ListItem {
    content?: string;
    items?: unknown[];
    meta?: { checked?: boolean };
  }

  function toItem(raw: unknown): ListItem {
    if (typeof raw === "string") return { content: raw };
    return (raw as ListItem) ?? {};
  }
</script>

{#each items as raw}
  {@const item = toItem(raw)}
  {#if style === "checklist"}
    <li class="flex items-start gap-2.5 text-stone-800">
      <span class="mt-0.5 flex-shrink-0 w-4 h-4 rounded border {item.meta?.checked ? 'bg-emerald-500 border-emerald-500' : 'border-stone-400'} flex items-center justify-center">
        {#if item.meta?.checked}
          <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        {/if}
      </span>
      <span class={item.meta?.checked ? "line-through text-stone-400" : ""}>{@html item.content ?? ""}</span>
    </li>
  {:else}
    <li>
      {@html item.content ?? ""}
      {#if item.items && item.items.length > 0}
        {#if style === "ordered"}
          <ol class="list-decimal list-outside pl-5 mt-1 space-y-1">
            <ListItems items={item.items} {style} />
          </ol>
        {:else}
          <ul class="list-disc list-outside pl-5 mt-1 space-y-1">
            <ListItems items={item.items} {style} />
          </ul>
        {/if}
      {/if}
    </li>
  {/if}
{/each}
