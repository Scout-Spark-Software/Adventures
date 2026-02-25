<script lang="ts">
  import { ChevronRight, Tags, Plus, Pencil, Trash2 } from "lucide-svelte";
  import type { PageData } from "./$types";
  import { invalidateAll } from "$app/navigation";

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
      cancelEdit();
      await invalidateAll();
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
      await invalidateAll();
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

  $: tabLabel =
    activeTab === "features" ? "Feature" : activeTab === "amenities" ? "Amenity" : "Facility";
</script>

<svelte:head>
  <title>Manage Types - Admin - Adventure Spark</title>
</svelte:head>

<style>
  .grain {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }
  :global(body) {
    background-color: #0c0f0a;
  }
</style>

<div class="grain"></div>

<div class="relative z-10 min-h-screen pt-10 pb-16">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-1.5 text-sm mb-6">
      <a href="/admin" class="text-stone-400 hover:text-stone-200 transition-colors">Admin</a>
      <ChevronRight size={14} class="text-stone-600" />
      <span class="text-stone-200 font-medium">Manage Types</span>
    </nav>

    <div class="flex items-center gap-3 mb-8">
      <div class="p-2.5 bg-violet-500/15 border border-violet-500/25 rounded-xl">
        <Tags size={20} class="text-violet-400" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-stone-100">Manage Types</h1>
        <p class="text-sm text-stone-400">Configure features, amenities, and facilities</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-6 w-fit">
      {#each [["features", "Hike Features"], ["amenities", "Camping Amenities"], ["facilities", "Camping Facilities"]] as [tab, label]}
        <button
          on:click={() => { activeTab = tab as any; cancelEdit(); }}
          class="{activeTab === tab
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            : 'text-stone-500 hover:text-stone-300 border-transparent'} px-4 py-2 rounded-lg text-sm font-medium border transition-all"
        >
          {label}
        </button>
      {/each}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- List -->
      <div class="lg:col-span-2">
        <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 class="text-sm font-bold text-stone-200">
              {activeTab === "features" ? "Features" : activeTab === "amenities" ? "Amenities" : "Facilities"}
              <span class="text-stone-600 font-normal ml-1">({currentItems.length})</span>
            </h2>
            <button
              on:click={() => startCreate(activeTab)}
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
            >
              <Plus size={14} />
              Add New
            </button>
          </div>

          <div class="divide-y divide-white/5">
            {#each currentItems as item (item.id)}
              <div class="flex items-center justify-between px-5 py-3.5 hover:bg-white/3 transition-colors">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-stone-200">{item.name}</span>
                    {#if !item.active}
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-stone-500/20 text-stone-500">
                        Inactive
                      </span>
                    {/if}
                  </div>
                  {#if item.description}
                    <p class="text-xs text-stone-500 mt-0.5 truncate">{item.description}</p>
                  {/if}
                  {#if item.key}
                    <p class="text-xs text-stone-600 mt-0.5 font-mono">{item.key}</p>
                  {/if}
                </div>
                <div class="flex items-center gap-1 ml-4 shrink-0">
                  <span class="text-xs text-stone-600 mr-2">#{item.displayOrder}</span>
                  <button
                    on:click={() => startEdit(item)}
                    class="p-1.5 rounded-lg text-stone-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    on:click={() => deleteItem(item.id)}
                    class="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            {:else}
              <div class="px-5 py-10 text-center text-stone-600 text-sm">No items found</div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Form Panel -->
      {#if editingItem || isCreating}
        <div class="lg:col-span-1">
          <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl overflow-hidden sticky top-6">
            <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 class="text-sm font-bold text-stone-200">
                {isCreating ? "New" : "Edit"} {tabLabel}
              </h3>
            </div>

            <div class="px-5 py-4 space-y-4">
              <div>
                <label for="name" class="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  bind:value={formData.name}
                  class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  placeholder="Enter name..."
                />
              </div>

              {#if needsKey}
                <div>
                  <label for="key" class="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                    Key * <span class="normal-case font-normal text-stone-600">(camelCase)</span>
                  </label>
                  <input
                    type="text"
                    id="key"
                    bind:value={formData.key}
                    class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    placeholder="e.g. firePits"
                  />
                </div>
              {/if}

              <div>
                <label for="description" class="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  id="description"
                  bind:value={formData.description}
                  rows="3"
                  class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none"
                  placeholder="Optional description..."
                ></textarea>
              </div>

              <div>
                <label for="displayOrder" class="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  id="displayOrder"
                  bind:value={formData.displayOrder}
                  class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                />
              </div>

              <label class="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  id="active"
                  bind:checked={formData.active}
                  class="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
                />
                <span class="text-sm text-stone-300">Active</span>
              </label>

              <div class="flex gap-2 pt-2">
                <button
                  on:click={saveItem}
                  class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
                >
                  Save
                </button>
                <button
                  on:click={cancelEdit}
                  class="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 text-stone-400 hover:text-stone-200 hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
