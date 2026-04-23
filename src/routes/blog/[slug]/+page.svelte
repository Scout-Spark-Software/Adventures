<script lang="ts">
  import { page } from "$app/stores";
  import SeriesSidebar from "$lib/components/blog/SeriesSidebar.svelte";
  import TableOfContents from "$lib/components/blog/TableOfContents.svelte";
  import type { PageData } from "./$types";
  export let data: PageData;

  $: post = data.post;
  $: seriesData = data.seriesData;
  $: hasSidebar = (seriesData && seriesData.posts.length > 1) || data.toc.length > 0;

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
</script>

<svelte:head>
  <title>{post.title} - Adventure Spark</title>
  {#if post.excerpt}
    <meta name="description" content={post.excerpt} />
  {/if}
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{post.title} - Adventure Spark" />
  <meta property="og:url" content={$page.url.href} />
  {#if post.excerpt}
    <meta property="og:description" content={post.excerpt} />
  {/if}
  {#if post.coverImageUrl}
    <meta property="og:image" content={post.coverImageUrl} />
    <meta name="twitter:card" content="summary_large_image" />
  {:else}
    <meta name="twitter:card" content="summary" />
  {/if}
</svelte:head>

<div class="min-h-screen pt-16 pb-16 bg-white">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <a
      href="/blog"
      class="text-sm text-stone-400 hover:text-stone-700 mb-8 inline-block transition-colors"
    >
      ← Back to Blog
    </a>

    <div class="flex flex-col lg:flex-row gap-10">
      <!-- Main content -->
      <article class="flex-1 min-w-0">
        {#if seriesData}
          <p class="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">
            {seriesData.series.name} · Part {post.seriesOrder}
          </p>
        {/if}
        <div class="flex items-center gap-3 text-xs mb-3 flex-wrap">
          {#if post.status === "draft"}
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
              Draft
            </span>
          {/if}
          <span class="text-stone-400">{post.publishedAt ? formatDate(post.publishedAt) : "Unpublished"}</span>
          {#if data.authorName}
            <span class="text-stone-300">·</span>
            <span class="text-stone-400">{data.authorName}</span>
          {/if}
        </div>
        <h1 class="text-3xl font-bold text-stone-900 mb-8">{post.title}</h1>
        {#if post.coverImageUrl}
          <img
            src={post.coverImageUrl}
            alt=""
            class="w-full rounded-xl object-cover max-h-80 mb-8 border border-stone-100"
          />
        {/if}
        <div class="prose prose-stone max-w-none">
          {@html data.content}
        </div>
      </article>

      <!-- Sidebar: series nav + table of contents -->
      {#if hasSidebar}
        <aside class="lg:w-56 shrink-0">
          <div class="lg:sticky lg:top-24 flex flex-col gap-6">
            {#if seriesData && seriesData.posts.length > 1}
              <SeriesSidebar
                seriesName={seriesData.series.name}
                seriesPosts={seriesData.posts}
                currentSlug={post.slug}
              />
            {/if}
            {#if data.toc.length > 0}
              <div class="bg-stone-50 border border-stone-200 rounded-xl p-5">
                <TableOfContents toc={data.toc} />
              </div>
            {/if}
          </div>
        </aside>
      {/if}
    </div>
  </div>
</div>

<style>
  :global(.prose h2, .prose h3, .prose h4) {
    scroll-margin-top: 6rem;
  }
  :global(.prose img) {
    border-radius: 0.75rem;
  }
</style>
