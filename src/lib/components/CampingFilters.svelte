<script lang="ts">
  import type { AmenityType, FacilityType } from "$lib/db/schemas";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  export let amenityTypes: AmenityType[] = [];
  export let facilityTypes: FacilityType[] = [];
  export let currentFilters: Record<string, string> = {};

  // Filter state
  let search = currentFilters.search || "";
  let siteType = currentFilters.siteType || "";
  let petPolicy = currentFilters.petPolicy || "";
  let firePolicy = currentFilters.firePolicy || "";
  let minCost = currentFilters.minCost || "";
  let maxCost = currentFilters.maxCost || "";
  let selectedAmenities: string[] = currentFilters.amenities
    ? currentFilters.amenities.split(",")
    : [];
  let selectedFacilities: string[] = currentFilters.facilities
    ? currentFilters.facilities.split(",")
    : [];
  let reservationRequired = currentFilters.reservationRequired === "true";

  // Mobile drawer state
  let isDrawerOpen = false;

  function toggleAmenity(amenityId: string) {
    if (selectedAmenities.includes(amenityId)) {
      selectedAmenities = selectedAmenities.filter((id) => id !== amenityId);
    } else {
      selectedAmenities = [...selectedAmenities, amenityId];
    }
  }

  function toggleFacility(facilityId: string) {
    if (selectedFacilities.includes(facilityId)) {
      selectedFacilities = selectedFacilities.filter((id) => id !== facilityId);
    } else {
      selectedFacilities = [...selectedFacilities, facilityId];
    }
  }

  function applyFilters() {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (siteType) params.set("siteType", siteType);
    if (petPolicy) params.set("petPolicy", petPolicy);
    if (firePolicy) params.set("firePolicy", firePolicy);
    if (minCost) params.set("minCost", minCost);
    if (maxCost) params.set("maxCost", maxCost);
    if (selectedAmenities.length > 0)
      params.set("amenities", selectedAmenities.join(","));
    if (selectedFacilities.length > 0)
      params.set("facilities", selectedFacilities.join(","));
    if (reservationRequired) params.set("reservationRequired", "true");

    const queryString = params.toString();
    goto(`/camping${queryString ? "?" + queryString : ""}`);
    isDrawerOpen = false;
  }

  function clearFilters() {
    search = "";
    siteType = "";
    petPolicy = "";
    firePolicy = "";
    minCost = "";
    maxCost = "";
    selectedAmenities = [];
    selectedFacilities = [];
    reservationRequired = false;
    goto("/camping");
    isDrawerOpen = false;
  }

  // Count active filters
  $: activeFilterCount =
    (search ? 1 : 0) +
    (siteType ? 1 : 0) +
    (petPolicy ? 1 : 0) +
    (firePolicy ? 1 : 0) +
    (minCost || maxCost ? 1 : 0) +
    selectedAmenities.length +
    selectedFacilities.length +
    (reservationRequired ? 1 : 0);
</script>

<!-- Mobile Filter Toggle Button -->
<button
  class="lg:hidden fixed bottom-6 right-6 z-40 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
  on:click={() => (isDrawerOpen = true)}
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    on:keydown={(e) => e.key === "Escape" && (isDrawerOpen = false)}
  ></div>
{/if}

<!-- Filter Sidebar/Drawer -->
<div
  class="bg-white rounded-lg shadow-md p-6 transition-transform duration-300 lg:sticky lg:top-6
  {isDrawerOpen
    ? 'fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto'
    : 'hidden lg:block'}"
>
  <!-- Mobile Close Button -->
  <div class="lg:hidden flex items-center justify-between mb-4 pb-4 border-b">
    <h2 class="text-lg font-bold text-gray-900">Filters</h2>
    <button
      class="p-2 hover:bg-gray-100 rounded-lg"
      on:click={() => (isDrawerOpen = false)}
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>

  <h2 class="text-lg font-bold text-gray-900 mb-4 hidden lg:block">
    Search & Filter
  </h2>

  <!-- Search Input -->
  <div class="mb-4">
    <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
      Search
    </label>
    <input
      id="search"
      type="text"
      bind:value={search}
      placeholder="Name, description, location..."
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    />
  </div>

  <!-- Site Type Dropdown -->
  <div class="mb-4">
    <label for="siteType" class="block text-sm font-medium text-gray-700 mb-2">
      Site Type
    </label>
    <select
      id="siteType"
      bind:value={siteType}
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    >
      <option value="">All Types</option>
      <option value="public">Public</option>
      <option value="private">Private</option>
      <option value="public_private_partnership">Public-Private Partnership</option>
    </select>
  </div>

  <!-- Pet Policy Dropdown -->
  <div class="mb-4">
    <label for="petPolicy" class="block text-sm font-medium text-gray-700 mb-2">
      Pet Policy
    </label>
    <select
      id="petPolicy"
      bind:value={petPolicy}
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    >
      <option value="">All Policies</option>
      <option value="allowed">Allowed</option>
      <option value="not_allowed">Not Allowed</option>
      <option value="restricted">Restricted</option>
    </select>
  </div>

  <!-- Fire Policy Dropdown -->
  <div class="mb-4">
    <label for="firePolicy" class="block text-sm font-medium text-gray-700 mb-2">
      Fire Policy
    </label>
    <select
      id="firePolicy"
      bind:value={firePolicy}
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    >
      <option value="">All Policies</option>
      <option value="allowed">Allowed</option>
      <option value="not_allowed">Not Allowed</option>
      <option value="fire_pits_only">Fire Pits Only</option>
      <option value="seasonal">Seasonal</option>
    </select>
  </div>

  <!-- Cost Range -->
  <div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Cost Per Night ($)
    </label>
    <div class="flex gap-2">
      <input
        type="number"
        bind:value={minCost}
        placeholder="Min"
        min="0"
        step="1"
        class="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
      <input
        type="number"
        bind:value={maxCost}
        placeholder="Max"
        min="0"
        step="1"
        class="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
    </div>
  </div>

  <!-- Amenities Multi-Select -->
  <div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Amenities
    </label>
    <div class="flex flex-wrap gap-2">
      {#each amenityTypes as amenity (amenity.id)}
        <button
          type="button"
          on:click={() => toggleAmenity(amenity.id)}
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-all
            {selectedAmenities.includes(amenity.id)
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          {amenity.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Facilities Multi-Select -->
  <div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Facilities
    </label>
    <div class="flex flex-wrap gap-2">
      {#each facilityTypes as facility (facility.id)}
        <button
          type="button"
          on:click={() => toggleFacility(facility.id)}
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-all
            {selectedFacilities.includes(facility.id)
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          {facility.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Reservation Required Checkbox -->
  <div class="mb-6">
    <label class="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        bind:checked={reservationRequired}
        class="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
      />
      <span class="text-sm font-medium text-gray-700">Reservation Required</span>
    </label>
  </div>

  <!-- Action Buttons -->
  <div class="flex gap-3">
    <button
      type="button"
      on:click={applyFilters}
      class="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
    >
      Apply Filters
    </button>
    <button
      type="button"
      on:click={clearFilters}
      class="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
    >
      Clear All
    </button>
  </div>
</div>
