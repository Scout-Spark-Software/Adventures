<script lang="ts">
  import type { FeatureType } from "$lib/db/schemas";
  import { TRAIL_TYPE_LABELS } from "$lib/db/schemas/enums";
  import { goto } from "$app/navigation";

  export let featureTypes: FeatureType[] = [];
  export let currentFilters: Record<string, string> = {};

  // Filter state
  let search = currentFilters.search || "";
  let difficulty = currentFilters.difficulty || "";
  let trailType = currentFilters.trailType || "";
  let minDistance = currentFilters.minDistance || "";
  let maxDistance = currentFilters.maxDistance || "";
  let minRating = currentFilters.minRating || "";
  let selectedFeatures: string[] = currentFilters.features
    ? currentFilters.features.split(",")
    : [];
  let dogFriendly = currentFilters.dogFriendly === "true";

  // Mobile drawer state
  let isDrawerOpen = false;
  let isApplyingFilters = false;

  function toggleFeature(featureId: string) {
    if (selectedFeatures.includes(featureId)) {
      selectedFeatures = selectedFeatures.filter((id) => id !== featureId);
    } else {
      selectedFeatures = [...selectedFeatures, featureId];
    }
  }

  async function applyFilters() {
    isApplyingFilters = true;
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (difficulty) params.set("difficulty", difficulty);
    if (trailType) params.set("trailType", trailType);
    if (minDistance) params.set("minDistance", minDistance);
    if (maxDistance) params.set("maxDistance", maxDistance);
    if (minRating) params.set("minRating", minRating);
    if (selectedFeatures.length > 0) params.set("features", selectedFeatures.join(","));
    if (dogFriendly) params.set("dogFriendly", "true");

    const queryString = params.toString();
    await goto(`/hikes${queryString ? "?" + queryString : ""}`);
    isDrawerOpen = false;
    isApplyingFilters = false;
  }

  function clearFilters() {
    search = "";
    difficulty = "";
    trailType = "";
    minDistance = "";
    maxDistance = "";
    minRating = "";
    selectedFeatures = [];
    dogFriendly = false;
    goto("/hikes");
    isDrawerOpen = false;
  }

  // Count active filters
  $: activeFilterCount =
    (search ? 1 : 0) +
    (difficulty ? 1 : 0) +
    (trailType ? 1 : 0) +
    (minDistance || maxDistance ? 1 : 0) +
    (minRating ? 1 : 0) +
    selectedFeatures.length +
    (dogFriendly ? 1 : 0);
</script>

<!-- Mobile Filter Toggle Button -->
<button
  class="lg:hidden fixed bottom-6 right-6 z-40 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
  on:click={() => (isDrawerOpen = true)}
  aria-label="Open filters menu"
  aria-expanded={isDrawerOpen}
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
  Filters
  {#if activeFilterCount > 0}
    <span
      class="bg-white text-emerald-600 px-2 py-0.5 rounded-full text-xs font-semibold"
      aria-label="{activeFilterCount} active filters"
    >
      {activeFilterCount}
    </span>
  {/if}
</button>

<!-- Mobile Drawer Overlay -->
{#if isDrawerOpen}
  <div
    class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
    on:click={() => (isDrawerOpen = false)}
    role="button"
    tabindex="0"
    aria-label="Close filters"
    on:keydown={(e) => e.key === "Escape" && (isDrawerOpen = false)}
  ></div>
{/if}

<!-- Filter Sidebar/Drawer -->
<div
  class="bg-white rounded-lg shadow-md p-4 transition-transform duration-300 lg:sticky lg:top-6
  {isDrawerOpen ? 'fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto' : 'hidden lg:block'}"
>
  <!-- Mobile Close Button -->
  <div class="lg:hidden flex items-center justify-between mb-3 pb-3 border-b">
    <h2 class="text-base font-bold text-gray-900">Filters</h2>
    <button
      class="p-2 hover:bg-gray-100 rounded-lg"
      on:click={() => (isDrawerOpen = false)}
      aria-label="Close filters"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>

  <h2 class="text-base font-bold text-gray-900 mb-3 hidden lg:block">Search & Filter</h2>

  <!-- Search Input -->
  <div class="mb-3">
    <label for="search" class="block text-sm font-medium text-gray-700 mb-2"> Search </label>
    <input
      id="search"
      type="text"
      bind:value={search}
      placeholder="Name, description, location..."
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    />
  </div>

  <!-- Difficulty Dropdown -->
  <div class="mb-3">
    <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-1.5">
      Difficulty
    </label>
    <select
      id="difficulty"
      bind:value={difficulty}
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    >
      <option value="">All Levels</option>
      <option value="easy">Easy</option>
      <option value="moderate">Moderate</option>
      <option value="hard">Hard</option>
      <option value="very_hard">Very Hard</option>
    </select>
  </div>

  <!-- Trail Type Dropdown -->
  <div class="mb-3">
    <label for="trailType" class="block text-sm font-medium text-gray-700 mb-1.5">
      Trail Type
    </label>
    <select
      id="trailType"
      bind:value={trailType}
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    >
      <option value="">All Types</option>
      {#each Object.entries(TRAIL_TYPE_LABELS) as [value, label]}
        <option {value}>{label}</option>
      {/each}
    </select>
  </div>

  <!-- Distance Range -->
  <div class="mb-3">
    <label for="minDistance" class="block text-sm font-medium text-gray-700 mb-1.5">
      Distance (miles)
    </label>
    <div class="flex gap-2">
      <input
        id="minDistance"
        type="number"
        bind:value={minDistance}
        placeholder="Min"
        min="0"
        step="0.1"
        class="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        aria-label="Minimum distance in miles"
      />
      <input
        id="maxDistance"
        type="number"
        bind:value={maxDistance}
        placeholder="Max"
        min="0"
        step="0.1"
        class="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        aria-label="Maximum distance in miles"
      />
    </div>
  </div>

  <!-- Minimum Rating -->
  <div class="mb-3">
    <label for="minRating" class="block text-sm font-medium text-gray-700 mb-1.5">
      Minimum Rating
    </label>
    <select
      id="minRating"
      bind:value={minRating}
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    >
      <option value="">Any Rating</option>
      <option value="1">⭐ 1+ Stars</option>
      <option value="2">⭐⭐ 2+ Stars</option>
      <option value="3">⭐⭐⭐ 3+ Stars</option>
      <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
      <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
    </select>
  </div>

  <!-- Trail Features Multi-Select -->
  <div class="mb-4">
    <div class="block text-sm font-medium text-gray-700 mb-2" id="trail-features-label">
      Trail Features
    </div>
    <div class="flex flex-wrap gap-2" role="group" aria-labelledby="trail-features-label">
      {#each featureTypes as feature (feature.id)}
        <button
          type="button"
          on:click={() => toggleFeature(feature.id)}
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-all
            {selectedFeatures.includes(feature.id)
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          aria-pressed={selectedFeatures.includes(feature.id)}
          aria-label="Toggle {feature.name} filter"
        >
          {feature.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Dog Friendly Checkbox -->
  <div class="mb-6">
    <label class="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        bind:checked={dogFriendly}
        class="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
      />
      <span class="text-sm font-medium text-gray-700">Dog Friendly Only</span>
    </label>
  </div>

  <!-- Action Buttons -->
  <div class="flex gap-3">
    <button
      type="button"
      on:click={applyFilters}
      disabled={isApplyingFilters}
      class="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      aria-label="Apply selected filters"
    >
      {#if isApplyingFilters}
        <svg
          class="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Applying...
      {:else}
        Apply Filters
      {/if}
    </button>
    <button
      type="button"
      on:click={clearFilters}
      disabled={isApplyingFilters}
      class="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Clear all filters"
    >
      Clear All
    </button>
  </div>
</div>
