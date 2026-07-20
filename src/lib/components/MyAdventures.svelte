<script lang="ts">
  import { onMount } from "svelte";
  import { Trash2, Shield } from "lucide-svelte";

  export let initialShareCompletionStats: boolean;

  let shareCompletionStats = initialShareCompletionStats;
  let isSavingSharing = false;
  let sharingError: string | null = null;

  type CompletionEntry = {
    id: string;
    entityName: string | null;
    entitySlug: string | null;
    distance: string | null;
    distanceUnit: "miles" | "kilometers" | null;
    nights: number | null;
    completedAt: string;
    createdAt: string;
  };

  let stats: { totalMiles: string; totalNights: number; tripCount: number } | null = null;
  let history: CompletionEntry[] = [];
  let loading = true;
  let confirmingId: string | null = null;
  let deletingId: string | null = null;

  onMount(loadAdventures);

  async function loadAdventures() {
    loading = true;
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch("/api/completions/my-stats"),
        fetch("/api/completions"),
      ]);
      if (statsRes.ok) stats = await statsRes.json();
      if (historyRes.ok) {
        const data = await historyRes.json();
        history = data.completions ?? [];
      }
    } catch (err) {
      console.error("Error loading adventures:", err);
    } finally {
      loading = false;
    }
  }

  async function confirmDelete(id: string) {
    deletingId = id;
    try {
      const response = await fetch(`/api/completions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete completion");
      const data = await response.json();
      history = history.filter((entry) => entry.id !== id);
      stats = {
        totalMiles: data.stats.totalMiles,
        totalNights: data.stats.totalNights,
        tripCount: data.stats.tripCount,
      };
    } catch (err) {
      console.error("Error deleting completion:", err);
    } finally {
      deletingId = null;
      confirmingId = null;
    }
  }

  async function toggleSharing() {
    if (isSavingSharing) return;

    // bind:checked already applied the click to shareCompletionStats by the
    // time this change handler runs, so that IS the optimistic "next" value.
    const next = shareCompletionStats;
    const previous = !next;
    isSavingSharing = true;
    sharingError = null;

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareCompletionStats: next }),
      });
      if (!response.ok) throw new Error("Failed to save sharing preference");
    } catch (err) {
      console.error("Error saving sharing preference:", err);
      shareCompletionStats = previous; // rollback
      sharingError = "Couldn't save — try again";
    } finally {
      isSavingSharing = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="rounded-xl p-5 bg-stone-50 border border-stone-100">
      <p class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Miles Hiked</p>
      <p class="text-2xl font-black text-stone-900">
        {stats ? Math.round(Number(stats.totalMiles) * 10) / 10 : "—"}
      </p>
    </div>
    <div class="rounded-xl p-5 bg-stone-50 border border-stone-100">
      <p class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Nights Camped</p>
      <p class="text-2xl font-black text-stone-900">{stats ? stats.totalNights : "—"}</p>
    </div>
    <div class="rounded-xl p-5 bg-stone-50 border border-stone-100">
      <p class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Trips Logged</p>
      <p class="text-2xl font-black text-stone-900">{stats ? stats.tripCount : "—"}</p>
    </div>
  </div>

  <div class="pt-4 border-t border-stone-100">
    <h3 class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">History</h3>

    {#if loading}
      <p class="text-sm text-stone-400">Loading…</p>
    {:else if history.length === 0}
      <p class="text-sm text-stone-400">No completions logged yet.</p>
    {:else}
      <ul class="space-y-2">
        {#each history as entry (entry.id)}
          <li
            class="flex items-center justify-between rounded-xl p-3 bg-stone-50 border border-stone-100"
          >
            <div>
              <p class="text-sm font-semibold text-stone-900">
                {entry.entityName ?? "Unknown trip"}
              </p>
              <p class="text-xs text-stone-400">
                {new Date(`${entry.completedAt}T00:00:00`).toLocaleDateString()}
                {#if entry.distance}
                  · {Math.round(Number(entry.distance) * 10) / 10}
                  {entry.distanceUnit === "kilometers" ? "km" : "mi"}
                {/if}
                {#if entry.nights}
                  · {entry.nights} {entry.nights === 1 ? "night" : "nights"}
                {/if}
              </p>
            </div>
            {#if confirmingId === entry.id}
              <div class="flex items-center gap-2">
                <span class="text-xs text-stone-500">Remove and update totals?</span>
                <button
                  type="button"
                  on:click={() => confirmDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  class="px-2.5 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === entry.id ? "Removing…" : "Confirm"}
                </button>
                <button
                  type="button"
                  on:click={() => (confirmingId = null)}
                  class="px-2.5 py-1 text-xs font-medium rounded border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
              </div>
            {:else}
              <button
                type="button"
                on:click={() => (confirmingId = entry.id)}
                aria-label="Delete this completion"
                class="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <div
    class="rounded-xl p-4 bg-stone-50 border border-stone-100 flex items-start gap-4 pt-4 border-t border-stone-100"
  >
    <div class="flex-1">
      <div class="flex items-center gap-2 mb-1">
        <Shield size={13} class="text-stone-400" />
        <p class="text-xs font-bold text-stone-500 uppercase tracking-widest">Share My Totals</p>
      </div>
      <p class="text-xs text-stone-400">
        When on, your lifetime totals may be shown on your profile. Off by default.
      </p>
      {#if sharingError}
        <p class="text-xs text-red-600 mt-1" role="alert">{sharingError}</p>
      {/if}
    </div>
    <div>
      <label class="relative inline-flex items-center cursor-pointer mt-0.5">
        <input
          type="checkbox"
          class="sr-only peer"
          bind:checked={shareCompletionStats}
          disabled={isSavingSharing}
          on:change={toggleSharing}
        />
        <div
          class="w-10 h-6 bg-stone-200 peer-focus:ring-2 peer-focus:ring-emerald-400 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
        ></div>
      </label>
    </div>
  </div>
</div>
