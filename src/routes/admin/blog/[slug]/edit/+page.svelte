<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  export let data: PageData;

  let title = "";
  let excerpt = "";
  let body = "";
  let status = "draft";
  let scheduledAt = "";
  let featured = false;
  let seriesId = "";
  let seriesOrder = "";
  let coverImageUrl = "";
  let coverUploading = false;
  let inlineImageUploading = false;
  let saving = false;
  let deleting = false;
  let errorMsg = "";
  let renderedPreview = "";

  // Split-pane scroll sync
  let editorEl: HTMLTextAreaElement;
  let previewEl: HTMLDivElement;
  let syncing = false;

  function onEditorScroll() {
    if (syncing) return;
    syncing = true;
    requestAnimationFrame(() => {
      if (editorEl && previewEl) {
        const ratio =
          editorEl.scrollTop / Math.max(1, editorEl.scrollHeight - editorEl.clientHeight);
        previewEl.scrollTop = ratio * Math.max(0, previewEl.scrollHeight - previewEl.clientHeight);
      }
      syncing = false;
    });
  }

  function onPreviewScroll() {
    if (syncing) return;
    syncing = true;
    requestAnimationFrame(() => {
      if (editorEl && previewEl) {
        const ratio =
          previewEl.scrollTop / Math.max(1, previewEl.scrollHeight - previewEl.clientHeight);
        editorEl.scrollTop = ratio * Math.max(0, editorEl.scrollHeight - editorEl.clientHeight);
      }
      syncing = false;
    });
  }

  // Reactive preview — update on every body change
  $: if (body !== undefined) {
    import("marked").then(({ marked }) => {
      Promise.resolve(marked(body)).then((html) => {
        renderedPreview = html as string;
      });
    });
  }

  onMount(() => {
    const p = data.post;
    title = p.title;
    excerpt = p.excerpt ?? "";
    body = p.body;
    status = p.status;
    featured = p.featured;
    seriesId = p.seriesId ?? "";
    seriesOrder = p.seriesOrder != null ? String(p.seriesOrder) : "";
    coverImageUrl = p.coverImageUrl ?? "";
    if (p.scheduledAt) {
      scheduledAt = new Date(p.scheduledAt).toISOString().slice(0, 16);
    }
  });

  async function onSeriesChange() {
    if (!seriesId || seriesId === data.post.seriesId) {
      seriesOrder = data.post.seriesId === seriesId ? String(data.post.seriesOrder ?? "") : "";
      return;
    }
    seriesOrder = "";
    const found = data.allSeries.find((s: any) => s.id === seriesId);
    if (!found) return;
    const res = await fetch(`/api/series/${found.slug}`);
    if (res.ok) {
      const sd = await res.json();
      const maxOrder = sd.posts.reduce((m: number, p: any) => Math.max(m, p.seriesOrder ?? 0), 0);
      seriesOrder = String(maxOrder + 1);
    }
  }

  async function onInlineImageChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    inlineImageUploading = true;
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("postId", data.post.id);
      const res = await fetch("/api/posts/cover", { method: "POST", body: fd });
      if (res.ok) {
        const d = await res.json();
        const md = `![image](${d.url})`;
        const start = editorEl.selectionStart ?? body.length;
        const end = editorEl.selectionEnd ?? body.length;
        body = body.slice(0, start) + md + body.slice(end);
        requestAnimationFrame(() => {
          editorEl.selectionStart = editorEl.selectionEnd = start + md.length;
          editorEl.focus();
        });
      } else {
        errorMsg = "Failed to upload image";
      }
    } catch {
      errorMsg = "Failed to upload image";
    } finally {
      inlineImageUploading = false;
      input.value = "";
    }
  }

  async function onCoverFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    coverUploading = true;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("postId", data.post.id);
    const res = await fetch("/api/posts/cover", { method: "POST", body: fd });
    coverUploading = false;
    if (res.ok) {
      const d = await res.json();
      coverImageUrl = d.url;
    } else {
      errorMsg = "Failed to upload cover image";
    }
    input.value = "";
  }

  async function save() {
    if (!title.trim()) { errorMsg = "Title is required"; return; }
    if (!body.trim()) { errorMsg = "Body is required"; return; }
    if (status === "scheduled" && !scheduledAt) { errorMsg = "Schedule date is required"; return; }
    errorMsg = "";
    saving = true;

    const res = await fetch(`/api/posts/${data.post.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        excerpt: excerpt || null,
        postBody: body,
        status,
        scheduledAt: scheduledAt || null,
        featured,
        seriesId: seriesId || null,
        seriesOrder: seriesOrder || null,
        coverImageUrl: coverImageUrl || null,
      }),
    });

    saving = false;
    if (res.ok) {
      goto("/admin/blog");
    } else {
      const d = await res.json().catch(() => ({}));
      errorMsg = d.message ?? "Failed to save post";
    }
  }

  async function deletePost() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    deleting = true;
    const res = await fetch(`/api/posts/${data.post.slug}`, { method: "DELETE" });
    deleting = false;
    if (res.ok) {
      goto("/admin/blog");
    } else {
      errorMsg = "Failed to delete post";
    }
  }
</script>

<svelte:head>
  <title>Edit: {data.post.title} - Admin</title>
</svelte:head>

<div class="grain"></div>

<div class="relative z-10 min-h-screen pt-16 pb-16">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center gap-3 mb-8">
      <a href="/admin/blog" class="text-sm text-stone-500 hover:text-stone-300 transition-colors">
        ← Blog
      </a>
      <span class="text-stone-700">/</span>
      <h1 class="text-xl font-bold text-stone-100">Edit Post</h1>
    </div>

    {#if errorMsg}
      <div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        {errorMsg}
      </div>
    {/if}

    <div class="space-y-5">
      <!-- Title -->
      <div>
        <label class="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2" for="title">
          Title
        </label>
        <input
          id="title"
          type="text"
          bind:value={title}
          class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
      </div>

      <!-- Excerpt + settings sidebar -->
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <!-- Excerpt -->
        <div class="lg:col-span-3 flex flex-col">
          <label class="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2" for="excerpt">
            Excerpt <span class="text-stone-600 normal-case font-normal">(optional)</span>
          </label>
          <textarea
            id="excerpt"
            bind:value={excerpt}
            class="flex-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 resize-none transition-colors"
            placeholder="Short summary shown in listings…"
          ></textarea>
        </div>

        <!-- Settings sidebar -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Status -->
          <div>
            <label class="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2" for="status">
              Status
            </label>
            <select
              id="status"
              bind:value={status}
              class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-stone-100 focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {#if status === "scheduled"}
            <div>
              <label class="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2" for="scheduledAt">
                Publish at
              </label>
              <input
                id="scheduledAt"
                type="datetime-local"
                bind:value={scheduledAt}
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-stone-100 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          {/if}

          {#if data.allSeries.length > 0}
            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <label class="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2" for="series">
                  Series
                </label>
                <select
                  id="series"
                  bind:value={seriesId}
                  on:change={onSeriesChange}
                  class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-stone-100 focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  <option value="">None</option>
                  {#each data.allSeries as s}
                    <option value={s.id}>{s.name}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2" for="seriesOrder">
                  Part #
                </label>
                <input
                  id="seriesOrder"
                  type="number"
                  min="1"
                  bind:value={seriesOrder}
                  disabled={!seriesId}
                  class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-stone-100 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-30"
                  placeholder="Auto"
                />
              </div>
            </div>
          {/if}

          <!-- Featured -->
          <label class="flex items-center gap-3 cursor-pointer pt-1">
            <input
              type="checkbox"
              bind:checked={featured}
              class="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500"
            />
            <span class="text-sm text-stone-300">Featured post</span>
          </label>

          <!-- Cover image -->
          <div>
            <span class="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Cover Image
            </span>
            {#if coverImageUrl}
              <div class="relative rounded-lg overflow-hidden border border-white/10">
                <img src={coverImageUrl} alt="Cover" class="w-full h-32 object-cover" />
                <div class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label class="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded cursor-pointer transition-colors">
                    Change
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" on:change={onCoverFileChange} class="sr-only" />
                  </label>
                  <button
                    type="button"
                    on:click={() => (coverImageUrl = "")}
                    class="px-3 py-1.5 bg-red-500/50 hover:bg-red-500/70 text-white text-xs font-semibold rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            {:else}
              <label class="flex flex-col items-center justify-center gap-2 h-32 border border-dashed border-white/15 rounded-lg cursor-pointer hover:border-emerald-500/40 hover:bg-white/[0.02] transition-colors {coverUploading ? 'opacity-50 pointer-events-none' : ''}">
                {#if coverUploading}
                  <span class="text-xs text-stone-500">Uploading…</span>
                {:else}
                  <svg class="w-6 h-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-xs text-stone-500">Add cover image</span>
                {/if}
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" on:change={onCoverFileChange} class="sr-only" />
              </label>
            {/if}
          </div>
        </div>
      </div>

      <!-- Body — split pane editor -->
      <div>
        <label class="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2" for="body">
          Body <span class="text-stone-600 normal-case font-normal">(Markdown)</span>
        </label>
        <div class="border border-white/10 rounded-lg overflow-hidden">
          <!-- Panel headers -->
          <div class="grid grid-cols-2 border-b border-white/10">
            <div class="px-4 py-2 border-r border-white/10 bg-white/[0.03] flex items-center justify-between">
              <span class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Markdown</span>
              <label class="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 cursor-pointer transition-colors {inlineImageUploading ? 'opacity-50 pointer-events-none' : ''}">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {inlineImageUploading ? "Uploading…" : "Insert image"}
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" on:change={onInlineImageChange} class="sr-only" />
              </label>
            </div>
            <div class="px-4 py-2 bg-white/[0.02]">
              <span class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Preview</span>
            </div>
          </div>
          <!-- Panels -->
          <div class="grid grid-cols-2 h-[600px]">
            <textarea
              id="body"
              bind:this={editorEl}
              bind:value={body}
              on:scroll={onEditorScroll}
              class="font-mono text-sm bg-white/5 border-r border-white/10 px-4 py-4 text-stone-100 placeholder-stone-600 focus:outline-none resize-none overflow-y-auto leading-relaxed"
              placeholder="Write in Markdown…"
            ></textarea>
            <div
              bind:this={previewEl}
              on:scroll={onPreviewScroll}
              class="overflow-y-auto px-4 py-4 bg-white/[0.02]"
            >
              {#if renderedPreview}
                <div class="prose prose-invert prose-stone max-w-none">
                  {@html renderedPreview}
                </div>
              {:else}
                <p class="text-stone-600 text-sm italic">Start writing to see the preview…</p>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-2">
        <div class="flex gap-3">
          <button
            on:click={save}
            disabled={saving}
            class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? "Saving…" : "Save Post"}
          </button>
          <a
            href="/admin/blog"
            class="px-6 py-2.5 bg-white/5 border border-white/10 text-stone-300 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </a>
        </div>
        <button
          on:click={deletePost}
          disabled={deleting}
          class="px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
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
