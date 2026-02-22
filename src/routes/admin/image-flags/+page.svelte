<script lang="ts">
  import { ChevronRight } from "lucide-svelte";
  import type { PageData } from "./$types";
  import { invalidateAll } from "$app/navigation";

  export let data: PageData;

  let processingIds = new Set<string>();
  let errors = new Map<string, string>();

  async function reviewFlag(flagId: string, status: "approved" | "rejected") {
    const action = status === "approved" ? "remove image" : "dismiss flag";
    if (!confirm(`Are you sure you want to ${action}?`)) return;
    if (processingIds.has(flagId)) return;

    processingIds.add(flagId);
    processingIds = processingIds;
    errors.delete(flagId);
    errors = errors;

    try {
      const response = await fetch("/api/admin/image-flags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagId, status }),
      });

      if (!response.ok) {
        const err = await response.json();
        errors.set(flagId, err.message || "Something went wrong");
        errors = errors;
        return;
      }

      await invalidateAll();
    } catch {
      errors.set(flagId, "Request failed. Please try again.");
      errors = errors;
    } finally {
      processingIds.delete(flagId);
      processingIds = processingIds;
    }
  }

  function entityLink(flag: any) {
    if (!flag.file) return null;
    const type = flag.file.entityType;
    const id = flag.file.entityId;
    if (type === "hike") return `/hikes/${id}#media`;
    if (type === "camping_site") return `/camping/${id}#media`;
    return null;
  }

  function entityLabel(flag: any) {
    if (!flag.file) return "Unknown";
    return flag.file.entityType === "hike" ? "Hike" : "Camping Site";
  }
</script>

<svelte:head>
  <title>Flagged Images - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <nav class="flex items-center gap-1.5 text-sm mb-6">
      <a href="/admin" class="text-gray-500 hover:text-gray-700 transition-colors">Admin</a>
      <ChevronRight size={14} class="text-gray-300" />
      <span class="text-gray-900 font-medium">Flagged Images</span>
    </nav>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Flagged Images</h1>

    {#if data.flags && data.flags.length > 0}
      <div class="space-y-4">
        {#each data.flags as flag (flag.id)}
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-start gap-6">
              <!-- Image thumbnail -->
              {#if flag.file?.fileUrl}
                <div class="flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={flag.file.fileUrl}
                    alt={flag.file.fileName}
                    class="w-full h-full object-cover"
                  />
                </div>
              {:else}
                <div
                  class="flex-shrink-0 w-28 h-28 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs"
                >
                  No preview
                </div>
              {/if}

              <!-- Flag details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {flag.file?.fileName || "Unknown file"}
                    </p>
                    <p class="text-xs text-gray-500 mt-0.5">
                      {entityLabel(flag)}
                      {#if entityLink(flag)}
                        &mdash;
                        <a
                          href={entityLink(flag)}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-indigo-600 hover:text-indigo-800"
                        >
                          View page
                        </a>
                      {/if}
                    </p>
                    {#if flag.reason}
                      <p class="mt-2 text-sm text-gray-700">
                        <span class="font-medium">Reason:</span>
                        {flag.reason}
                      </p>
                    {:else}
                      <p class="mt-2 text-sm text-gray-400 italic">No reason provided</p>
                    {/if}
                    <p class="mt-1 text-xs text-gray-400">
                      Flagged {new Date(flag.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <!-- Action buttons -->
                  <div class="flex gap-2 flex-shrink-0">
                    <button
                      on:click={() => reviewFlag(flag.id, "approved")}
                      disabled={processingIds.has(flag.id)}
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingIds.has(flag.id) ? "Working..." : "Remove Image"}
                    </button>
                    <button
                      on:click={() => reviewFlag(flag.id, "rejected")}
                      disabled={processingIds.has(flag.id)}
                      class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingIds.has(flag.id) ? "Working..." : "Dismiss"}
                    </button>
                  </div>
                </div>

                {#if errors.has(flag.id)}
                  <div class="rounded-md bg-red-50 p-3">
                    <p class="text-sm text-red-800">{errors.get(flag.id)}</p>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <p class="text-gray-500 text-lg">No flagged images pending review.</p>
      </div>
    {/if}
  </div>
</div>
