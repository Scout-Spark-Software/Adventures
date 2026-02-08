<script lang="ts">
  import type { PageData } from "./$types";
  import { invalidateAll } from "$app/navigation";

  export let data: PageData;

  let processingItems = new Set<string>();
  let errors = new Map<string, string>();

  function itemKey(entityType: string, entityId: string) {
    return `${entityType}:${entityId}`;
  }

  async function approveItem(entityType: string, entityId: string) {
    const key = itemKey(entityType, entityId);
    if (processingItems.has(key)) return;

    processingItems.add(key);
    processingItems = processingItems;
    errors.delete(key);
    errors = errors;

    try {
      const response = await fetch("/api/moderation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, status: "approved" }),
      });

      if (!response.ok) {
        const error = await response.json();
        errors.set(
          key,
          `Failed to approve: ${error.message || "Unknown error"}`,
        );
        errors = errors;
        return;
      }

      await invalidateAll();
    } catch (error) {
      console.error("Failed to approve item:", error);
      errors.set(key, "Failed to approve item. Please try again.");
      errors = errors;
    } finally {
      processingItems.delete(key);
      processingItems = processingItems;
    }
  }

  async function rejectItem(entityType: string, entityId: string) {
    const key = itemKey(entityType, entityId);
    if (processingItems.has(key)) return;

    processingItems.add(key);
    processingItems = processingItems;
    errors.delete(key);
    errors = errors;

    try {
      const response = await fetch("/api/moderation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, status: "rejected" }),
      });

      if (!response.ok) {
        const error = await response.json();
        errors.set(
          key,
          `Failed to reject: ${error.message || "Unknown error"}`,
        );
        errors = errors;
        return;
      }

      await invalidateAll();
    } catch (error) {
      console.error("Failed to reject item:", error);
      errors.set(key, "Failed to reject item. Please try again.");
      errors = errors;
    } finally {
      processingItems.delete(key);
      processingItems = processingItems;
    }
  }
</script>

<svelte:head>
  <title>Moderation Queue - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Moderation Queue</h1>

    {#if data.queue && data.queue.length > 0}
      <div class="space-y-4">
        {#each data.queue as item}
          {@const key = itemKey(item.entityType, item.entityId)}
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {item.entityType === "hike"
                    ? "Hike"
                    : item.entityType === "camping_site"
                      ? "Camping Site"
                      : "Alteration"}
                </h3>
                {#if item.entity}
                  <p class="text-gray-600 mt-1">
                    {item.entity.name ||
                      `Alteration for ${item.entity.fieldName}`}
                  </p>
                {/if}
              </div>
              <div class="flex space-x-2">
                <button
                  on:click={() => approveItem(item.entityType, item.entityId)}
                  disabled={processingItems.has(key)}
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingItems.has(key) ? "Processing..." : "Approve"}
                </button>
                <button
                  on:click={() => rejectItem(item.entityType, item.entityId)}
                  disabled={processingItems.has(key)}
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingItems.has(key) ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
            {#if item.entity && item.entity.description}
              <p class="text-gray-700 text-sm">{item.entity.description}</p>
            {/if}
            {#if errors.has(key)}
              <div class="mt-3 rounded-md bg-red-50 p-3">
                <div class="text-sm text-red-800">{errors.get(key)}</div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <p class="text-gray-500 text-lg">No items pending moderation.</p>
      </div>
    {/if}
  </div>
</div>
