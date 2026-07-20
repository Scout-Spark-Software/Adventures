<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { Footprints } from "lucide-svelte";

  export let hikeId: string | null = null;
  export let campingSiteId: string | null = null;
  export let backpackingId: string | null = null;
  export let userId: string | null = null;
  export let defaultDistance: string | null = null;
  export let defaultDistanceUnit: "miles" | "kilometers" | null = null;

  const isCamping = !!campingSiteId;
  const distanceLabel = defaultDistanceUnit === "kilometers" ? "Kilometers hiked" : "Miles hiked";

  let count = 0;
  let showTooltip = false;
  let showModal = false;
  let submitting = false;
  let errorMessage: string | null = null;
  let dateInput = "";
  let nightsInput = "";
  let nightsError: string | null = null;
  let milesInput = "";
  let milesError: string | null = null;

  $: tooltipText = !userId
    ? "Log in to track completed trips"
    : count > 0
      ? `Log as completed (logged ${count} ${count === 1 ? "time" : "times"})`
      : "Log as completed";

  onMount(async () => {
    if (!userId) return;
    await fetchCount();
  });

  onDestroy(() => {
    if (!browser) return;
    document.removeEventListener("keydown", handleKeydown);
    document.body.style.overflow = "";
  });

  function todayLocal() {
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

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

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") requestClose();
  }

  function openModal() {
    if (!userId) {
      window.location.href = "/login";
      return;
    }
    errorMessage = null;
    nightsError = null;
    milesError = null;
    dateInput = todayLocal();
    nightsInput = "";
    milesInput = defaultDistance ?? "";
    showModal = true;
    document.addEventListener("keydown", handleKeydown);
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    showModal = false;
    document.removeEventListener("keydown", handleKeydown);
    document.body.style.overflow = "";
  }

  function requestClose() {
    if (submitting) return;
    closeModal();
  }

  async function submitLog() {
    if (submitting) return;
    errorMessage = null;
    nightsError = null;
    milesError = null;

    let nights: number | undefined;
    if (isCamping) {
      const parsed = Number(nightsInput);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
        nightsError = "Enter a whole number of nights between 1 and 90";
        return;
      }
      nights = parsed;
    }

    let distance: number | undefined;
    if (!isCamping && milesInput !== "") {
      const parsed = Number(milesInput);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        milesError = "Enter a distance greater than 0";
        return;
      }
      distance = parsed;
    }

    if (!dateInput || dateInput > todayLocal()) {
      errorMessage = "Enter a valid date that isn't in the future";
      return;
    }

    submitting = true;
    const previousCount = count;
    count = count + 1; // optimistic

    try {
      const response = await fetch("/api/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hikeId,
          campingSiteId,
          backpackingId,
          nights,
          distance,
          completedAt: dateInput,
        }),
      });
      if (!response.ok) throw new Error("Failed to log completion");

      closeModal();
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
</script>

<div class="relative inline-flex items-center justify-center">
  <button
    type="button"
    on:click={openModal}
    on:mouseenter={() => (showTooltip = true)}
    on:mouseleave={() => (showTooltip = false)}
    on:focus={() => (showTooltip = true)}
    on:blur={() => (showTooltip = false)}
    aria-label={tooltipText}
    class="relative inline-flex items-center justify-center w-9 h-9 rounded-full text-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors {!userId
      ? 'opacity-50 cursor-not-allowed'
      : ''}"
  >
    <Footprints size={20} />
    {#if count > 0}
      <span
        class="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold leading-none"
      >
        {count}
      </span>
    {/if}
  </button>

  {#if showTooltip}
    <div
      role="tooltip"
      class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap z-20 pointer-events-none"
    >
      {tooltipText}
    </div>
  {/if}
</div>

{#if showModal}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    on:click|self={requestClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="log-completion-title"
    tabindex="-1"
  >
    <div class="bg-white rounded-lg max-w-sm w-full p-6">
      <h3 id="log-completion-title" class="text-lg font-semibold text-gray-900 mb-4">
        Log completed trip
      </h3>

      <div class="space-y-4">
        <div>
          <label for="completed-date" class="block text-sm font-medium text-gray-700 mb-1">
            {isCamping ? "First night" : "Date completed"}
          </label>
          <input
            id="completed-date"
            type="date"
            bind:value={dateInput}
            max={todayLocal()}
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
          />
        </div>

        {#if isCamping}
          <div>
            <label for="nights-stayed" class="block text-sm font-medium text-gray-700 mb-1">
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
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
            {#if nightsError}
              <p id="nights-stayed-error" class="text-xs text-red-600 mt-1" role="alert">
                {nightsError}
              </p>
            {/if}
          </div>
        {:else}
          <div>
            <label for="miles-hiked" class="block text-sm font-medium text-gray-700 mb-1">
              {distanceLabel}
            </label>
            <input
              id="miles-hiked"
              type="number"
              min="0"
              step="0.1"
              bind:value={milesInput}
              aria-describedby={milesError ? "miles-hiked-error" : undefined}
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
            {#if milesError}
              <p id="miles-hiked-error" class="text-xs text-red-600 mt-1" role="alert">
                {milesError}
              </p>
            {/if}
          </div>
        {/if}

        {#if errorMessage}
          <p class="text-sm text-red-600" role="alert">{errorMessage}</p>
        {/if}
      </div>

      <div class="flex gap-3 justify-end mt-6">
        <button
          type="button"
          on:click={requestClose}
          disabled={submitting}
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          on:click={submitLog}
          disabled={submitting}
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "Logging…" : "Log completion"}
        </button>
      </div>
    </div>
  </div>
{/if}
