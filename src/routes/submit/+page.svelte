<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import type { PageData } from "./$types";
  import LocationPicker from "$lib/components/LocationPicker.svelte";
  import CouncilSelect from "$lib/components/CouncilSelect.svelte";
  import WaypointMap from "$lib/components/WaypointMap.svelte";
  import FormSection from "$lib/components/FormSection.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";
  import SuccessAnimation from "$lib/components/SuccessAnimation.svelte";
  import { Star, CircleCheck, Building, DollarSign, FileText, ImagePlus, X } from "lucide-svelte";

  export let data: PageData;

  const typeParam = $page.url.searchParams.get("type");
  let type: "hike" | "camping_site" | "backpacking" =
    typeParam === "camping_site" || typeParam === "backpacking" ? typeParam : "hike";
  let loading = false;
  let uploadingPhotos = false;
  let errors: Record<string, string> = {};
  let submitError: string | null = null;

  // Success animation state
  let showSuccess = false;
  let successMessage = "";

  // Staged photos — selected but not yet uploaded
  let stagedPhotos: Array<{ file: File; previewUrl: string; isBanner: boolean }> = [];

  function addPhotos(files: FileList | null) {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = URL.createObjectURL(file);
      const isBanner = stagedPhotos.length === 0 && i === 0;
      stagedPhotos = [...stagedPhotos, { file, previewUrl, isBanner }];
    }
  }

  function removeStagedPhoto(index: number) {
    URL.revokeObjectURL(stagedPhotos[index].previewUrl);
    const wasBanner = stagedPhotos[index].isBanner;
    stagedPhotos = stagedPhotos.filter((_, i) => i !== index);
    if (wasBanner && stagedPhotos.length > 0) {
      stagedPhotos = stagedPhotos.map((p, i) => ({ ...p, isBanner: i === 0 }));
    }
  }

  function setStagedBanner(index: number) {
    stagedPhotos = stagedPhotos.map((p, i) => ({ ...p, isBanner: i === index }));
  }

  // Location fields
  let address = "";
  let city = "";
  let state = "";
  let country = "";
  let postalCode = "";
  let latitude: number | null = null;
  let longitude: number | null = null;

  // Hike-specific fields
  let hikeName = "";
  let hikeDescription = "";
  let difficulty = "";
  let distance: number | null = null;
  let distanceUnit: "miles" | "kilometers" = "miles";
  let duration: number | null = null;
  let durationUnit: "minutes" | "hours" = "hours";
  let elevation: number | null = null;
  let elevationUnit: "feet" | "meters" = "feet";
  let trailType = "";
  let selectedFeatures: string[] = [];
  let permitsRequired = "";
  let bestSeasons: string[] = [];
  let waterSources = false;
  let parkingInfo = "";

  // Backpacking-specific fields
  let backpackingName = "";
  let backpackingDescription = "";
  let numberOfDays: number | null = null;
  let numberOfNights: number | null = null;
  let campingStyle = "";
  let waterAvailability = "";
  let backpackingDifficulty = "";
  let backpackingDistance: number | null = null;
  let backpackingDistanceUnit: "miles" | "kilometers" = "miles";
  let backpackingElevation: number | null = null;
  let backpackingElevationUnit: "feet" | "meters" = "feet";
  let backpackingTrailType = "";
  let backpackingPermitsRequired = "";
  let backpackingParkingInfo = "";
  let backpackingDogFriendly = false;
  let backpackingWaypoints: Array<{ lat: number; lng: number; label?: string }> = [];

  // Camping-specific fields
  let campingName = "";
  let campingDescription = "";
  let capacity = "";
  let reservationInfo = "";
  let costPerNight: number | null = null;
  let baseFee: number | null = null;
  let operatingSeasonStart = "";
  let operatingSeasonEnd = "";
  let petPolicy = "";
  let reservationRequired = false;
  let siteType = "";
  let firePolicy = "";

  // Council selection (shared across all form types)
  let councilId = "";

  // Dynamic amenities/facilities from database
  let amenities: Record<string, boolean> = {};
  $: {
    if (data.amenityTypes) {
      amenities = data.amenityTypes.reduce((acc: Record<string, boolean>, t: any) => {
        if (!(t.key in acc)) acc[t.key] = false;
        return acc;
      }, amenities);
    }
  }

  let facilities: Record<string, boolean> = {};
  $: {
    if (data.facilityTypes) {
      facilities = data.facilityTypes.reduce((acc: Record<string, boolean>, t: any) => {
        if (!(t.key in acc)) acc[t.key] = false;
        return acc;
      }, facilities);
    }
  }

  // Real-time character limit validation
  $: permitsError = permitsRequired.length > 500 ? "Must be less than 500 characters" : "";
  $: parkingError = parkingInfo.length > 1000 ? "Must be less than 1000 characters" : "";

  function validateForm(): boolean {
    errors = {};
    submitError = null;

    if (type === "backpacking") {
      if (!backpackingName.trim()) {
        errors.name = "Name is required";
        document
          .getElementById("backpacking-name")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      if (!city || !state) {
        errors.address = "City and State are required";
        document.getElementById("city")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      return true;
    }

    if (type === "hike") {
      if (!hikeName.trim()) {
        errors.name = "Name is required";
        document
          .getElementById("hike-name")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      if (!city || !state) {
        errors.address = "City and State are required";
        document.getElementById("city")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      if (permitsRequired.length > 500) {
        errors.permits = "Permits info must be less than 500 characters";
        return false;
      }
      if (parkingInfo.length > 1000) {
        errors.parking = "Parking info must be less than 1000 characters";
        return false;
      }
    } else {
      if (!campingName.trim()) {
        errors.name = "Name is required";
        document
          .getElementById("camping-name")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      if (!city || !state) {
        errors.address = "City and State are required";
        document.getElementById("city")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      if (!petPolicy) {
        errors.petPolicy = "Pet policy is required";
        document
          .getElementById("pet_policy")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      if (!siteType) {
        errors.siteType = "Site type is required";
        document
          .getElementById("site_type")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      if (!firePolicy) {
        errors.firePolicy = "Fire policy is required";
        document
          .getElementById("fire_policy")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
    }

    return true;
  }

  function makeEnhanceHandler(entityType: "hike" | "camping_site" | "backpacking") {
    return () => {
      if (!validateForm()) {
        // Return a no-op so SvelteKit doesn't run the default update
        return async () => {};
      }

      loading = true;

      return async ({ result }: any) => {
        if (result.type === "success" && result.data?.created) {
          const entityId = result.data.id;

          // Upload staged photos after entity is created
          if (stagedPhotos.length > 0) {
            uploadingPhotos = true;
            try {
              for (const photo of stagedPhotos) {
                const fd = new FormData();
                fd.append("file", photo.file);
                fd.append("entity_type", entityType);
                fd.append("entity_id", entityId);
                fd.append("file_type", "image");
                if (photo.isBanner) fd.append("is_banner", "true");
                await fetch("/api/upload", { method: "POST", body: fd });
              }
            } catch {
              submitError = "Some photos failed to upload, but your submission was saved.";
            } finally {
              uploadingPhotos = false;
            }
          }

          loading = false;
          showSuccess = true;
          successMessage =
            entityType === "hike"
              ? "Your hike has been submitted for review!"
              : entityType === "backpacking"
                ? "Your backpacking route has been submitted for review!"
                : "Your camping site has been submitted for review!";
          const path =
            entityType === "hike"
              ? `/hikes/${entityId}`
              : entityType === "backpacking"
                ? `/backpacking/${entityId}`
                : `/camping/${entityId}`;
          setTimeout(() => goto(path), 2500);
        } else if (result.type === "failure") {
          loading = false;
          submitError = result.data?.error ?? "Submission failed. Please try again.";
        } else {
          loading = false;
          submitError = "Submission failed. Please try again.";
        }
      };
    };
  }
</script>

<svelte:head>
  <title>Submit Adventure — Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-stone-100">
  <!-- Page header -->
  <div class="bg-white border-b border-stone-200">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm" style="background: linear-gradient(135deg, #059669, #34d399);">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-stone-400 mb-0.5">Community</p>
          <h1 class="text-2xl font-black text-stone-900 leading-tight">Submit an Adventure</h1>
        </div>
      </div>
      <p class="text-sm text-stone-500 mt-4 ml-16">
        Fill out the details below and your submission will be reviewed before going live.
      </p>
    </div>
  </div>

  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- Type selector -->
    <div class="bg-white shadow rounded-lg p-5 mb-6">
      <label for="submission-type" class="block text-sm font-medium text-gray-700 mb-2">Type</label>
      <select
        id="submission-type"
        bind:value={type}
        class="block w-full rounded-md border-gray-300 shadow-sm"
      >
        <option value="hike">Hike</option>
        <option value="camping_site">Camping Site</option>
        <option value="backpacking">Backpacking Route</option>
      </select>
    </div>

    {#if type === "hike"}
      <form method="POST" action="?/submitHike" use:enhance={makeEnhanceHandler("hike")}>
        <div class="bg-white shadow rounded-lg divide-y divide-gray-200">
          <!-- Basic Info -->
          <div class="p-6 space-y-4">
            <h2 class="text-base font-semibold text-gray-900">Basic Information</h2>
            <div>
              <label for="hike-name" class="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="hike-name"
                name="name"
                bind:value={hikeName}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                class:border-red-500={errors.name}
              />
              {#if errors.name}
                <p class="mt-1 text-sm text-red-600">{errors.name}</p>
              {/if}
            </div>
            <div>
              <label for="hike-description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="hike-description"
                name="description"
                bind:value={hikeDescription}
                rows="3"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              ></textarea>
            </div>
            <div>
              <label for="hike-council" class="block text-sm font-medium text-gray-700 mb-1">
                BSA Council
              </label>
              <CouncilSelect
                id="hike-council"
                bind:value={councilId}
                councils={data.councils}
                placeholder="Select a council (optional)"
                selectClass="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input type="hidden" name="council_id" value={councilId} />
            </div>
          </div>

          <!-- Location -->
          <div class="p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">Location</h2>
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
              <p class="mt-2 text-sm text-red-600">{errors.address}</p>
            {/if}
          </div>

          <!-- Trail Details -->
          <div class="p-6 space-y-4">
            <h2 class="text-base font-semibold text-gray-900">Trail Details</h2>
            <div>
              <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-1">
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="distance" class="block text-sm font-medium text-gray-700 mb-1">
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
                <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="elevation" class="block text-sm font-medium text-gray-700 mb-1">
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
                <label for="trail_type" class="block text-sm font-medium text-gray-700 mb-1">
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

          <!-- Features & Conditions -->
          <div class="p-6 space-y-6">
            <h2 class="text-base font-semibold text-gray-900">Features & Conditions</h2>
            <FormSection title="Features" icon={Star}>
              <div class="grid grid-cols-2 gap-3">
                {#each data.featureTypes as feature (feature.name)}
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      value={feature.name}
                      bind:group={selectedFeatures}
                      class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">{feature.name}</span>
                  </label>
                {/each}
              </div>
              <input type="hidden" name="features" value={JSON.stringify(selectedFeatures)} />
            </FormSection>

            <FormSection
              title="Trail Conditions & Access"
              icon={CircleCheck}
              description="Additional information about trail conditions and access requirements"
            >
              <div class="space-y-4">
                <div>
                  <label for="permits" class="block text-sm font-medium text-gray-700 mb-1">
                    Permits or Passes Required
                    <Tooltip text="Describe any permits, parking passes, or fees needed" />
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
                  <div class="block text-sm font-medium text-gray-700 mb-2" id="best-season-label">
                    Best Season to Visit
                    <Tooltip text="Select all seasons when this trail is enjoyable" />
                  </div>
                  <div
                    class="grid grid-cols-2 gap-3"
                    role="group"
                    aria-labelledby="best-season-label"
                  >
                    {#each ["Spring", "Summer", "Fall", "Winter"] as season (season)}
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          value={season.toLowerCase()}
                          bind:group={bestSeasons}
                          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span class="ml-2 text-sm text-gray-700">{season}</span>
                      </label>
                    {/each}
                  </div>
                  <input type="hidden" name="best_season" value={JSON.stringify(bestSeasons)} />
                </div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    name="water_sources"
                    bind:checked={waterSources}
                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Water sources available on trail</span>
                  <Tooltip text="Natural water sources like streams or lakes along the trail" />
                </label>
                <div>
                  <label for="parking" class="block text-sm font-medium text-gray-700 mb-1">
                    Parking Information
                    <Tooltip text="Details about parking availability, capacity, and fees" />
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
                    <p class="mt-1 text-xs text-gray-500">{parkingInfo.length}/1000 characters</p>
                  {/if}
                </div>
              </div>
            </FormSection>
          </div>

          <!-- Photos -->
          <div class="p-6 space-y-4">
            <h2 class="text-base font-semibold text-gray-900">Photos</h2>
            <p class="text-sm text-gray-500">
              Add photos to help others find and recognize this trail. The starred photo will be
              used as the banner image.
            </p>
            <div>
              <label
                for="hike-photo-input"
                class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <ImagePlus size={16} />
                Add Photos
              </label>
              <input
                id="hike-photo-input"
                type="file"
                accept="image/*"
                multiple
                on:change={(e) => {
                  addPhotos(e.currentTarget.files);
                  e.currentTarget.value = "";
                }}
                class="sr-only"
              />
              <p class="mt-1 text-xs text-gray-500">JPEG, PNG, WebP — up to 10MB each</p>
            </div>
            {#if stagedPhotos.length > 0}
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {#each stagedPhotos as photo, i (photo.previewUrl)}
                  <div class="relative group">
                    <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photo.previewUrl}
                        alt="Photo {i + 1}"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      on:click={() => setStagedBanner(i)}
                      title={photo.isBanner ? "Banner image" : "Set as banner"}
                      class="absolute top-1 left-1 p-1 rounded-full transition-all {photo.isBanner
                        ? 'bg-amber-400 text-white'
                        : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-amber-500'}"
                    >
                      <Star size={14} />
                    </button>
                    <button
                      type="button"
                      on:click={() => removeStagedPhoto(i)}
                      title="Remove photo"
                      class="absolute top-1 right-1 p-1 rounded-full bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <X size={14} />
                    </button>
                    {#if photo.isBanner}
                      <span
                        class="absolute bottom-1 left-1 text-xs bg-amber-400 text-white px-1.5 py-0.5 rounded font-medium"
                      >
                        Banner
                      </span>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Submit -->
          <div class="p-6">
            {#if submitError}
              <p class="mb-4 text-sm text-red-600">{submitError}</p>
            {/if}
            <button
              type="submit"
              disabled={loading}
              class="w-full flex justify-center items-center gap-2 px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {#if uploadingPhotos}
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading photos...
              {:else if loading}
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              {:else}
                Submit Hike
              {/if}
            </button>
          </div>
        </div>
      </form>
    {:else if type === "backpacking"}
      <form
        method="POST"
        action="?/submitBackpacking"
        use:enhance={makeEnhanceHandler("backpacking")}
      >
        <div class="bg-white shadow rounded-lg divide-y divide-gray-200">
          <!-- Basic Info -->
          <div class="p-6 space-y-4">
            <h2 class="text-base font-semibold text-gray-900">Basic Information</h2>
            <div>
              <label for="backpacking-name" class="block text-sm font-medium text-gray-700 mb-1">
                Route Name *
              </label>
              <input
                type="text"
                id="backpacking-name"
                name="name"
                bind:value={backpackingName}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                class:border-red-500={errors.name}
              />
              {#if errors.name}
                <p class="mt-1 text-sm text-red-600">{errors.name}</p>
              {/if}
            </div>
            <div>
              <label
                for="backpacking-description"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="backpacking-description"
                name="description"
                bind:value={backpackingDescription}
                rows="3"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              ></textarea>
            </div>
            <div>
              <label
                for="backpacking-council"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                BSA Council
              </label>
              <CouncilSelect
                id="backpacking-council"
                bind:value={councilId}
                councils={data.councils}
                placeholder="Select a council (optional)"
                selectClass="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input type="hidden" name="council_id" value={councilId} />
            </div>
          </div>

          <!-- Location -->
          <div class="p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">Location</h2>
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
              <p class="mt-2 text-sm text-red-600">{errors.address}</p>
            {/if}
          </div>

          <!-- Waypoints -->
          <div class="p-6 space-y-3">
            <h2 class="text-base font-semibold text-gray-900">Route Waypoints</h2>
            <p class="text-sm text-gray-500">
              Optionally plot the route by clicking on the map to add waypoints in order. You can
              drag markers to adjust positions or right-click to remove them.
            </p>
            <WaypointMap
              bind:waypoints={backpackingWaypoints}
              editable
              height="320px"
              referenceLat={latitude}
              referenceLng={longitude}
              referenceLabel={city ? `${city}${state ? ", " + state : ""}` : "Entered location"}
            />
            {#if backpackingWaypoints.length > 0}
              <ul class="mt-2 space-y-1">
                {#each backpackingWaypoints as wp, i (i)}
                  <li class="flex items-center gap-2 text-xs text-gray-600">
                    <span
                      class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]"
                    >{i + 1}</span>
                    <input
                      type="text"
                      bind:value={wp.label}
                      placeholder="Label (optional)"
                      class="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span class="text-gray-400 font-mono"
                      >{wp.lat.toFixed(5)}, {wp.lng.toFixed(5)}</span
                    >
                  </li>
                {/each}
              </ul>
            {/if}
            <input type="hidden" name="waypoints" value={JSON.stringify(backpackingWaypoints)} />
          </div>

          <!-- Trail Details -->
          <div class="p-6 space-y-4">
            <h2 class="text-base font-semibold text-gray-900">Route Details</h2>
            <div>
              <label
                for="backpacking-difficulty"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Difficulty
              </label>
              <select
                id="backpacking-difficulty"
                name="difficulty"
                bind:value={backpackingDifficulty}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select difficulty...</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
                <option value="very_hard">Very Hard</option>
              </select>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  for="backpacking-distance"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Total Distance
                </label>
                <div class="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    id="backpacking-distance"
                    name="distance"
                    bind:value={backpackingDistance}
                    placeholder="25"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <select
                    name="distance_unit"
                    bind:value={backpackingDistanceUnit}
                    class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="miles">mi</option>
                    <option value="kilometers">km</option>
                  </select>
                </div>
              </div>
              <div>
                <label
                  for="backpacking-elevation"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Elevation Gain
                </label>
                <div class="flex gap-2">
                  <input
                    type="number"
                    step="1"
                    id="backpacking-elevation"
                    name="elevation"
                    bind:value={backpackingElevation}
                    placeholder="3000"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <select
                    name="elevation_unit"
                    bind:value={backpackingElevationUnit}
                    class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="feet">ft</option>
                    <option value="meters">m</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="number-of-days" class="block text-sm font-medium text-gray-700 mb-1">
                  Number of Days
                </label>
                <input
                  type="number"
                  min="1"
                  id="number-of-days"
                  name="number_of_days"
                  bind:value={numberOfDays}
                  placeholder="4"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label for="number-of-nights" class="block text-sm font-medium text-gray-700 mb-1">
                  Number of Nights
                </label>
                <input
                  type="number"
                  min="0"
                  id="number-of-nights"
                  name="number_of_nights"
                  bind:value={numberOfNights}
                  placeholder="3"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="camping-style" class="block text-sm font-medium text-gray-700 mb-1">
                  Camping Style
                </label>
                <select
                  id="camping-style"
                  name="camping_style"
                  bind:value={campingStyle}
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select camping style...</option>
                  <option value="dispersed">Dispersed Camping</option>
                  <option value="designated_sites">Designated Sites</option>
                  <option value="hut_to_hut">Hut to Hut</option>
                </select>
              </div>
              <div>
                <label
                  for="backpacking-trail-type"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Trail Type
                </label>
                <select
                  id="backpacking-trail-type"
                  name="trail_type"
                  bind:value={backpackingTrailType}
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select trail type...</option>
                  <option value="loop">Loop</option>
                  <option value="out_and_back">Out and Back</option>
                  <option value="point_to_point">Point to Point</option>
                </select>
              </div>
            </div>
            <div>
              <label for="water-availability" class="block text-sm font-medium text-gray-700 mb-1">
                Water Availability
              </label>
              <textarea
                id="water-availability"
                name="water_availability"
                bind:value={waterAvailability}
                rows="2"
                placeholder="e.g., Seasonal streams at miles 5 and 12, requires treatment"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              ></textarea>
            </div>
            <div>
              <label for="backpacking-permits" class="block text-sm font-medium text-gray-700 mb-1">
                Permits or Passes Required
              </label>
              <textarea
                id="backpacking-permits"
                name="permits_required"
                bind:value={backpackingPermitsRequired}
                rows="2"
                maxlength="500"
                placeholder="e.g., Wilderness permit required, quota system in summer"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              ></textarea>
            </div>
            <div>
              <label for="backpacking-parking" class="block text-sm font-medium text-gray-700 mb-1">
                Parking Information
              </label>
              <textarea
                id="backpacking-parking"
                name="parking_info"
                bind:value={backpackingParkingInfo}
                rows="2"
                maxlength="1000"
                placeholder="e.g., Trailhead parking lot, 20 spaces, self-pay station"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              ></textarea>
            </div>
            <label class="flex items-center">
              <input
                type="checkbox"
                name="dog_friendly"
                bind:checked={backpackingDogFriendly}
                class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="ml-2 text-sm text-gray-700">Dog Friendly</span>
            </label>
          </div>

          <!-- Photos -->
          <div class="p-6 space-y-4">
            <h2 class="text-base font-semibold text-gray-900">Photos</h2>
            <p class="text-sm text-gray-500">
              Add photos to help others find and recognize this route. The starred photo will be
              used as the banner image.
            </p>
            <div>
              <label
                for="backpacking-photo-input"
                class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <ImagePlus size={16} />
                Add Photos
              </label>
              <input
                id="backpacking-photo-input"
                type="file"
                accept="image/*"
                multiple
                on:change={(e) => {
                  addPhotos(e.currentTarget.files);
                  e.currentTarget.value = "";
                }}
                class="sr-only"
              />
              <p class="mt-1 text-xs text-gray-500">JPEG, PNG, WebP — up to 10MB each</p>
            </div>
            {#if stagedPhotos.length > 0}
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {#each stagedPhotos as photo, i (photo.previewUrl)}
                  <div class="relative group">
                    <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photo.previewUrl}
                        alt="Photo {i + 1}"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      on:click={() => setStagedBanner(i)}
                      title={photo.isBanner ? "Banner image" : "Set as banner"}
                      class="absolute top-1 left-1 p-1 rounded-full transition-all {photo.isBanner
                        ? 'bg-amber-400 text-white'
                        : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-amber-500'}"
                    >
                      <Star size={14} />
                    </button>
                    <button
                      type="button"
                      on:click={() => removeStagedPhoto(i)}
                      title="Remove photo"
                      class="absolute top-1 right-1 p-1 rounded-full bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <X size={14} />
                    </button>
                    {#if photo.isBanner}
                      <span
                        class="absolute bottom-1 left-1 text-xs bg-amber-400 text-white px-1.5 py-0.5 rounded font-medium"
                      >
                        Banner
                      </span>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Submit -->
          <div class="p-6">
            {#if submitError}
              <p class="mb-4 text-sm text-red-600">{submitError}</p>
            {/if}
            <button
              type="submit"
              disabled={loading}
              class="w-full flex justify-center items-center gap-2 px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {#if uploadingPhotos}
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading photos...
              {:else if loading}
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              {:else}
                Submit Backpacking Route
              {/if}
            </button>
          </div>
        </div>
      </form>
    {:else}
      <form
        method="POST"
        action="?/submitCampingSite"
        use:enhance={makeEnhanceHandler("camping_site")}
      >
        <div class="bg-white shadow rounded-lg divide-y divide-gray-200">
          <!-- Basic Info -->
          <div class="p-6 space-y-4">
            <h2 class="text-base font-semibold text-gray-900">Basic Information</h2>
            <div>
              <label for="camping-name" class="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="camping-name"
                name="name"
                bind:value={campingName}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                class:border-red-500={errors.name}
              />
              {#if errors.name}
                <p class="mt-1 text-sm text-red-600">{errors.name}</p>
              {/if}
            </div>
            <div>
              <label for="camping-description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="camping-description"
                name="description"
                bind:value={campingDescription}
                rows="3"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              ></textarea>
            </div>
            <div>
              <label for="camping-council" class="block text-sm font-medium text-gray-700 mb-1">
                BSA Council
              </label>
              <CouncilSelect
                id="camping-council"
                bind:value={councilId}
                councils={data.councils}
                placeholder="Select a council (optional)"
                selectClass="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input type="hidden" name="council_id" value={councilId} />
            </div>
          </div>

          <!-- Location -->
          <div class="p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">Location</h2>
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
              <p class="mt-2 text-sm text-red-600">{errors.address}</p>
            {/if}
          </div>

          <!-- Site Details -->
          <div class="p-6 space-y-4">
            <h2 class="text-base font-semibold text-gray-900">Site Details</h2>
            <div>
              <label for="capacity" class="block text-sm font-medium text-gray-700 mb-1">
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
              <label for="reservation_info" class="block text-sm font-medium text-gray-700 mb-1">
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

          <!-- Amenities & Facilities -->
          <div class="p-6 space-y-6">
            <h2 class="text-base font-semibold text-gray-900">Amenities & Facilities</h2>
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">Amenities</h3>
              <div class="grid grid-cols-2 gap-3">
                {#each data.amenityTypes as amenity (amenity.key)}
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      bind:checked={amenities[amenity.key]}
                      class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">{amenity.name}</span>
                  </label>
                {/each}
              </div>
              <input type="hidden" name="amenities" value={JSON.stringify(amenities)} />
            </div>
            <FormSection title="Facilities" icon={Building}>
              <div class="grid grid-cols-2 gap-3">
                {#each data.facilityTypes as facility (facility.key)}
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      bind:checked={facilities[facility.key]}
                      class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">{facility.name}</span>
                  </label>
                {/each}
              </div>
              <input type="hidden" name="facilities" value={JSON.stringify(facilities)} />
            </FormSection>
          </div>

          <!-- Cost & Policies -->
          <div class="p-6 space-y-6">
            <h2 class="text-base font-semibold text-gray-900">Cost & Policies</h2>
            <FormSection title="Cost & Fees" icon={DollarSign}>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="base_fee" class="block text-sm font-medium text-gray-700 mb-1">
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
                </div>
                <div>
                  <label for="cost_per_night" class="block text-sm font-medium text-gray-700 mb-1">
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
                </div>
              </div>
            </FormSection>

            <FormSection title="Site Policies" icon={FileText}>
              <div class="space-y-4">
                <div>
                  <label for="site_type" class="block text-sm font-medium text-gray-700 mb-1">
                    Site Type *
                    <Tooltip text="Whether this is a public or private campground" />
                  </label>
                  <select
                    id="site_type"
                    name="site_type"
                    bind:value={siteType}
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    class:border-red-500={errors.siteType}
                  >
                    <option value="">Select site type...</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="public_private_partnership">Public-Private Partnership</option>
                  </select>
                  {#if errors.siteType}
                    <p class="mt-1 text-sm text-red-600">{errors.siteType}</p>
                  {/if}
                </div>
                <div>
                  <label for="pet_policy" class="block text-sm font-medium text-gray-700 mb-1">
                    Pet Policy *
                    <Tooltip text="Policy regarding pets at this campground" />
                  </label>
                  <select
                    id="pet_policy"
                    name="pet_policy"
                    bind:value={petPolicy}
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    class:border-red-500={errors.petPolicy}
                  >
                    <option value="">Select pet policy...</option>
                    <option value="allowed">Pets Allowed</option>
                    <option value="not_allowed">Pets Not Allowed</option>
                    <option value="restricted">Restricted (e.g., leashed only)</option>
                  </select>
                  {#if errors.petPolicy}
                    <p class="mt-1 text-sm text-red-600">{errors.petPolicy}</p>
                  {/if}
                </div>
                <div>
                  <label for="fire_policy" class="block text-sm font-medium text-gray-700 mb-1">
                    Fire Policy *
                    <Tooltip text="Policy regarding campfires" />
                  </label>
                  <select
                    id="fire_policy"
                    name="fire_policy"
                    bind:value={firePolicy}
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    class:border-red-500={errors.firePolicy}
                  >
                    <option value="">Select fire policy...</option>
                    <option value="allowed">Fires Allowed</option>
                    <option value="not_allowed">Fires Not Allowed</option>
                    <option value="fire_pits_only">Fire Pits Only</option>
                    <option value="seasonal">Seasonal (varies by time of year)</option>
                  </select>
                  {#if errors.firePolicy}
                    <p class="mt-1 text-sm text-red-600">{errors.firePolicy}</p>
                  {/if}
                </div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    name="reservation_required"
                    bind:checked={reservationRequired}
                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Reservation Required</span>
                  <Tooltip text="Check if advance reservations are mandatory" />
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
                    class="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    role="group"
                    aria-labelledby="operating-season-label"
                  >
                    <div>
                      <label for="season_start" class="block text-xs text-gray-600 mb-1"
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
                      <label for="season_end" class="block text-xs text-gray-600 mb-1">End</label>
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

          <!-- Photos -->
          <div class="p-6 space-y-4">
            <h2 class="text-base font-semibold text-gray-900">Photos</h2>
            <p class="text-sm text-gray-500">
              Add photos of the campsite. The starred photo will be used as the banner image.
            </p>
            <div>
              <label
                for="camping-photo-input"
                class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <ImagePlus size={16} />
                Add Photos
              </label>
              <input
                id="camping-photo-input"
                type="file"
                accept="image/*"
                multiple
                on:change={(e) => {
                  addPhotos(e.currentTarget.files);
                  e.currentTarget.value = "";
                }}
                class="sr-only"
              />
              <p class="mt-1 text-xs text-gray-500">JPEG, PNG, WebP — up to 10MB each</p>
            </div>
            {#if stagedPhotos.length > 0}
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {#each stagedPhotos as photo, i (photo.previewUrl)}
                  <div class="relative group">
                    <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photo.previewUrl}
                        alt="Photo {i + 1}"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      on:click={() => setStagedBanner(i)}
                      title={photo.isBanner ? "Banner image" : "Set as banner"}
                      class="absolute top-1 left-1 p-1 rounded-full transition-all {photo.isBanner
                        ? 'bg-amber-400 text-white'
                        : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-amber-500'}"
                    >
                      <Star size={14} />
                    </button>
                    <button
                      type="button"
                      on:click={() => removeStagedPhoto(i)}
                      title="Remove photo"
                      class="absolute top-1 right-1 p-1 rounded-full bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <X size={14} />
                    </button>
                    {#if photo.isBanner}
                      <span
                        class="absolute bottom-1 left-1 text-xs bg-amber-400 text-white px-1.5 py-0.5 rounded font-medium"
                      >
                        Banner
                      </span>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Submit -->
          <div class="p-6">
            {#if submitError}
              <p class="mb-4 text-sm text-red-600">{submitError}</p>
            {/if}
            <button
              type="submit"
              disabled={loading}
              class="w-full flex justify-center items-center gap-2 px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {#if uploadingPhotos}
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading photos...
              {:else if loading}
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              {:else}
                Submit Camping Site
              {/if}
            </button>
          </div>
        </div>
      </form>
    {/if}
  </div>
</div>

{#if showSuccess}
  <SuccessAnimation message={successMessage} />
{/if}
