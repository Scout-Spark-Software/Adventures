<script lang="ts">
  import SeriesSidebar from "$lib/components/blog/SeriesSidebar.svelte";
  import type { PageData } from "./$types";
  export let data: PageData;

  $: post = data.post;
  $: seriesData = data.seriesData;

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
        <div class="prose prose-stone max-w-none">
          {@html data.content}
        </div>
      </article>

      <!-- Series sidebar -->
      {#if seriesData && seriesData.posts.length > 1}
        <aside class="lg:w-64 shrink-0">
          <div class="lg:sticky lg:top-8">
            <SeriesSidebar
              seriesName={seriesData.series.name}
              seriesPosts={seriesData.posts}
              currentSlug={post.slug}
            />
          </div>
        </aside>
      {/if}
    </div>
  </div>
</div>
