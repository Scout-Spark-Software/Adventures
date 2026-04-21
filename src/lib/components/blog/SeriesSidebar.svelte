<script lang="ts">
  export let seriesName: string;
  export let seriesPosts: Array<{
    slug: string;
    title: string;
    seriesOrder: number | null;
    status: string;
    publishedAt: string | null;
  }>;
  export let currentSlug: string;

  $: currentIndex = seriesPosts.findIndex((p) => p.slug === currentSlug);
  $: prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  $: nextPost = currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null;
</script>

<aside class="bg-stone-50 border border-stone-200 rounded-xl p-5">
  <p class="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">Series</p>
  <p class="text-sm font-bold text-stone-900 mb-4">{seriesName}</p>

  <ol class="space-y-1">
    {#each seriesPosts as post}
      {@const isCurrent = post.slug === currentSlug}
      <li>
        {#if isCurrent}
          <span
            class="flex items-start gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200"
          >
            <span class="text-xs text-emerald-600 mt-0.5 shrink-0 tabular-nums w-4">
              {post.seriesOrder ?? "·"}
            </span>
            <span class="text-xs font-semibold text-emerald-700 leading-snug">{post.title}</span>
          </span>
        {:else}
          <a
            href="/blog/{post.slug}"
            class="flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors group"
          >
            <span class="text-xs text-stone-400 mt-0.5 shrink-0 tabular-nums w-4 group-hover:text-stone-600">
              {post.seriesOrder ?? "·"}
            </span>
            <span class="text-xs text-stone-500 leading-snug group-hover:text-stone-800 transition-colors">
              {post.title}
            </span>
          </a>
        {/if}
      </li>
    {/each}
  </ol>

  {#if prevPost || nextPost}
    <div class="flex items-center justify-between mt-5 pt-4 border-t border-stone-200">
      {#if prevPost}
        <a
          href="/blog/{prevPost.slug}"
          class="flex items-center gap-1 text-xs text-stone-400 hover:text-emerald-600 transition-colors"
        >
          ← Part {prevPost.seriesOrder}
        </a>
      {:else}
        <span></span>
      {/if}
      {#if nextPost}
        <a
          href="/blog/{nextPost.slug}"
          class="flex items-center gap-1 text-xs text-stone-400 hover:text-emerald-600 transition-colors"
        >
          Part {nextPost.seriesOrder} →
        </a>
      {/if}
    </div>
  {/if}
</aside>
