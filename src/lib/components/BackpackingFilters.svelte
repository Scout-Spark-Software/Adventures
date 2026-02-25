<script lang="ts">
  import { TRAIL_TYPE_LABELS, CAMPING_STYLE_LABELS } from "$lib/db/schemas/enums";
  import type { FeatureType } from "$lib/db/schemas";
  import { goto } from "$app/navigation";
  import { onDestroy } from "svelte";
  import { SlidersHorizontal, X, ChevronDown, Check } from "lucide-svelte";
  import FilterInput from "$lib/components/FilterInput.svelte";
  import FilterSelect from "$lib/components/FilterSelect.svelte";

  let featuresOpen = false;
  let featuresDropdownEl: HTMLDivElement;

  function handleFeaturesClickOutside(event: MouseEvent) {
    if (featuresDropdownEl && !featuresDropdownEl.contains(event.target as Node)) {
      featuresOpen = false;
    }
  }

  export let featureTypes: FeatureType[] = [];
  export let currentFilters: Record<string, string> = {};
  export let userRole: string | null = null;

  $: isAdmin = userRole === "admin";

  // Filter state
  let search = currentFilters.search || "";
  let difficulty = currentFilters.difficulty || "";
  let trailType = currentFilters.trailType || "";
  let campingStyle = currentFilters.campingStyle || "";
  let minDistance = currentFilters.minDistance || "";
  let maxDistance = currentFilters.maxDistance || "";
  let minDays = currentFilters.minDays || "";
  let maxDays = currentFilters.maxDays || "";
  let minRating = currentFilters.minRating || "";
  let selectedFeatures: string[] = currentFilters.features
    ? currentFilters.features.split(",")
    : [];
  let dogFriendly = currentFilters.dogFriendly === "true";
  let statusFilter = currentFilters.status || "";

  // Mobile drawer state
  let isDrawerOpen = false;
  let isApplyingFilters = false;
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  let isInitialized = false;

  onDestroy(() => {
    if (searchTimeout !== null) {
      clearTimeout(searchTimeout as unknown as number | undefined);
      searchTimeout = null;
    }
  });

  $: if (typeof window !== "undefined" && !isInitialized) {
    isInitialized = true;
  }

  function toggleFeature(featureId: string) {
    if (selectedFeatures.includes(featureId)) {
      selectedFeatures = selectedFeatures.filter((id) => id !== featureId);
    } else {
      selectedFeatures = [...selectedFeatures, featureId];
    }
    if (isInitialized) applyFilters();
  }

  function handleSearchInput() {
    if (!isInitialized) return;
    clearTimeout(searchTimeout as unknown as number | undefined);
    searchTimeout = setTimeout(() => {
      applyFilters();
    }, 500);
  }

  async function applyFilters() {
    isApplyingFilters = true;
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (difficulty) params.set("difficulty", difficulty);
    if (trailType) params.set("trailType", trailType);
    if (campingStyle) params.set("campingStyle", campingStyle);
    if (minDistance) params.set("minDistance", minDistance);
    if (maxDistance) params.set("maxDistance", maxDistance);
    if (minDays) params.set("minDays", minDays);
    if (maxDays) params.set("maxDays", maxDays);
    if (minRating) params.set("minRating", minRating);
    if (selectedFeatures.length > 0) params.set("features", selectedFeatures.join(","));
    if (dogFriendly) params.set("dogFriendly", "true");
    if (isAdmin && statusFilter) params.set("status", statusFilter);

    const queryString = params.toString();
    await goto(`/backpacking${queryString ? "?" + queryString : ""}`);
    isDrawerOpen = false;
    isApplyingFilters = false;
  }

  function clearFilters() {
    search = "";
    difficulty = "";
    trailType = "";
    campingStyle = "";
    minDistance = "";
    maxDistance = "";
    minDays = "";
    maxDays = "";
    minRating = "";
    selectedFeatures = [];
    dogFriendly = false;
    statusFilter = "";
    goto("/backpacking");
    isDrawerOpen = false;
  }

  $: activeFilterCount =
    (search ? 1 : 0) +
    (difficulty ? 1 : 0) +
    (trailType ? 1 : 0) +
    (campingStyle ? 1 : 0) +
    (minDistance || maxDistance ? 1 : 0) +
    (minDays || maxDays ? 1 : 0) +
    (minRating ? 1 : 0) +
    selectedFeatures.length +
    (dogFriendly ? 1 : 0) +
    (statusFilter ? 1 : 0);
</script>

<!-- Mobile Filter Toggle Button -->
<button
  class="lg:hidden fixed bottom-6 right-6 z-40 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
  on:click={() => (isDrawerOpen = true)}
  aria-label="Open filters menu"
  aria-expanded={isDrawerOpen}
>
  <SlidersHorizontal size={20} aria-hidden="true" />
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

<svelte:window on:click={handleFeaturesClickOutside} />

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
      <X size={20} aria-hidden="true" />
    </button>
  </div>

  <h2 class="text-base font-bold text-gray-900 mb-3 hidden lg:block">Search & Filter</h2>

  <!-- Admin: Status Filter -->
  {#if isAdmin}
    <div class="mb-3">
      <label for="statusFilter" class="block text-sm font-medium text-gray-700 mb-1.5">
        Status
      </label>
      <FilterSelect id="statusFilter" bind:value={statusFilter} on:change={applyFilters}>
        <option value="">Approved only</option>
        <option value="pending">Pending</option>
        <option value="rejected">Rejected</option>
        <option value="all">All statuses</option>
      </FilterSelect>
    </div>
  {/if}

  <!-- Search Input -->
  <div class="mb-3">
    <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Search</label>
    <FilterInput
      id="search"
      type="text"
      bind:value={search}
      on:input={handleSearchInput}
      placeholder="Name, description, location..."
    />
  </div>

  <!-- Difficulty Dropdown -->
  <div class="mb-3">
    <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-1.5">
      Difficulty
    </label>
    <FilterSelect id="difficulty" bind:value={difficulty}>
      <option value="">All Levels</option>
      <option value="easy">Easy</option>
      <option value="moderate">Moderate</option>
      <option value="hard">Hard</option>
      <option value="very_hard">Very Hard</option>
    </FilterSelect>
  </div>

  <!-- Trail Type Dropdown -->
  <div class="mb-3">
    <label for="trailType" class="block text-sm font-medium text-gray-700 mb-1.5">
      Trail Type
    </label>
    <FilterSelect id="trailType" bind:value={trailType}>
      <option value="">All Types</option>
      {#each Object.entries(TRAIL_TYPE_LABELS) as [value, label] (value)}
        <option {value}>{label}</option>
      {/each}
    </FilterSelect>
  </div>

  <!-- Camping Style Dropdown -->
  <div class="mb-3">
    <label for="campingStyle" class="block text-sm font-medium text-gray-700 mb-1.5">
      Camping Style
    </label>
    <FilterSelect id="campingStyle" bind:value={campingStyle}>
      <option value="">All Styles</option>
      {#each Object.entries(CAMPING_STYLE_LABELS) as [value, label] (value)}
        <option {value}>{label}</option>
      {/each}
    </FilterSelect>
  </div>

  <!-- Distance Range -->
  <div class="mb-3">
    <label for="minDistance" class="block text-sm font-medium text-gray-700 mb-1.5">
      Distance (miles)
    </label>
    <div class="flex gap-2">
      <FilterInput
        id="minDistance"
        type="number"
        bind:value={minDistance}
        placeholder="Min"
        min={0}
        step={0.1}
        ariaLabel="Minimum distance in miles"
        fullWidth={false}
      />
      <FilterInput
        id="maxDistance"
        type="number"
        bind:value={maxDistance}
        placeholder="Max"
        min={0}
        step={0.1}
        ariaLabel="Maximum distance in miles"
        fullWidth={false}
      />
    </div>
  </div>

  <!-- Trip Length (Days) -->
  <div class="mb-3">
    <label for="minDays" class="block text-sm font-medium text-gray-700 mb-1.5">
      Trip Length (days)
    </label>
    <div class="flex gap-2">
      <FilterInput
        id="minDays"
        type="number"
        bind:value={minDays}
        placeholder="Min"
        min={1}
        step={1}
        ariaLabel="Minimum trip length in days"
        fullWidth={false}
      />
      <FilterInput
        id="maxDays"
        type="number"
        bind:value={maxDays}
        placeholder="Max"
        min={1}
        step={1}
        ariaLabel="Maximum trip length in days"
        fullWidth={false}
      />
    </div>
  </div>

  <!-- Minimum Rating -->
  <div class="mb-3">
    <label for="minRating" class="block text-sm font-medium text-gray-700 mb-1.5">
      Minimum Rating
    </label>
    <FilterSelect id="minRating" bind:value={minRating}>
      <option value="">Any Rating</option>
      <option value="1">⭐ 1+ Stars</option>
      <option value="2">⭐⭐ 2+ Stars</option>
      <option value="3">⭐⭐⭐ 3+ Stars</option>
      <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
      <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
    </FilterSelect>
  </div>

  <!-- Trail Features Multi-Select Dropdown -->
  <div class="mb-3" bind:this={featuresDropdownEl}>
    <label class="block text-sm font-medium text-gray-700 mb-1.5">Trail Features</label>
    <button
      type="button"
      on:click|stopPropagation={() => (featuresOpen = !featuresOpen)}
      class="w-full flex items-center justify-between px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-left"
    >
      <span class="truncate {selectedFeatures.length === 0 ? 'text-gray-400' : 'text-gray-900 font-medium'}">
        {selectedFeatures.length === 0
          ? "Any features"
          : selectedFeatures.length === 1
            ? (featureTypes.find(f => f.id === selectedFeatures[0])?.name ?? "1 selected")
            : `${selectedFeatures.length} selected`}
      </span>
      <ChevronDown size={16} class="text-gray-400 flex-shrink-0 ml-2 transition-transform {featuresOpen ? 'rotate-180' : ''}" />
    </button>
    {#if featuresOpen}
      <div class="relative z-20">
        <div class="absolute top-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {#each featureTypes as feature (feature.id)}
            <button
              type="button"
              on:click|stopPropagation={() => toggleFeature(feature.id)}
              class="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors text-left"
            >
              <span class="{selectedFeatures.includes(feature.id) ? 'text-emerald-700 font-semibold' : 'text-gray-700'}">{feature.name}</span>
              {#if selectedFeatures.includes(feature.id)}
                <Check size={14} class="text-emerald-600 flex-shrink-0" />
              {/if}
            </button>
          {/each}
          {#if selectedFeatures.length > 0}
            <div class="border-t border-gray-100 px-4 py-2">
              <button
                type="button"
                on:click|stopPropagation={() => { selectedFeatures = []; featuresOpen = false; applyFilters(); }}
                class="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Clear features
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}
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
      class="flex-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      class="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Clear all filters"
    >
      Clear All
    </button>
  </div>
</div>
