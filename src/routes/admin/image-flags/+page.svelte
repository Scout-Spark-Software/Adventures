<script lang="ts">
  import { ChevronRight, Flag, ExternalLink } from "lucide-svelte";
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

<div class="grain"></div>

<div class="relative z-10 min-h-screen pt-10 pb-16">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-1.5 text-sm mb-6">
      <a href="/admin" class="text-stone-400 hover:text-stone-200 transition-colors">Admin</a>
      <ChevronRight size={14} class="text-stone-600" />
      <span class="text-stone-200 font-medium">Flagged Images</span>
    </nav>

    <div class="flex items-center gap-3 mb-8">
      <div class="p-2.5 bg-red-500/15 border border-red-500/25 rounded-xl">
        <Flag size={20} class="text-red-400" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-stone-100">Flagged Images</h1>
        <p class="text-sm text-stone-400">
          {data.flags?.length ?? 0} flag{data.flags?.length !== 1 ? "s" : ""} pending review
        </p>
      </div>
    </div>

    {#if data.flags && data.flags.length > 0}
      <div class="space-y-4">
        {#each data.flags as flag (flag.id)}
          <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-5">
            <div class="flex items-start gap-5">
              <!-- Image thumbnail -->
              {#if flag.file?.fileUrl}
                <div
                  class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-white/10"
                >
                  <img
                    src={flag.file.fileUrl}
                    alt={flag.file.fileName}
                    class="w-full h-full object-cover"
                  />
                </div>
              {:else}
                <div
                  class="flex-shrink-0 w-24 h-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-stone-600 text-xs"
                >
                  No preview
                </div>
              {/if}

              <!-- Flag details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p class="text-sm font-semibold text-stone-200">
                      {flag.file?.fileName || "Unknown file"}
                    </p>
                    <div class="flex items-center gap-1.5 mt-1">
                      <span class="text-xs text-stone-500">{entityLabel(flag)}</span>
                      {#if entityLink(flag)}
                        <span class="text-stone-600">·</span>
                        <a
                          href={entityLink(flag)}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                        >
                          View page
                          <ExternalLink size={11} />
                        </a>
                      {/if}
                    </div>
                    {#if flag.reason}
                      <p class="mt-2 text-sm text-stone-300">
                        <span class="font-medium text-stone-400">Reason:</span>
                        {flag.reason}
                      </p>
                    {:else}
                      <p class="mt-2 text-sm text-stone-600 italic">No reason provided</p>
                    {/if}
                    <p class="mt-1 text-xs text-stone-600">
                      Flagged {new Date(flag.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <!-- Action buttons -->
                  <div class="flex gap-2 flex-shrink-0">
                    <button
                      on:click={() => reviewFlag(flag.id, "approved")}
                      disabled={processingIds.has(flag.id)}
                      class="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg text-red-950 bg-red-400 hover:bg-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processingIds.has(flag.id) ? "..." : "Remove"}
                    </button>
                    <button
                      on:click={() => reviewFlag(flag.id, "rejected")}
                      disabled={processingIds.has(flag.id)}
                      class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-white/10 text-stone-400 hover:text-stone-200 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processingIds.has(flag.id) ? "..." : "Dismiss"}
                    </button>
                  </div>
                </div>

                {#if errors.has(flag.id)}
                  <div class="rounded-lg bg-red-500/10 border border-red-500/25 p-3">
                    <p class="text-sm text-red-300">{errors.get(flag.id)}</p>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-20">
        <div
          class="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
        >
          <Flag size={28} class="text-emerald-500/50" />
        </div>
        <p class="text-stone-400 text-lg font-medium">No flagged images</p>
        <p class="text-stone-600 text-sm mt-1">No images pending review.</p>
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
</style>
