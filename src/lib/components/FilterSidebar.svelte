<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Button from "./Button.svelte";

  export let title: string = "Filters";
  export let filters: FilterConfig[] = [];
  export let activeFilters: Record<string, any> = {};
  export let isApplying: boolean = false;
  export let showMobileToggle: boolean = true;

  type FilterConfig = {
    id: string;
    label: string;
    type: "search" | "select" | "multiselect" | "range" | "checkbox";
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
    min?: number;
    max?: number;
  };

  const dispatch = createEventDispatcher();

  let isDrawerOpen = false;
  let filterValues: Record<string, any> = { ...activeFilters };

  // Count active filters
  $: activeFilterCount = Object.entries(filterValues).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "boolean") return value;
    return value !== "" && value !== null && value !== undefined;
  }).length;

  function handleApply() {
    dispatch("apply", filterValues);
    isDrawerOpen = false;
  }

  function handleClear() {
    filterValues = {};
    dispatch("clear");
    isDrawerOpen = false;
  }

  function toggleMultiSelect(filterId: string, value: string) {
    const current = filterValues[filterId] || [];
    if (current.includes(value)) {
      filterValues[filterId] = current.filter((v: string) => v !== value);
    } else {
      filterValues[filterId] = [...current, value];
    }
  }
</script>

<!-- Mobile Filter Toggle Button -->
{#if showMobileToggle}
  <button
    class="lg:hidden fixed bottom-6 right-6 z-40 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
    on:click={() => (isDrawerOpen = true)}
    aria-label="Open filters menu"
    aria-expanded={isDrawerOpen}
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
    {title}
    {#if activeFilterCount > 0}
      <span class="bg-white text-emerald-600 px-2 py-0.5 rounded-full text-xs font-semibold">
        {activeFilterCount}
      </span>
    {/if}
  </button>
{/if}

<!-- Mobile Drawer Backdrop -->
{#if isDrawerOpen}
  <div
    class="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
    on:click={() => (isDrawerOpen = false)}
    role="button"
    tabindex="0"
    aria-label="Close filters menu"
  />
{/if}

<!-- Filter Sidebar/Drawer -->
<aside
  class="
    {isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
    lg:translate-x-0
    fixed lg:sticky top-0 right-0 h-screen lg:h-auto
    w-80 bg-white shadow-xl lg:shadow-md rounded-l-xl lg:rounded-xl
    z-50 lg:z-0
    transition-transform duration-300 ease-in-out
    overflow-y-auto
  "
>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        {title}
        {#if activeFilterCount > 0}
          <span
            class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold"
          >
            {activeFilterCount}
          </span>
        {/if}
      </h2>
      <button
        class="lg:hidden text-gray-400 hover:text-gray-600"
        on:click={() => (isDrawerOpen = false)}
        aria-label="Close filters menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Filter Fields -->
    <div class="space-y-6">
      {#each filters as filter}
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {filter.label}
          </label>

          {#if filter.type === "search"}
            <input
              type="text"
              bind:value={filterValues[filter.id]}
              placeholder={filter.placeholder || "Search..."}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          {:else if filter.type === "select"}
            <select
              bind:value={filterValues[filter.id]}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All</option>
              {#each filter.options || [] as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          {:else if filter.type === "multiselect"}
            <div class="space-y-2 max-h-48 overflow-y-auto">
              {#each filter.options || [] as option}
                <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={(filterValues[filter.id] || []).includes(option.value)}
                    on:change={() => toggleMultiSelect(filter.id, option.value)}
                    class="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="text-sm text-gray-700">{option.label}</span>
                </label>
              {/each}
            </div>
          {:else if filter.type === "range"}
            <div class="grid grid-cols-2 gap-2">
              <input
                type="number"
                bind:value={filterValues[`${filter.id}Min`]}
                placeholder={`Min ${filter.min !== undefined ? filter.min : ""}`}
                min={filter.min}
                max={filter.max}
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="number"
                bind:value={filterValues[`${filter.id}Max`]}
                placeholder={`Max ${filter.max !== undefined ? filter.max : ""}`}
                min={filter.min}
                max={filter.max}
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          {:else if filter.type === "checkbox"}
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={filterValues[filter.id]}
                class="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span class="text-sm text-gray-700">{filter.placeholder || filter.label}</span>
            </label>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Action Buttons -->
    <div class="mt-6 space-y-3">
      <Button variant="primary" fullWidth loading={isApplying} on:click={handleApply}>
        Apply Filters
      </Button>
      <Button
        variant="secondary"
        fullWidth
        disabled={activeFilterCount === 0}
        on:click={handleClear}
      >
        Clear All
      </Button>
    </div>
  </div>
</aside>
