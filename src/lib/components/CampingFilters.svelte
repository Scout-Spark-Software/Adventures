<script lang="ts">
  import type { AmenityType, FacilityType } from "$lib/db/schemas";
  import { goto } from "$app/navigation";
  import { onDestroy } from "svelte";
  import { SlidersHorizontal, X, ChevronDown, Check } from "lucide-svelte";
  import FilterInput from "$lib/components/FilterInput.svelte";
  import FilterSelect from "$lib/components/FilterSelect.svelte";
  import CouncilSelect from "$lib/components/CouncilSelect.svelte";

  let amenitiesOpen = false;
  let facilitiesOpen = false;
  let amenitiesDropdownEl: HTMLDivElement;
  let facilitiesDropdownEl: HTMLDivElement;

  function handleClickOutside(event: MouseEvent) {
    if (amenitiesDropdownEl && !amenitiesDropdownEl.contains(event.target as Node)) {
      amenitiesOpen = false;
    }
    if (facilitiesDropdownEl && !facilitiesDropdownEl.contains(event.target as Node)) {
      facilitiesOpen = false;
    }
  }

  export let amenityTypes: AmenityType[] = [];
  export let facilityTypes: FacilityType[] = [];
  export let councils: {
    id: string;
    councilNumber: number;
    name: string;
    headquartersCity: string | null;
    headquartersState: string | null;
  }[] = [];
  export let currentFilters: Record<string, string> = {};
  export let userRole: string | null = null;

  $: isAdmin = userRole === "admin";

  // Filter state
  let search = currentFilters.search || "";
  let councilId = currentFilters.councilId || "";
  let siteType = currentFilters.siteType || "";
  let petPolicy = currentFilters.petPolicy || "";
  let firePolicy = currentFilters.firePolicy || "";
  let minCost = currentFilters.minCost || "";
  let maxCost = currentFilters.maxCost || "";
  let minRating = currentFilters.minRating || "";
  let selectedAmenities: string[] = currentFilters.amenities
    ? currentFilters.amenities.split(",")
    : [];
  let selectedFacilities: string[] = currentFilters.facilities
    ? currentFilters.facilities.split(",")
    : [];
  let reservationRequired = currentFilters.reservationRequired === "true";
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

  // Initialize flag after first render to prevent auto-submit on mount
  $: if (typeof window !== "undefined" && !isInitialized) {
    isInitialized = true;
  }

  function toggleAmenity(amenityId: string) {
    if (selectedAmenities.includes(amenityId)) {
      selectedAmenities = selectedAmenities.filter((id) => id !== amenityId);
    } else {
      selectedAmenities = [...selectedAmenities, amenityId];
    }
    if (isInitialized) applyFilters();
  }

  function toggleFacility(facilityId: string) {
    if (selectedFacilities.includes(facilityId)) {
      selectedFacilities = selectedFacilities.filter((id) => id !== facilityId);
    } else {
      selectedFacilities = [...selectedFacilities, facilityId];
    }
    if (isInitialized) applyFilters();
  }

  // Handle search input with debounce
  function handleSearchInput() {
    if (!isInitialized) return;
    clearTimeout(searchTimeout as unknown as number | undefined);
    searchTimeout = setTimeout(() => {
      applyFilters();
    }, 500);
  }

  // Handle immediate filter changes
  function handleFilterChange() {
    if (!isInitialized) return;
    applyFilters();
  }

  async function applyFilters() {
    isApplyingFilters = true;
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (councilId) params.set("councilId", councilId);
    if (siteType) params.set("siteType", siteType);
    if (petPolicy) params.set("petPolicy", petPolicy);
    if (firePolicy) params.set("firePolicy", firePolicy);
    if (minCost) params.set("minCost", minCost);
    if (maxCost) params.set("maxCost", maxCost);
    if (minRating) params.set("minRating", minRating);
    if (selectedAmenities.length > 0) params.set("amenities", selectedAmenities.join(","));
    if (selectedFacilities.length > 0) params.set("facilities", selectedFacilities.join(","));
    if (reservationRequired) params.set("reservationRequired", "true");
    if (isAdmin && statusFilter) params.set("status", statusFilter);

    const queryString = params.toString();
    await goto(`/camping${queryString ? "?" + queryString : ""}`, {
      noScroll: true,
      keepFocus: true,
    });
    isDrawerOpen = false;
    isApplyingFilters = false;
  }

  function clearFilters() {
    search = "";
    councilId = "";
    siteType = "";
    petPolicy = "";
    firePolicy = "";
    minCost = "";
    maxCost = "";
    minRating = "";
    selectedAmenities = [];
    selectedFacilities = [];
    reservationRequired = false;
    statusFilter = "";
    goto("/camping");
    isDrawerOpen = false;
  }

  // Count active filters
  $: activeFilterCount =
    (search ? 1 : 0) +
    (councilId ? 1 : 0) +
    (siteType ? 1 : 0) +
    (petPolicy ? 1 : 0) +
    (firePolicy ? 1 : 0) +
    (minCost || maxCost ? 1 : 0) +
    (minRating ? 1 : 0) +
    selectedAmenities.length +
    selectedFacilities.length +
    (reservationRequired ? 1 : 0) +
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

<svelte:window on:click={handleClickOutside} />

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
      <FilterSelect id="statusFilter" bind:value={statusFilter} on:change={handleFilterChange}>
        <option value="">Approved only</option>
        <option value="pending">Pending</option>
        <option value="rejected">Rejected</option>
        <option value="all">All statuses</option>
      </FilterSelect>
    </div>
  {/if}

  <!-- Search Input -->
  <div class="mb-3">
    <label for="search" class="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
    <FilterInput
      id="search"
      type="text"
      bind:value={search}
      on:input={handleSearchInput}
      placeholder="Name, description, location..."
    />
  </div>

  <!-- Council Filter -->
  <div class="mb-3">
    <label for="councilFilter" class="block text-sm font-medium text-gray-700 mb-1.5">
      Council
    </label>
    <CouncilSelect
      id="councilFilter"
      bind:value={councilId}
      {councils}
      on:change={handleFilterChange}
    />
  </div>

  <!-- Site Type Dropdown -->
  <div class="mb-3">
    <label for="siteType" class="block text-sm font-medium text-gray-700 mb-1.5">Site Type</label>
    <FilterSelect id="siteType" bind:value={siteType} on:change={handleFilterChange}>
      <option value="">All Types</option>
      <option value="public">Public</option>
      <option value="private">Private</option>
      <option value="public_private_partnership">Public-Private Partnership</option>
    </FilterSelect>
  </div>

  <!-- Pet Policy Dropdown -->
  <div class="mb-3">
    <label for="petPolicy" class="block text-sm font-medium text-gray-700 mb-1.5">
      Pet Policy
    </label>
    <FilterSelect id="petPolicy" bind:value={petPolicy} on:change={handleFilterChange}>
      <option value="">All Policies</option>
      <option value="allowed">Allowed</option>
      <option value="not_allowed">Not Allowed</option>
      <option value="restricted">Restricted</option>
    </FilterSelect>
  </div>

  <!-- Fire Policy Dropdown -->
  <div class="mb-3">
    <label for="firePolicy" class="block text-sm font-medium text-gray-700 mb-1.5">
      Fire Policy
    </label>
    <FilterSelect id="firePolicy" bind:value={firePolicy} on:change={handleFilterChange}>
      <option value="">All Policies</option>
      <option value="allowed">Allowed</option>
      <option value="not_allowed">Not Allowed</option>
      <option value="fire_pits_only">Fire Pits Only</option>
      <option value="seasonal">Seasonal</option>
    </FilterSelect>
  </div>

  <!-- Cost Range -->
  <div class="mb-3">
    <label for="minCost" class="block text-sm font-medium text-gray-700 mb-1.5">
      Cost Per Night ($)
    </label>
    <div class="flex gap-2">
      <FilterInput
        id="minCost"
        type="number"
        bind:value={minCost}
        on:input={handleSearchInput}
        placeholder="Min"
        min={0}
        step={1}
        ariaLabel="Minimum cost per night"
        fullWidth={false}
      />
      <FilterInput
        id="maxCost"
        type="number"
        bind:value={maxCost}
        on:input={handleSearchInput}
        placeholder="Max"
        min={0}
        step={1}
        ariaLabel="Maximum cost per night"
        fullWidth={false}
      />
    </div>
  </div>

  <!-- Minimum Rating -->
  <div class="mb-3">
    <label for="minRating" class="block text-sm font-medium text-gray-700 mb-1.5">
      Minimum Rating
    </label>
    <FilterSelect id="minRating" bind:value={minRating} on:change={handleFilterChange}>
      <option value="">Any Rating</option>
      <option value="1">⭐ 1+ Stars</option>
      <option value="2">⭐⭐ 2+ Stars</option>
      <option value="3">⭐⭐⭐ 3+ Stars</option>
      <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
      <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
    </FilterSelect>
  </div>

  <!-- Amenities Multi-Select Dropdown -->
  <div class="mb-3" bind:this={amenitiesDropdownEl}>
    <label class="block text-sm font-medium text-gray-700 mb-1.5">Amenities</label>
    <button
      type="button"
      on:click|stopPropagation={() => (amenitiesOpen = !amenitiesOpen)}
      class="w-full flex items-center justify-between px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-left"
    >
      <span
        class="truncate {selectedAmenities.length === 0
          ? 'text-gray-400'
          : 'text-gray-900 font-medium'}"
      >
        {selectedAmenities.length === 0
          ? "Any amenities"
          : selectedAmenities.length === 1
            ? (amenityTypes.find((a) => a.id === selectedAmenities[0])?.name ?? "1 selected")
            : `${selectedAmenities.length} selected`}
      </span>
      <ChevronDown
        size={16}
        class="text-gray-400 flex-shrink-0 ml-2 transition-transform {amenitiesOpen
          ? 'rotate-180'
          : ''}"
      />
    </button>
    {#if amenitiesOpen}
      <div class="relative z-20">
        <div
          class="absolute top-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          {#each amenityTypes as amenity (amenity.id)}
            <button
              type="button"
              on:click|stopPropagation={() => toggleAmenity(amenity.id)}
              class="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors text-left"
            >
              <span
                class={selectedAmenities.includes(amenity.id)
                  ? "text-emerald-700 font-semibold"
                  : "text-gray-700"}>{amenity.name}</span
              >
              {#if selectedAmenities.includes(amenity.id)}
                <Check size={14} class="text-emerald-600 flex-shrink-0" />
              {/if}
            </button>
          {/each}
          {#if selectedAmenities.length > 0}
            <div class="border-t border-gray-100 px-4 py-2">
              <button
                type="button"
                on:click|stopPropagation={() => {
                  selectedAmenities = [];
                  amenitiesOpen = false;
                  applyFilters();
                }}
                class="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Clear amenities
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Facilities Multi-Select Dropdown -->
  <div class="mb-3" bind:this={facilitiesDropdownEl}>
    <label class="block text-sm font-medium text-gray-700 mb-1.5">Facilities</label>
    <button
      type="button"
      on:click|stopPropagation={() => (facilitiesOpen = !facilitiesOpen)}
      class="w-full flex items-center justify-between px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-left"
    >
      <span
        class="truncate {selectedFacilities.length === 0
          ? 'text-gray-400'
          : 'text-gray-900 font-medium'}"
      >
        {selectedFacilities.length === 0
          ? "Any facilities"
          : selectedFacilities.length === 1
            ? (facilityTypes.find((f) => f.id === selectedFacilities[0])?.name ?? "1 selected")
            : `${selectedFacilities.length} selected`}
      </span>
      <ChevronDown
        size={16}
        class="text-gray-400 flex-shrink-0 ml-2 transition-transform {facilitiesOpen
          ? 'rotate-180'
          : ''}"
      />
    </button>
    {#if facilitiesOpen}
      <div class="relative z-20">
        <div
          class="absolute top-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          {#each facilityTypes as facility (facility.id)}
            <button
              type="button"
              on:click|stopPropagation={() => toggleFacility(facility.id)}
              class="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors text-left"
            >
              <span
                class={selectedFacilities.includes(facility.id)
                  ? "text-emerald-700 font-semibold"
                  : "text-gray-700"}>{facility.name}</span
              >
              {#if selectedFacilities.includes(facility.id)}
                <Check size={14} class="text-emerald-600 flex-shrink-0" />
              {/if}
            </button>
          {/each}
          {#if selectedFacilities.length > 0}
            <div class="border-t border-gray-100 px-4 py-2">
              <button
                type="button"
                on:click|stopPropagation={() => {
                  selectedFacilities = [];
                  facilitiesOpen = false;
                  applyFilters();
                }}
                class="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Clear facilities
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Reservation Required Checkbox -->
  <div class="mb-4">
    <label class="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        bind:checked={reservationRequired}
        on:change={handleFilterChange}
        class="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
      />
      <span class="text-sm font-medium text-gray-700">Reservation Required</span>
    </label>
  </div>

  <!-- Action Buttons -->
  <div class="flex gap-3">
    <button
      type="button"
      on:click={clearFilters}
      disabled={isApplyingFilters}
      class="w-full px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Clear all filters"
    >
      Clear All
    </button>
  </div>
</div>
