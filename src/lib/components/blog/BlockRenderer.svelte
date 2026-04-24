<script context="module" lang="ts">
  export interface Block {
    type: string;
    data: Record<string, unknown>;
  }
</script>

<script lang="ts">
  import ListItems from "./ListItems.svelte";
  export let blocks: Block[];

  function externalLinks(node: HTMLElement) {
    function patch() {
      node.querySelectorAll("a").forEach((a) => {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.classList.add("blog-link");
      });
    }
    patch();
    const observer = new MutationObserver(patch);
    observer.observe(node, { childList: true, subtree: true });
    return { destroy: () => observer.disconnect() };
  }

  function headingId(text: string): string {
    return String(text)
      .replace(/<[^>]+>/g, "")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }
</script>

<div use:externalLinks>
{#each blocks as block}
  {#if block.type === "paragraph"}
    <p class="mb-4 text-stone-800 leading-relaxed">{@html block.data.text}</p>
  {:else if block.type === "header"}
    {@const id = headingId(String(block.data.text))}
    {@const level = Number(block.data.level) || 2}
    {#if level === 1}
      <h1 {id} class="text-3xl font-extrabold text-stone-900 mt-12 mb-4 scroll-mt-20">{@html block.data.text}</h1>
    {:else if level === 2}
      <h2 {id} class="text-2xl font-bold text-stone-900 mt-10 mb-4 scroll-mt-20">{@html block.data.text}</h2>
    {:else if level === 3}
      <h3 {id} class="text-xl font-bold text-stone-900 mt-8 mb-3 scroll-mt-20">{@html block.data.text}</h3>
    {:else if level === 4}
      <h4 {id} class="text-lg font-semibold text-stone-900 mt-6 mb-2 scroll-mt-20">{@html block.data.text}</h4>
    {/if}
  {:else if block.type === "list"}
    {#if block.data.style === "ordered"}
      <ol class="list-decimal list-outside pl-6 mb-4 space-y-1 text-stone-800">
        <ListItems items={block.data.items as unknown[]} style="ordered" />
      </ol>
    {:else if block.data.style === "checklist"}
      <ul class="mb-4 space-y-2">
        <ListItems items={block.data.items as unknown[]} style="checklist" />
      </ul>
    {:else}
      <ul class="list-disc list-outside pl-6 mb-4 space-y-1 text-stone-800">
        <ListItems items={block.data.items as unknown[]} style="unordered" />
      </ul>
    {/if}
  {:else if block.type === "image"}
    {@const file = block.data.file as { url: string } | undefined}
    {@const stretched = block.data.stretched === true}
    {@const withBorder = block.data.withBorder === true}
    <figure class="my-8 {stretched ? '-mx-4 sm:-mx-8 md:-mx-16' : ''}">
      <img
        src={file?.url ?? String(block.data.url ?? "")}
        alt={String(block.data.caption ?? "")}
        class="w-full rounded-lg object-cover {withBorder ? 'border-2 border-stone-300' : 'border border-stone-100'}"
      />
      {#if block.data.caption}
        <figcaption class="mt-2 text-center text-sm text-stone-500 italic">{block.data.caption}</figcaption>
      {/if}
    </figure>
  {:else if block.type === "quote"}
    <blockquote class="my-6 border-l-4 border-emerald-500 pl-5 py-1">
      <p class="text-stone-700 italic text-lg leading-relaxed">{@html block.data.text}</p>
      {#if block.data.caption}
        <cite class="block mt-2 text-sm text-stone-500 not-italic">— {block.data.caption}</cite>
      {/if}
    </blockquote>
  {:else if block.type === "code"}
    <pre class="my-6 bg-stone-900 text-stone-100 rounded-lg px-5 py-4 overflow-x-auto text-sm font-mono leading-relaxed"><code>{block.data.code}</code></pre>
  {:else if block.type === "delimiter"}
    <hr class="my-10 border-stone-200" />
  {/if}
{/each}
</div>

<style>
  :global(.blog-link) {
    color: #059669;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  :global(.blog-link:hover) {
    color: #047857;
  }
</style>
