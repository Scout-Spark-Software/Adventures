<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { Plus, Pencil, Trash2 } from "lucide-svelte";
  import type { PageData } from "./$types";
  export let data: PageData;

  // Inline create form state
  let creating = false;
  let newName = "";
  let newDescription = "";
  let createError = "";
  let saving = false;

  // Inline edit state
  let editingId: string | null = null;
  let editName = "";
  let editDescription = "";
  let editError = "";
  let editSlug = "";

  function startEdit(s: (typeof data.series)[0]) {
    editingId = s.id;
    editSlug = s.slug;
    editName = s.name;
    editDescription = s.description ?? "";
    editError = "";
  }

  function cancelEdit() {
    editingId = null;
  }

  async function createSeries() {
    if (!newName.trim()) {
      createError = "Name is required";
      return;
    }
    createError = "";
    saving = true;
    const res = await fetch("/api/series", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), description: newDescription.trim() || null }),
    });
    saving = false;
    if (res.ok) {
      newName = "";
      newDescription = "";
      creating = false;
      await invalidateAll();
    } else {
      const d = await res.json().catch(() => ({}));
      createError = d.message ?? "Failed to create series";
    }
  }

  async function saveSeries() {
    if (!editName.trim()) {
      editError = "Name is required";
      return;
    }
    editError = "";
    saving = true;
    const res = await fetch(`/api/series/${editSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), description: editDescription.trim() || null }),
    });
    saving = false;
    if (res.ok) {
      editingId = null;
      await invalidateAll();
    } else {
      const d = await res.json().catch(() => ({}));
      editError = d.message ?? "Failed to save";
    }
  }

  async function deleteSeries(slug: string, name: string) {
    if (!confirm(`Delete series "${name}"? Posts will be detached but not deleted.`)) return;
    await fetch(`/api/series/${slug}`, { method: "DELETE" });
    await invalidateAll();
  }
</script>

<svelte:head>
  <title>Series - Admin</title>
</svelte:head>

<div class="grain"></div>

<div class="relative z-10 min-h-screen pt-16 pb-16">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center gap-3 mb-8">
      <a href="/admin/blog" class="text-sm text-stone-500 hover:text-stone-300 transition-colors">
        ← Blog
      </a>
      <span class="text-stone-700">/</span>
      <h1 class="text-xl font-bold text-stone-100">Manage Series</h1>
    </div>

    <!-- Series list -->
    <div class="space-y-2 mb-6">
      {#if data.series.length === 0 && !creating}
        <p class="text-stone-500 text-sm">No series yet.</p>
      {/if}

      {#each data.series as s}
        <div class="bg-white/5 border border-white/10 rounded-xl px-5 py-4">
          {#if editingId === s.id}
            <!-- Inline edit form -->
            <div class="space-y-3">
              {#if editError}
                <p class="text-xs text-red-400">{editError}</p>
              {/if}
              <input
                type="text"
                bind:value={editName}
                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-emerald-500/50"
                placeholder="Series name"
              />
              <textarea
                bind:value={editDescription}
                rows={2}
                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                placeholder="Description (optional)"
              ></textarea>
              <div class="flex gap-2">
                <button
                  on:click={saveSeries}
                  disabled={saving}
                  class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  on:click={cancelEdit}
                  class="px-4 py-1.5 bg-white/5 border border-white/10 text-stone-300 text-xs font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          {:else}
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-stone-100">{s.name}</p>
                {#if s.description}
                  <p class="text-xs text-stone-500 mt-0.5">{s.description}</p>
                {/if}
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button
                  on:click={() => startEdit(s)}
                  class="p-2 text-stone-400 hover:text-emerald-400 transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  on:click={() => deleteSeries(s.slug, s.name)}
                  class="p-2 text-stone-400 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Create new series -->
    {#if creating}
      <div class="bg-white/5 border border-emerald-500/20 rounded-xl px-5 py-4 space-y-3">
        <p class="text-xs font-semibold text-stone-400 uppercase tracking-wider">New Series</p>
        {#if createError}
          <p class="text-xs text-red-400">{createError}</p>
        {/if}
        <input
          type="text"
          bind:value={newName}
          class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-emerald-500/50"
          placeholder="Series name"
          autofocus
        />
        <textarea
          bind:value={newDescription}
          rows={2}
          class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 resize-none"
          placeholder="Description (optional)"
        ></textarea>
        <div class="flex gap-2">
          <button
            on:click={createSeries}
            disabled={saving}
            class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {saving ? "Creating…" : "Create Series"}
          </button>
          <button
            on:click={() => (creating = false)}
            class="px-4 py-1.5 bg-white/5 border border-white/10 text-stone-300 text-xs font-semibold rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    {:else}
      <button
        on:click={() => (creating = true)}
        class="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 text-stone-300 text-sm font-semibold rounded-lg transition-colors"
      >
        <Plus size={16} /> New Series
      </button>
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
