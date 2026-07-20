<script lang="ts">
  import { onMount } from "svelte";
  import { CheckCircle2 } from "lucide-svelte";

  export let hikeId: string | null = null;
  export let campingSiteId: string | null = null;
  export let backpackingId: string | null = null;
  export let userId: string | null = null;

  const isCamping = !!campingSiteId;

  let count = 0;
  let submitting = false;
  let errorMessage: string | null = null;
  let showCampingForm = false;
  let nightsInput = "";
  let nightsError: string | null = null;

  onMount(async () => {
    if (!userId) return;
    await fetchCount();
  });

  async function fetchCount() {
    try {
      const params = new URLSearchParams();
      if (hikeId) params.append("hike_id", hikeId);
      if (campingSiteId) params.append("camping_site_id", campingSiteId);
      if (backpackingId) params.append("backpacking_id", backpackingId);
      params.append("count_only", "true");
      const response = await fetch(`/api/completions?${params}`);
      if (!response.ok) return;
      const data = await response.json();
      count = typeof data.count === "number" ? data.count : 0;
    } catch (err) {
      console.error("Error fetching completion count:", err);
    }
  }

  function handleClick() {
    if (!userId) {
      window.location.href = "/login";
      return;
    }
    if (submitting) return;

    if (isCamping) {
      showCampingForm = !showCampingForm;
      nightsError = null;
      errorMessage = null;
      return;
    }

    void logCompletion();
  }

  async function logCompletion(nights?: number) {
    submitting = true;
    errorMessage = null;

    const previousCount = count;
    count = count + 1; // optimistic

    try {
      const response = await fetch("/api/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hikeId, campingSiteId, backpackingId, nights }),
      });
      if (!response.ok) throw new Error("Failed to log completion");

      if (isCamping) {
        showCampingForm = false;
        nightsInput = "";
      }

      // Reconcile with the authoritative count rather than trusting the
      // optimistic increment indefinitely (it would otherwise drift after
      // deletions elsewhere, e.g. the My Adventures history).
      await fetchCount();
    } catch (err) {
      console.error("Error logging completion:", err);
      count = previousCount; // rollback
      errorMessage = "Couldn't log this trip — try again";
    } finally {
      submitting = false;
    }
  }

  function submitCampingForm() {
    const parsed = Number(nightsInput);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
      nightsError = "Enter a whole number of nights between 1 and 90";
      return;
    }
    nightsError = null;
    void logCompletion(parsed);
  }
</script>

<div class="inline-flex flex-col items-start gap-1">
  <button
    type="button"
    on:click={handleClick}
    disabled={submitting}
    aria-disabled={!userId || undefined}
    aria-describedby={!userId ? "log-completion-login-hint" : undefined}
    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors {!userId
      ? 'opacity-50 cursor-not-allowed'
      : ''}"
  >
    <CheckCircle2 size={15} />
    {submitting ? "Logging…" : "Log as completed"}
    {#if count > 0}
      <span class="text-xs text-emerald-600">(logged {count} {count === 1 ? "time" : "times"})</span
      >
    {/if}
  </button>

  {#if !userId}
    <span id="log-completion-login-hint" class="sr-only">Log in to track completed trips</span>
  {/if}

  {#if errorMessage}
    <p class="text-xs text-red-600" role="alert">{errorMessage}</p>
  {/if}

  {#if isCamping && showCampingForm}
    <div class="mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
      <label for="nights-stayed" class="block text-xs font-medium text-gray-700">
        Nights stayed
      </label>
      <input
        id="nights-stayed"
        type="number"
        min="1"
        max="90"
        step="1"
        bind:value={nightsInput}
        aria-describedby={nightsError ? "nights-stayed-error" : undefined}
        class="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
      />
      {#if nightsError}
        <p id="nights-stayed-error" class="text-xs text-red-600" role="alert">{nightsError}</p>
      {/if}
      <div class="flex gap-2">
        <button
          type="button"
          on:click={submitCampingForm}
          disabled={submitting}
          class="px-2.5 py-1 text-xs font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "Logging…" : "Log completion"}
        </button>
        <button
          type="button"
          on:click={() => {
            showCampingForm = false;
            nightsError = null;
          }}
          disabled={submitting}
          class="px-2.5 py-1 text-xs font-medium rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  {/if}
</div>
