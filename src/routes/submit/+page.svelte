<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { PageData, ActionData } from "./$types";
  import LocationPicker from "$lib/components/LocationPicker.svelte";
  import FormSection from "$lib/components/FormSection.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";
  import SuccessAnimation from "$lib/components/SuccessAnimation.svelte";
  import MultiStepForm from "$lib/components/MultiStepForm.svelte";
  import {
    Star,
    CircleCheck,
    Building,
    DollarSign,
    FileText,
  } from "lucide-svelte";

  export let data: PageData;

  let type: "hike" | "camping_site" = "hike";
  let loading = false;
  let errors: Record<string, string> = {};
  let currentStep = 0;

  // Success animation state
  let showSuccess = false;
  let successMessage = "";

  // Location fields
  let address = "";
  let city = "";
  let state = "";
  let country = "";
  let postalCode = "";
  let latitude: number | null = null;
  let longitude: number | null = null;

  // Hike-specific fields with units
  let difficulty: string = "";
  let distance: number | null = null;
  let distanceUnit: "miles" | "kilometers" = "miles";
  let duration: number | null = null;
  let durationUnit: "minutes" | "hours" = "hours";
  let elevation: number | null = null;
  let elevationUnit: "feet" | "meters" = "feet";

  // New hike-specific fields
  let permitsRequired = "";
  let bestSeasons: string[] = [];
  let waterSources = false;
  let parkingInfo = "";

  // Dynamic features from database
  let selectedFeatures: string[] = [];

  // Dynamic amenities from database - build object dynamically
  let amenities: Record<string, boolean> = {};
  $: {
    if (data.amenityTypes) {
      amenities = data.amenityTypes.reduce(
        (acc: Record<string, boolean>, type: any) => {
          if (!acc[type.key]) {
            acc[type.key] = false;
          }
          return acc;
        },
        amenities,
      );
    }
  }

  // Dynamic facilities from database - build object dynamically
  let facilities: Record<string, boolean> = {};
  $: {
    if (data.facilityTypes) {
      facilities = data.facilityTypes.reduce(
        (acc: Record<string, boolean>, type: any) => {
          if (!acc[type.key]) {
            acc[type.key] = false;
          }
          return acc;
        },
        facilities,
      );
    }
  }

  // New camping site-specific fields
  let costPerNight: number | null = null;
  let baseFee: number | null = null;
  let operatingSeasonStart = "";
  let operatingSeasonEnd = "";
  let petPolicy = "";
  let reservationRequired = false;
  let siteType = "";
  let firePolicy = "";
  let hikeName = "";
  let hikeDescription = "";
  let campingName = "";
  let campingDescription = "";
  let trailType = "";
  let capacity = "";
  let reservationInfo = "";

  // Real-time validation reactive statements
  $: permitsError =
    permitsRequired.length > 500 ? "Must be less than 500 characters" : "";
  $: parkingError =
    parkingInfo.length > 1000 ? "Must be less than 1000 characters" : "";

  // Step titles for hikes
  const hikeStepTitles = [
    "Basic Info",
    "Location",
    "Trail Details",
    "Features & Conditions",
  ];

  // Step titles for camping sites
  const campingStepTitles = [
    "Basic Info",
    "Location",
    "Site Details",
    "Amenities & Facilities",
    "Cost & Policies",
  ];

  function validateHikeStep(step: number): boolean {
    errors = {};

    if (step === 0) {
      // Basic Info validation
      if (!hikeName || hikeName.trim() === "") {
        errors.name = "Name is required";
        return false;
      }
    } else if (step === 1) {
      // Location validation
      if (!city || !state) {
        errors.address = "City and State are required";
        return false;
      }
    } else if (step === 3) {
      // Features & Conditions validation
      if (permitsRequired && permitsRequired.length > 500) {
        errors.permits = "Permits info must be less than 500 characters";
        return false;
      }
      if (parkingInfo && parkingInfo.length > 1000) {
        errors.parking = "Parking info must be less than 1000 characters";
        return false;
      }
    }

    return true;
  }

  function validateCampingStep(step: number): boolean {
    errors = {};

    if (step === 0) {
      // Basic Info validation
      if (!campingName || campingName.trim() === "") {
        errors.name = "Name is required";
        return false;
      }
    } else if (step === 1) {
      // Location validation
      if (!city || !state) {
        errors.address = "City and State are required";
        return false;
      }
    } else if (step === 4) {
      // Cost & Policies validation
      if (costPerNight && (costPerNight < 0 || costPerNight > 10000)) {
        errors.cost = "Cost per night must be between $0 and $10,000";
        return false;
      }
      if (baseFee && (baseFee < 0 || baseFee > 10000)) {
        errors.baseFee = "Base fee must be between $0 and $10,000";
        return false;
      }
      if (!petPolicy) {
        errors.petPolicy = "Pet policy is required";
        return false;
      }
      if (!siteType) {
        errors.siteType = "Site type is required";
        return false;
      }
      if (!firePolicy) {
        errors.firePolicy = "Fire policy is required";
        return false;
      }
    }

    return true;
  }

  function handleNext() {
    if (type === "hike") {
      return validateHikeStep(currentStep);
    } else {
      return validateCampingStep(currentStep);
    }
  }
</script>

<svelte:head>
  <title>Submit Adventure - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Submit New Adventure</h1>

    <div class="bg-white shadow rounded-lg p-5">
      <div class="mb-5">
        <label
          for="submission-type"
          class="block text-sm font-medium text-gray-700 mb-2">Type</label
        >
        <select
          id="submission-type"
          bind:value={type}
          on:change={() => (currentStep = 0)}
          class="block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="hike">Hike</option>
          <option value="camping_site">Camping Site</option>
        </select>
      </div>

      {#if type === "hike"}
        <form
          method="POST"
          action="?/submitHike"
          use:enhance={() => {
            loading = true;
            return async ({ result, update }) => {
              loading = false;
              if (result.type === "redirect") {
                showSuccess = true;
                successMessage = "Your hike has been submitted for review!";
                setTimeout(() => {
                  goto(result.location);
                }, 3000);
              } else {
                await update();
              }
            };
          }}
        >
          <!-- Hidden inputs to preserve data from other steps -->
          {#if currentStep !== 0}
            <input type="hidden" name="name" value={hikeName} />
            <input type="hidden" name="description" value={hikeDescription} />
          {/if}
          {#if currentStep !== 1}
            <input type="hidden" name="address" value={address} />
            <input type="hidden" name="city" value={city} />
            <input type="hidden" name="state" value={state} />
            <input type="hidden" name="country" value={country} />
            <input type="hidden" name="postal_code" value={postalCode} />
            <input type="hidden" name="latitude" value={latitude} />
            <input type="hidden" name="longitude" value={longitude} />
          {/if}

          <MultiStepForm
            bind:currentStep
            totalSteps={hikeStepTitles.length}
            stepTitles={hikeStepTitles}
            onNext={handleNext}
            {loading}
          >
            {#if currentStep === 0}
              <!-- Basic Information -->
              <div class="space-y-4 animate-fadeIn">
                <h3 class="text-lg font-medium text-gray-900 border-b pb-2">
                  Basic Information
                </h3>

                <div>
                  <label
                    for="name"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    bind:value={hikeName}
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {#if errors.name}
                    <p class="mt-1 text-sm text-red-600">{errors.name}</p>
                  {/if}
                </div>

                <div>
                  <label
                    for="description"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    bind:value={hikeDescription}
                    rows="4"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>
              </div>
            {:else if currentStep === 1}
              <!-- Location Information -->
              <div class="animate-fadeIn">
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                  Location Information
                </h3>
                <LocationPicker
                  bind:address
                  bind:city
                  bind:state
                  bind:country
                  bind:postalCode
                  bind:latitude
                  bind:longitude
                />
                {#if errors.address}
                  <p class="mt-1 text-sm text-red-600">{errors.address}</p>
                {/if}
              </div>
            {:else if currentStep === 2}
              <!-- Trail Details -->
              <div class="space-y-4 animate-fadeIn">
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                  Trail Details
                </h3>

                <div>
                  <label
                    for="difficulty"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    bind:value={difficulty}
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select difficulty...</option>
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="hard">Hard</option>
                    <option value="very_hard">Very Hard</option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      for="distance"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Distance
                    </label>
                    <div class="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        id="distance"
                        name="distance"
                        bind:value={distance}
                        placeholder="5.2"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <select
                        name="distance_unit"
                        bind:value={distanceUnit}
                        class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="miles">mi</option>
                        <option value="kilometers">km</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      for="duration"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Duration
                    </label>
                    <div class="flex gap-2">
                      <input
                        type="number"
                        step="0.5"
                        id="duration"
                        name="duration"
                        bind:value={duration}
                        placeholder="2.5"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <select
                        name="duration_unit"
                        bind:value={durationUnit}
                        class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="minutes">min</option>
                        <option value="hours">hrs</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      for="elevation"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Elevation Gain
                    </label>
                    <div class="flex gap-2">
                      <input
                        type="number"
                        step="1"
                        id="elevation"
                        name="elevation"
                        bind:value={elevation}
                        placeholder="500"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <select
                        name="elevation_unit"
                        bind:value={elevationUnit}
                        class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="feet">ft</option>
                        <option value="meters">m</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      for="trail_type"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Trail Type
                    </label>
                    <select
                      id="trail_type"
                      name="trail_type"
                      bind:value={trailType}
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select trail type...</option>
                      <option value="loop">Loop</option>
                      <option value="out_and_back">Out and Back</option>
                      <option value="point_to_point">Point to Point</option>
                    </select>
                  </div>
                </div>
              </div>
            {:else if currentStep === 3}
              <!-- Features & Conditions -->
              <div class="space-y-6 animate-fadeIn">
                <FormSection title="Features" icon={Star}>
                  <div class="grid grid-cols-2 gap-3">
                    {#each data.featureTypes as feature}
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          value={feature.name}
                          bind:group={selectedFeatures}
                          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span class="ml-2 text-sm text-gray-700"
                          >{feature.name}</span
                        >
                      </label>
                    {/each}
                  </div>
                  <input
                    type="hidden"
                    name="features"
                    value={JSON.stringify(selectedFeatures)}
                  />
                </FormSection>

                <FormSection
                  title="Trail Conditions & Access"
                  icon={CircleCheck}
                  description="Additional information about trail conditions and access requirements"
                >
                  <div class="space-y-4">
                    <div>
                      <label
                        for="permits"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Permits or Passes Required
                        <Tooltip
                          text="Describe any permits, parking passes, or fees needed"
                        />
                      </label>
                      <textarea
                        id="permits"
                        name="permits_required"
                        bind:value={permitsRequired}
                        rows="2"
                        maxlength="500"
                        placeholder="e.g., National Park Pass required, $5 parking fee"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        class:border-red-500={permitsError}
                      ></textarea>
                      {#if permitsError}
                        <p class="mt-1 text-sm text-red-600">{permitsError}</p>
                      {:else}
                        <p class="mt-1 text-xs text-gray-500">
                          {permitsRequired.length}/500 characters
                        </p>
                      {/if}
                    </div>

                    <div>
                      <div
                        class="block text-sm font-medium text-gray-700 mb-2"
                        id="best-season-label"
                      >
                        Best Season to Visit
                        <Tooltip
                          text="Select all seasons when this trail is enjoyable"
                        />
                      </div>
                      <div
                        class="grid grid-cols-2 gap-3"
                        role="group"
                        aria-labelledby="best-season-label"
                      >
                        {#each ["Spring", "Summer", "Fall", "Winter"] as season}
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              value={season.toLowerCase()}
                              bind:group={bestSeasons}
                              class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span class="ml-2 text-sm text-gray-700"
                              >{season}</span
                            >
                          </label>
                        {/each}
                      </div>
                      <input
                        type="hidden"
                        name="best_season"
                        value={JSON.stringify(bestSeasons)}
                      />
                    </div>

                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        name="water_sources"
                        bind:checked={waterSources}
                        class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span class="ml-2 text-sm text-gray-700"
                        >Water sources available on trail</span
                      >
                      <Tooltip
                        text="Natural water sources like streams or lakes along the trail"
                      />
                    </label>

                    <div>
                      <label
                        for="parking"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Parking Information
                        <Tooltip
                          text="Details about parking availability, capacity, and fees"
                        />
                      </label>
                      <textarea
                        id="parking"
                        name="parking_info"
                        bind:value={parkingInfo}
                        rows="3"
                        maxlength="1000"
                        placeholder="e.g., Large paved parking lot, 50 spaces, $10 daily fee"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        class:border-red-500={parkingError}
                      ></textarea>
                      {#if parkingError}
                        <p class="mt-1 text-sm text-red-600">{parkingError}</p>
                      {:else}
                        <p class="mt-1 text-xs text-gray-500">
                          {parkingInfo.length}/1000 characters
                        </p>
                      {/if}
                    </div>
                  </div>
                </FormSection>
              </div>
            {/if}
          </MultiStepForm>
        </form>
      {:else}
        <form
          method="POST"
          action="?/submitCampingSite"
          use:enhance={() => {
            loading = true;
            return async ({ result, update }) => {
              loading = false;
              if (result.type === "redirect") {
                showSuccess = true;
                successMessage =
                  "Your camping site has been submitted for review!";
                setTimeout(() => {
                  goto(result.location);
                }, 3000);
              } else {
                await update();
              }
            };
          }}
        >
          <!-- Hidden inputs to preserve data from other steps -->
          {#if currentStep !== 0}
            <input type="hidden" name="name" value={campingName} />
            <input
              type="hidden"
              name="description"
              value={campingDescription}
            />
          {/if}
          {#if currentStep !== 1}
            <input type="hidden" name="address" value={address} />
            <input type="hidden" name="city" value={city} />
            <input type="hidden" name="state" value={state} />
            <input type="hidden" name="country" value={country} />
            <input type="hidden" name="postal_code" value={postalCode} />
            <input type="hidden" name="latitude" value={latitude} />
            <input type="hidden" name="longitude" value={longitude} />
          {/if}

          <MultiStepForm
            bind:currentStep
            totalSteps={campingStepTitles.length}
            stepTitles={campingStepTitles}
            onNext={handleNext}
            {loading}
          >
            {#if currentStep === 0}
              <!-- Basic Information -->
              <div class="space-y-4 animate-fadeIn">
                <h3 class="text-lg font-medium text-gray-900 border-b pb-2">
                  Basic Information
                </h3>

                <div>
                  <label
                    for="name"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    bind:value={campingName}
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {#if errors.name}
                    <p class="mt-1 text-sm text-red-600">{errors.name}</p>
                  {/if}
                </div>

                <div>
                  <label
                    for="description"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    bind:value={campingDescription}
                    rows="4"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>
              </div>
            {:else if currentStep === 1}
              <!-- Location Information -->
              <div class="animate-fadeIn">
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                  Location Information
                </h3>
                <LocationPicker
                  bind:address
                  bind:city
                  bind:state
                  bind:country
                  bind:postalCode
                  bind:latitude
                  bind:longitude
                />
                {#if errors.address}
                  <p class="mt-1 text-sm text-red-600">{errors.address}</p>
                {/if}
              </div>
            {:else if currentStep === 2}
              <!-- Site Details -->
              <div class="space-y-4 animate-fadeIn">
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                  Site Details
                </h3>

                <div>
                  <label
                    for="capacity"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Capacity (number of people/tents)
                  </label>
                  <input
                    type="text"
                    id="capacity"
                    name="capacity"
                    bind:value={capacity}
                    placeholder="20 people or 10 tents"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    for="reservation_info"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Reservation Info
                  </label>
                  <textarea
                    id="reservation_info"
                    name="reservation_info"
                    bind:value={reservationInfo}
                    rows="3"
                    placeholder="How to make reservations, website, phone number, etc."
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>
              </div>
            {:else if currentStep === 3}
              <!-- Amenities & Facilities -->
              <div class="space-y-6 animate-fadeIn">
                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-4">
                    Amenities
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    {#each data.amenityTypes as amenity}
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          bind:checked={amenities[amenity.key]}
                          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span class="ml-2 text-sm text-gray-700"
                          >{amenity.name}</span
                        >
                      </label>
                    {/each}
                  </div>
                  <input
                    type="hidden"
                    name="amenities"
                    value={JSON.stringify(amenities)}
                  />
                </div>

                <FormSection title="Facilities" icon={Building}>
                  <div class="grid grid-cols-2 gap-3">
                    {#each data.facilityTypes as facility}
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          bind:checked={facilities[facility.key]}
                          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span class="ml-2 text-sm text-gray-700"
                          >{facility.name}</span
                        >
                      </label>
                    {/each}
                  </div>
                  <input
                    type="hidden"
                    name="facilities"
                    value={JSON.stringify(facilities)}
                  />
                </FormSection>
              </div>
            {:else if currentStep === 4}
              <!-- Cost & Policies -->
              <div class="space-y-6 animate-fadeIn">
                <FormSection title="Cost & Fees" icon={DollarSign}>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        for="base_fee"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Base Fee ($)
                        <Tooltip text="One-time fee for the entire stay" />
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10000"
                        id="base_fee"
                        name="base_fee"
                        bind:value={baseFee}
                        placeholder="0.00"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      {#if errors.baseFee}
                        <p class="mt-1 text-sm text-red-600">
                          {errors.baseFee}
                        </p>
                      {/if}
                    </div>
                    <div>
                      <label
                        for="cost_per_night"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Cost Per Night ($)
                        <Tooltip text="Nightly rate for camping" />
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10000"
                        id="cost_per_night"
                        name="cost_per_night"
                        bind:value={costPerNight}
                        placeholder="0.00"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      {#if errors.cost}
                        <p class="mt-1 text-sm text-red-600">{errors.cost}</p>
                      {/if}
                    </div>
                  </div>
                </FormSection>

                <FormSection
                  title="Site Policies & Information"
                  icon={FileText}
                >
                  <div class="space-y-4">
                    <div>
                      <label
                        for="site_type"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Site Type *
                        <Tooltip
                          text="Whether this is a public or private campground"
                        />
                      </label>
                      <select
                        id="site_type"
                        name="site_type"
                        bind:value={siteType}
                        required
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select site type...</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="public_private_partnership"
                          >Public-Private Partnership</option
                        >
                      </select>
                      {#if errors.siteType}
                        <p class="mt-1 text-sm text-red-600">
                          {errors.siteType}
                        </p>
                      {/if}
                    </div>

                    <div>
                      <label
                        for="pet_policy"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Pet Policy *
                        <Tooltip
                          text="Policy regarding pets at this campground"
                        />
                      </label>
                      <select
                        id="pet_policy"
                        name="pet_policy"
                        bind:value={petPolicy}
                        required
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select pet policy...</option>
                        <option value="allowed">Pets Allowed</option>
                        <option value="not_allowed">Pets Not Allowed</option>
                        <option value="restricted"
                          >Restricted (e.g., leashed only)</option
                        >
                      </select>
                      {#if errors.petPolicy}
                        <p class="mt-1 text-sm text-red-600">
                          {errors.petPolicy}
                        </p>
                      {/if}
                    </div>

                    <div>
                      <label
                        for="fire_policy"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Fire Policy *
                        <Tooltip text="Policy regarding campfires" />
                      </label>
                      <select
                        id="fire_policy"
                        name="fire_policy"
                        bind:value={firePolicy}
                        required
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select fire policy...</option>
                        <option value="allowed">Fires Allowed</option>
                        <option value="not_allowed">Fires Not Allowed</option>
                        <option value="fire_pits_only">Fire Pits Only</option>
                        <option value="seasonal"
                          >Seasonal (varies by time of year)</option
                        >
                      </select>
                      {#if errors.firePolicy}
                        <p class="mt-1 text-sm text-red-600">
                          {errors.firePolicy}
                        </p>
                      {/if}
                    </div>

                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        name="reservation_required"
                        bind:checked={reservationRequired}
                        class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span class="ml-2 text-sm text-gray-700"
                        >Reservation Required</span
                      >
                      <Tooltip
                        text="Check if advance reservations are mandatory"
                      />
                    </label>

                    <div>
                      <div
                        class="block text-sm font-medium text-gray-700 mb-2"
                        id="operating-season-label"
                      >
                        Operating Season
                        <Tooltip text="Dates when the campground is open" />
                      </div>
                      <div
                        class="grid grid-cols-2 gap-4"
                        role="group"
                        aria-labelledby="operating-season-label"
                      >
                        <div>
                          <label
                            for="season_start"
                            class="block text-xs text-gray-600 mb-1"
                            >Start</label
                          >
                          <input
                            type="text"
                            id="season_start"
                            name="operating_season_start"
                            bind:value={operatingSeasonStart}
                            placeholder="e.g., May 1 or Year-round"
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label
                            for="season_end"
                            class="block text-xs text-gray-600 mb-1">End</label
                          >
                          <input
                            type="text"
                            id="season_end"
                            name="operating_season_end"
                            bind:value={operatingSeasonEnd}
                            placeholder="e.g., October 31"
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </FormSection>
              </div>
            {/if}
          </MultiStepForm>
        </form>
      {/if}
    </div>
  </div>
</div>

{#if showSuccess}
  <SuccessAnimation message={successMessage} />
{/if}

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
</style>
