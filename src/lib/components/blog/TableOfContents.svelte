<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let toc: { id: string; text: string; level: number }[];

  let activeId = toc[0]?.id ?? "";
  let observer: IntersectionObserver;

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeId = entry.target.id;
        }
      },
      // Heading is "active" once it crosses into the top 20% of the viewport
      { rootMargin: "0px 0px -80% 0px", threshold: 0 }
    );

    for (const { id } of toc) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
  });

  onDestroy(() => observer?.disconnect());
</script>

<nav aria-label="Table of contents">
  <p class="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">On this page</p>
  <ol class="space-y-0.5">
    {#each toc as { id, text, level } (id)}
      {@const isActive = id === activeId}
      <li style="padding-left: {(level - 2) * 12}px">
        <a
          href="#{id}"
          class="block py-1 px-2 rounded text-xs leading-snug transition-colors {isActive
            ? 'text-emerald-600 font-semibold bg-emerald-50'
            : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'}"
        >
          {text}
        </a>
      </li>
    {/each}
  </ol>
</nav>
