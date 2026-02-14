<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  let activeTab: "features" | "amenities" | "facilities" = "features";
  let editingItem: any = null;
  let isCreating = false;
  let formData = {
    name: "",
    key: "",
    description: "",
    icon: "",
    displayOrder: 0,
    active: true,
  };

  function startCreate(type: string) {
    isCreating = true;
    editingItem = null;
    formData = {
      name: "",
      key: type === "features" ? "" : "",
      description: "",
      icon: "",
      displayOrder: 0,
      active: true,
    };
  }

  function startEdit(item: any) {
    isCreating = false;
    editingItem = item;
    formData = {
      name: item.name,
      key: item.key || "",
      description: item.description || "",
      icon: item.icon || "",
      displayOrder: item.displayOrder,
      active: item.active,
    };
  }

  function cancelEdit() {
    editingItem = null;
    isCreating = false;
    formData = {
      name: "",
      key: "",
      description: "",
      icon: "",
      displayOrder: 0,
      active: true,
    };
  }

  async function saveItem() {
    const endpoint =
      activeTab === "features"
        ? "/api/feature-types"
        : activeTab === "amenities"
          ? "/api/amenity-types"
          : "/api/facility-types";

    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `${endpoint}/${editingItem.id}` : endpoint;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      window.location.reload();
    } else {
      alert("Failed to save item");
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const endpoint =
      activeTab === "features"
        ? `/api/feature-types/${id}`
        : activeTab === "amenities"
          ? `/api/amenity-types/${id}`
          : `/api/facility-types/${id}`;

    const response = await fetch(endpoint, { method: "DELETE" });

    if (response.ok) {
      window.location.reload();
    } else {
      alert("Failed to delete item");
    }
  }

  $: currentItems =
    activeTab === "features"
      ? data.featureTypes
      : activeTab === "amenities"
        ? data.amenityTypes
        : data.facilityTypes;

  $: needsKey = activeTab !== "features";
</script>

<svelte:head>
  <title>Manage Types - Admin - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Manage Types</h1>
      <a href="/admin" class="text-indigo-600 hover:text-indigo-800 font-medium"> Back to Admin </a>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          on:click={() => (activeTab = "features")}
          class={`${
            activeTab === "features"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Hike Features
        </button>
        <button
          on:click={() => (activeTab = "amenities")}
          class={`${
            activeTab === "amenities"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Camping Amenities
        </button>
        <button
          on:click={() => (activeTab = "facilities")}
          class={`${
            activeTab === "facilities"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Camping Facilities
        </button>
      </nav>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- List -->
      <div class="lg:col-span-2">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-medium text-gray-900">
                {activeTab === "features"
                  ? "Features"
                  : activeTab === "amenities"
                    ? "Amenities"
                    : "Facilities"}
              </h2>
              <button
                on:click={() => startCreate(activeTab)}
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add New
              </button>
            </div>

            <div class="space-y-2">
              {#each currentItems as item}
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex-1">
                    <div class="flex items-center">
                      <span class="font-medium text-gray-900">{item.name}</span>
                      {#if !item.active}
                        <span
                          class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800"
                        >
                          Inactive
                        </span>
                      {/if}
                    </div>
                    {#if item.description}
                      <p class="text-sm text-gray-500 mt-1">
                        {item.description}
                      </p>
                    {/if}
                    {#if item.key}
                      <p class="text-xs text-gray-400 mt-1">Key: {item.key}</p>
                    {/if}
                  </div>
                  <div class="flex items-center space-x-2 ml-4">
                    <span class="text-sm text-gray-500">Order: {item.displayOrder}</span>
                    <button
                      on:click={() => startEdit(item)}
                      class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      on:click={() => deleteItem(item.id)}
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              {:else}
                <p class="text-gray-500 text-center py-4">No items found</p>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Form -->
      {#if editingItem || isCreating}
        <div class="lg:col-span-1">
          <div class="bg-white shadow rounded-lg sticky top-4">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {isCreating ? "Create New" : "Edit"}
                {activeTab === "features"
                  ? "Feature"
                  : activeTab === "amenities"
                    ? "Amenity"
                    : "Facility"}
              </h3>

              <div class="space-y-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700"> Name * </label>
                  <input
                    type="text"
                    id="name"
                    bind:value={formData.name}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {#if needsKey}
                  <div>
                    <label for="key" class="block text-sm font-medium text-gray-700">
                      Key * (camelCase, e.g., 'firePits')
                    </label>
                    <input
                      type="text"
                      id="key"
                      bind:value={formData.key}
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                {/if}

                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    bind:value={formData.description}
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div>
                  <label for="displayOrder" class="block text-sm font-medium text-gray-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="displayOrder"
                    bind:value={formData.displayOrder}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    bind:checked={formData.active}
                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label for="active" class="ml-2 text-sm text-gray-700"> Active </label>
                </div>

                <div class="flex space-x-3">
                  <button
                    on:click={saveItem}
                    class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save
                  </button>
                  <button
                    on:click={cancelEdit}
                    class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
