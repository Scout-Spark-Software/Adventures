<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { goto } from "$app/navigation";
  import { enhance } from "$app/forms";
  import LocationPicker from "$lib/components/LocationPicker.svelte";

  export let data: PageData;
  export let form: ActionData;

  $: isAdmin = data.userRole === "admin";

  let selectedField = "";
  let newValue = "";
  let reason = "";
  let loading = false;

  // Location fields
  let address = data.address?.address || "";
  let city = data.address?.city || "";
  let state = data.address?.state || "";
  let country = data.address?.country || "";
  let postalCode = data.address?.postalCode || "";
  let latitude = data.address?.latitude || null;
  let longitude = data.address?.longitude || null;

  const editableFields = [
    { key: "name", label: "Name", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    {
      key: "difficulty",
      label: "Difficulty",
      type: "select",
      options: ["easy", "moderate", "hard", "very_hard"],
    },
    { key: "distance", label: "Distance", type: "number" },
    { key: "duration", label: "Duration", type: "number" },
    { key: "elevation", label: "Elevation Gain", type: "number" },
    { key: "trailType", label: "Trail Type", type: "text" },
    { key: "permitsRequired", label: "Permits Required", type: "textarea" },
    { key: "parkingInfo", label: "Parking Info", type: "textarea" },
    { key: "location", label: "Location", type: "location" },
  ];

  function getCurrentValue(field: string): string {
    const hike = data.hike as Record<string, any>;
    return String(hike[field] || "");
  }

  function handleFieldChange() {
    if (selectedField) {
      newValue = getCurrentValue(selectedField);
    } else {
      newValue = "";
    }
  }

  function handleCancel() {
    goto(`/hikes/${data.hike.id}`);
  }
</script>

<svelte:head>
  <title
    >{isAdmin ? "Edit" : "Suggest Edit for"}
    {data.hike.name} - Adventure Spark</title
  >
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-6">
      <button
        on:click={handleCancel}
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <svg
          class="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to hike
      </button>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">
          {isAdmin ? "Edit Hike" : "Suggest Edit"}
        </h1>
        <p class="mt-2 text-gray-600">
          {data.hike.name}
        </p>
      </div>

      {#if form?.success}
        <div class="mb-6 rounded-md bg-green-50 p-4">
          <div class="flex">
            <svg
              class="h-5 w-5 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">
                {form.message}
              </p>
            </div>
          </div>
        </div>
      {/if}

      {#if form?.error}
        <div class="mb-6 rounded-md bg-red-50 p-4">
          <p class="text-sm text-red-800">{form.error}</p>
        </div>
      {/if}

      <form
        method="POST"
        action="?/updateField"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            loading = false;
            await update();
          };
        }}
        class="space-y-6"
      >
        <div>
          <label
            for="field"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Field to Edit *
          </label>
          <select
            id="field"
            name="fieldName"
            bind:value={selectedField}
            on:change={handleFieldChange}
            required
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a field...</option>
            {#each editableFields as field}
              <option value={field.key}>{field.label}</option>
            {/each}
          </select>
        </div>

        {#if selectedField}
          {@const field = editableFields.find((f) => f.key === selectedField)}
          {#if field}
            <div>
              {#if field.type === "location"}
                <h3 class="text-sm font-medium text-gray-700 mb-3">
                  Update Location
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
                <input type="hidden" name="address" value={address} />
                <input type="hidden" name="city" value={city} />
                <input type="hidden" name="state" value={state} />
                <input type="hidden" name="country" value={country} />
                <input type="hidden" name="postal_code" value={postalCode} />
                <input type="hidden" name="latitude" value={latitude} />
                <input type="hidden" name="longitude" value={longitude} />
                {#if data.address}
                  <p class="mt-3 text-xs text-gray-500">
                    Current: {data.address.city || ""}{data.address.city &&
                    data.address.state
                      ? ", "
                      : ""}{data.address.state || ""}
                  </p>
                {/if}
              {:else}
                <label
                  for="value"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Value *
                </label>
                {#if field.type === "textarea"}
                  <textarea
                    id="value"
                    name="newValue"
                    bind:value={newValue}
                    required
                    rows="4"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                {:else if field.type === "select"}
                  <select
                    id="value"
                    name="newValue"
                    bind:value={newValue}
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select {field.label}...</option>
                    {#each field.options || [] as option}
                      <option value={option}
                        >{option.replace("_", " ").charAt(0).toUpperCase() +
                          option.replace("_", " ").slice(1)}</option
                      >
                    {/each}
                  </select>
                {:else if field.type === "number"}
                  <input
                    type="number"
                    id="value"
                    name="newValue"
                    bind:value={newValue}
                    required
                    step="0.1"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                {:else}
                  <input
                    type="text"
                    id="value"
                    name="newValue"
                    bind:value={newValue}
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                {/if}
                <p class="mt-1 text-xs text-gray-500">
                  Current: {getCurrentValue(selectedField) || "(not set)"}
                </p>
              {/if}
            </div>
          {/if}

          {#if !isAdmin}
            <div>
              <label
                for="reason"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Reason for Change
              </label>
              <textarea
                id="reason"
                name="reason"
                bind:value={reason}
                rows="3"
                placeholder="Explain why this change should be made..."
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                Help moderators understand your suggested change
              </p>
            </div>
          {/if}
        {/if}

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            on:click={handleCancel}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading ||
              !selectedField ||
              (selectedField !== "location" && !newValue) ||
              (selectedField === "location" && (!city || !state))}
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if loading}
              <span class="flex items-center gap-2">
                <svg
                  class="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
              </span>
            {:else}
              {isAdmin ? "Update Hike" : "Submit Suggestion"}
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
