<script lang="ts">
  import { BookOpen } from "lucide-svelte";
  import type { PageData } from "./$types";
  export let data: PageData;

  $: posts = data.posts;
  $: totalPages = Math.ceil(data.total / data.pageSize);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
</script>

<svelte:head>
  <title>Blog - Adventure Spark</title>
  <meta
    name="description"
    content="Stories, guides, and adventures from the Adventure Spark team."
  />
</svelte:head>

<div class="min-h-screen pt-16 pb-16 bg-white">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    {#if posts.length === 0 && !data.isAdmin}
      <div class="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center">
        <!-- Icon -->
        <div
          class="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mb-8"
        >
          <BookOpen size={26} class="text-indigo-500" />
        </div>

        <!-- Text -->
        <h1 class="text-3xl font-bold text-stone-900 mb-4 tracking-tight">Coming Soon</h1>
        <p class="text-stone-500 text-sm max-w-xs leading-relaxed">
          Stories, guides, and adventures from the Adventure Spark team — check back soon.
        </p>
      </div>
    {:else}
      <h1 class="text-3xl font-bold text-stone-900 mb-10">Blog</h1>
      {#if posts.length === 0}
        <p class="text-stone-400 text-sm">No posts yet.</p>
      {:else}
        <div class="space-y-10">
          {#each posts as post (post.slug)}
            <article class="border-b border-stone-200 pb-10 {post.featured ? 'pl-4 border-l-2 border-l-emerald-500 bg-emerald-50/40 rounded-r-lg -ml-4 pr-4 pt-4' : ''}">
              <div class="flex items-center gap-3 mb-2 flex-wrap">
                <p class="text-xs text-stone-400">
                  {post.publishedAt ? formatDate(post.publishedAt) : "Unpublished"}
                </p>
                {#if post.featured}
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200"
                  >
                    Featured
                  </span>
                {/if}
                {#if post.status === "draft"}
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"
                  >
                    Draft
                  </span>
                {/if}
                {#if post.seriesName}
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200"
                  >
                    {post.seriesName} · Part {post.seriesOrder}
                  </span>
                {/if}
              </div>
              <h2 class="text-xl font-bold text-stone-900 mb-3">
                <a href="/blog/{post.slug}" class="hover:text-emerald-600 transition-colors">
                  {post.title}
                </a>
              </h2>
              {#if post.excerpt}
                <p class="text-stone-500 text-sm leading-relaxed">{post.excerpt}</p>
              {/if}
              <a
                href="/blog/{post.slug}"
                class="inline-block mt-4 text-sm text-emerald-600 hover:underline"
              >
                Read more →
              </a>
            </article>
          {/each}
        </div>

        {#if totalPages > 1}
          <div class="flex gap-2 mt-12 justify-center">
            {#if data.page > 1}
              <a
                href="?page={data.page - 1}"
                class="px-4 py-2 bg-stone-100 border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-200 transition-colors"
              >
                ← Prev
              </a>
            {/if}
            {#if data.page < totalPages}
              <a
                href="?page={data.page + 1}"
                class="px-4 py-2 bg-stone-100 border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-200 transition-colors"
              >
                Next →
              </a>
            {/if}
          </div>
        {/if}
      {/if}
    {/if}
  </div>
</div>
