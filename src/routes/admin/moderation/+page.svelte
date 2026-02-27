<script lang="ts">
  import { ChevronRight, ExternalLink, CircleAlert } from "lucide-svelte";
  import type { PageData } from "./$types";
  import { invalidateAll } from "$app/navigation";

  function entityUrl(item: { entityType: string; entityId: string }) {
    if (item.entityType === "hike") return `/hikes/${item.entityId}`;
    if (item.entityType === "camping_site") return `/camping/${item.entityId}`;
    if (item.entityType === "backpacking") return `/backpacking/${item.entityId}`;
    return null;
  }

  function apiUrl(item: { entityType: string; entityId: string }) {
    if (item.entityType === "hike") return `/api/hikes/${item.entityId}`;
    if (item.entityType === "camping_site") return `/api/camping-sites/${item.entityId}`;
    if (item.entityType === "backpacking") return `/api/backpacking/${item.entityId}`;
    return null;
  }

  export let data: PageData;

  let processingItems = new Set<string>();
  let errors = new Map<string, string>();

  function itemKey(entityType: string, entityId: string) {
    return `${entityType}:${entityId}`;
  }

  function pruneErrors() {
    if (!data.queue) return;
    const activeKeys = new Set(
      data.queue.map((item: { entityType: string; entityId: string }) =>
        itemKey(item.entityType, item.entityId)
      )
    );
    for (const key of errors.keys()) {
      if (!activeKeys.has(key)) {
        errors.delete(key);
      }
    }
    errors = errors;
  }

  async function deleteItem(entityType: string, entityId: string, name: string) {
    if (!confirm(`Permanently delete "${name}" and all its images? This cannot be undone.`)) return;

    const key = itemKey(entityType, entityId);
    if (processingItems.has(key)) return;

    const endpoint = apiUrl({ entityType, entityId });
    if (!endpoint) return;

    processingItems.add(key);
    processingItems = processingItems;
    errors.delete(key);
    errors = errors;

    try {
      const response = await fetch(endpoint, { method: "DELETE" });

      if (!response.ok) {
        const err = await response.json();
        errors.set(key, `Failed to delete: ${err.message || "Unknown error"}`);
        errors = errors;
        return;
      }

      await invalidateAll();
      pruneErrors();
    } catch (err) {
      console.error("Failed to delete item:", err);
      errors.set(key, "Failed to delete item. Please try again.");
      errors = errors;
    } finally {
      processingItems.delete(key);
      processingItems = processingItems;
    }
  }

  async function moderateItem(
    entityType: string,
    entityId: string,
    status: "approved" | "rejected"
  ) {
    const action = status === "approved" ? "approve" : "reject";
    if (!confirm(`Are you sure you want to ${action} this item?`)) return;

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
        body: JSON.stringify({ entityType, entityId, status }),
      });

      if (!response.ok) {
        const error = await response.json();
        errors.set(key, `Failed to ${action}: ${error.message || "Unknown error"}`);
        errors = errors;
        return;
      }

      await invalidateAll();
      pruneErrors();
    } catch (error) {
      console.error(`Failed to ${action} item:`, error);
      errors.set(key, `Failed to ${action} item. Please try again.`);
      errors = errors;
    } finally {
      processingItems.delete(key);
      processingItems = processingItems;
    }
  }

  function entityTypeLabel(entityType: string) {
    if (entityType === "hike") return "Hike";
    if (entityType === "camping_site") return "Camping Site";
    if (entityType === "backpacking") return "Backpacking";
    return "Alteration";
  }

  function entityTypeColor(entityType: string) {
    if (entityType === "hike") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    if (entityType === "camping_site") return "bg-sky-500/20 text-sky-300 border-sky-500/30";
    if (entityType === "backpacking") return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    return "bg-stone-500/20 text-stone-300 border-stone-500/30";
  }
</script>

<svelte:head>
  <title>Moderation Queue - Adventure Spark</title>
</svelte:head>

<div class="grain"></div>

<div class="relative z-10 min-h-screen pt-10 pb-16">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-1.5 text-sm mb-6">
      <a href="/admin" class="text-stone-400 hover:text-stone-200 transition-colors">Admin</a>
      <ChevronRight size={14} class="text-stone-600" />
      <span class="text-stone-200 font-medium">Moderation Queue</span>
    </nav>

    <div class="flex items-center gap-3 mb-8">
      <div class="p-2.5 bg-amber-500/15 border border-amber-500/25 rounded-xl">
        <CircleAlert size={20} class="text-amber-400" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-stone-100">Moderation Queue</h1>
        <p class="text-sm text-stone-400">
          {data.queue?.length ?? 0} item{data.queue?.length !== 1 ? "s" : ""} pending review
        </p>
      </div>
    </div>

    {#if data.queue && data.queue.length > 0}
      <div class="space-y-4">
        {#each data.queue as item (item.entityId)}
          {@const key = itemKey(item.entityType, item.entityId)}
          {@const url = entityUrl(item)}
          <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-5">
            <div class="flex items-start justify-between gap-4 mb-4">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-2">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border {entityTypeColor(
                      item.entityType
                    )}"
                  >
                    {entityTypeLabel(item.entityType)}
                  </span>
                  <span class="text-xs text-stone-500">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {#if item.entity}
                  <div class="flex items-center gap-2">
                    {#if url}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-lg font-bold text-stone-100 hover:text-emerald-300 transition-colors truncate"
                      >
                        {item.entity.name || `Alteration for ${item.entity.fieldName}`}
                      </a>
                      <ExternalLink size={14} class="shrink-0 text-stone-500" />
                    {:else}
                      <h3 class="text-lg font-bold text-stone-100 truncate">
                        {item.entity.name || `Alteration for ${item.entity.fieldName}`}
                      </h3>
                    {/if}
                  </div>
                {/if}
              </div>

              <!-- Action buttons -->
              <div class="flex shrink-0 items-center gap-2">
                <button
                  on:click={() => moderateItem(item.entityType, item.entityId, "approved")}
                  disabled={processingItems.has(key)}
                  class="inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-lg text-emerald-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processingItems.has(key) ? "..." : "Approve"}
                </button>
                <button
                  on:click={() => moderateItem(item.entityType, item.entityId, "rejected")}
                  disabled={processingItems.has(key)}
                  class="inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-lg text-red-950 bg-red-400 hover:bg-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processingItems.has(key) ? "..." : "Reject"}
                </button>
                {#if data.userRole === "admin" && apiUrl(item)}
                  <button
                    on:click={() =>
                      deleteItem(
                        item.entityType,
                        item.entityId,
                        item.entity?.name ?? item.entityId
                      )}
                    disabled={processingItems.has(key)}
                    class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-white/10 text-stone-400 hover:text-red-300 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Delete permanently"
                  >
                    Delete
                  </button>
                {/if}
              </div>
            </div>

            {#if item.entity}
              <!-- Metadata pills -->
              <div class="flex flex-wrap gap-2 mb-3">
                {#if item.entityType === "hike"}
                  {#if item.entity.difficulty}
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 capitalize"
                    >
                      {item.entity.difficulty.replace("_", " ")}
                    </span>
                  {/if}
                  {#if item.entity.distance}
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-stone-400"
                    >
                      {item.entity.distance}
                      {item.entity.distanceUnit ?? "miles"}
                    </span>
                  {/if}
                  {#if item.entity.duration}
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-stone-400"
                    >
                      {item.entity.duration}
                      {item.entity.durationUnit ?? "hours"}
                    </span>
                  {/if}
                  {#if item.entity.trailType}
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-stone-400 capitalize"
                    >
                      {item.entity.trailType.replace("_", " ")}
                    </span>
                  {/if}
                {:else if item.entityType === "camping_site"}
                  {#if item.entity.siteType}
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/15 text-sky-300 capitalize"
                    >
                      {item.entity.siteType.replace("_", " ")}
                    </span>
                  {/if}
                  {#if item.entity.costPerNight}
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-stone-400"
                    >
                      ${item.entity.costPerNight}/night
                    </span>
                  {/if}
                  {#if item.entity.petPolicy}
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-stone-400 capitalize"
                    >
                      Pets: {item.entity.petPolicy.replace("_", " ")}
                    </span>
                  {/if}
                {:else if item.entityType === "backpacking"}
                  {#if item.entity.difficulty}
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 capitalize"
                    >
                      {item.entity.difficulty.replace("_", " ")}
                    </span>
                  {/if}
                  {#if item.entity.distance}
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-stone-400"
                    >
                      {item.entity.distance}
                      {item.entity.distanceUnit ?? "miles"}
                    </span>
                  {/if}
                  {#if item.entity.numberOfDays}
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-stone-400"
                    >
                      {item.entity.numberOfDays} day{item.entity.numberOfDays !== 1 ? "s" : ""}
                    </span>
                  {/if}
                {/if}
              </div>

              {#if item.entity.description}
                <p class="text-stone-400 text-sm line-clamp-3">{item.entity.description}</p>
              {/if}
            {/if}

            {#if errors.has(key)}
              <div class="mt-3 rounded-lg bg-red-500/10 border border-red-500/25 p-3">
                <p class="text-sm text-red-300">{errors.get(key)}</p>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-20">
        <div
          class="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
        >
          <CircleAlert size={28} class="text-emerald-500/50" />
        </div>
        <p class="text-stone-400 text-lg font-medium">Queue is empty</p>
        <p class="text-stone-600 text-sm mt-1">No items pending moderation.</p>
      </div>
    {/if}
  </div>
</div>

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
