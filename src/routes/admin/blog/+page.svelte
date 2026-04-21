<script lang="ts">
  import { PenSquare, Plus } from "lucide-svelte";
  import type { PageData } from "./$types";
  export let data: PageData;

  const STATUS_STYLES: Record<string, string> = {
    draft: "bg-stone-500/20 text-stone-300 border-stone-500/30",
    scheduled: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    published: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    archived: "bg-stone-700/20 text-stone-500 border-stone-700/30",
  };

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<svelte:head>
  <title>Blog - Admin</title>
</svelte:head>

<div class="grain"></div>

<div class="relative z-10 min-h-screen pt-16 pb-16">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-stone-100">Blog Posts</h1>
        <p class="text-sm text-stone-400 mt-1">{data.total} post{data.total !== 1 ? "s" : ""}</p>
      </div>
      <div class="flex items-center gap-3">
        <a
          href="/admin/blog/series"
          class="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-stone-300 text-sm font-semibold rounded-lg transition-colors"
        >
          Manage Series
        </a>
        <a
          href="/admin/blog/new"
          class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} /> New Post
        </a>
      </div>
    </div>

    {#if data.posts.length === 0}
      <div class="bg-white/5 border border-white/10 rounded-xl px-6 py-12 text-center">
        <p class="text-stone-400">No posts yet.</p>
        <a href="/admin/blog/new" class="mt-4 inline-block text-sm text-emerald-400 hover:underline">
          Write your first post →
        </a>
      </div>
    {:else}
      <div class="space-y-2">
        {#each data.posts as post}
          <div
            class="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:bg-white/8 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-stone-100 truncate">{post.title}</p>
              <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                <p class="text-xs text-stone-500">
                  {#if post.status === "scheduled"}
                    Publishes {formatDate(post.scheduledAt)}
                  {:else if post.status === "published"}
                    Published {formatDate(post.publishedAt)}
                  {:else}
                    Created {formatDate(post.createdAt)}
                  {/if}
                </p>
                {#if post.seriesName}
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
                    {post.seriesName} · {post.seriesOrder}
                  </span>
                {/if}
              </div>
            </div>

            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border {STATUS_STYLES[post.status]}"
            >
              {post.status}
            </span>

            <a
              href="/admin/blog/{post.slug}/edit"
              class="p-2 text-stone-400 hover:text-emerald-400 transition-colors"
              title="Edit post"
            >
              <PenSquare size={16} />
            </a>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .grain {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }
</style>
