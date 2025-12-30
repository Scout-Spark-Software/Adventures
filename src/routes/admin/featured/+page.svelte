<script lang="ts">
  import type { PageData } from "./$types";
  import { invalidateAll } from "$app/navigation";

  export let data: PageData;

  let processingIds = new Set<string>();

  $: featuredHikesCount = data.hikes.filter((h) => h.featured).length;
  $: featuredCampingSitesCount = data.campingSites.filter(
    (c) => c.featured,
  ).length;

  async function toggleFeatured(
    type: "hike" | "camping_site",
    id: string,
    currentlyFeatured: boolean,
  ) {
    if (processingIds.has(id)) return;

    // Check limits when adding to featured
    if (!currentlyFeatured) {
      if (type === "hike" && featuredHikesCount >= 3) {
        alert("Maximum of 3 featured hikes reached. Remove one first.");
        return;
      }
      if (type === "camping_site" && featuredCampingSitesCount >= 3) {
        alert("Maximum of 3 featured camping sites reached. Remove one first.");
        return;
      }
    }

    processingIds.add(id);
    processingIds = processingIds; // Trigger reactivity

    try {
      const response = await fetch(
        `/api/${type === "hike" ? "hikes" : "camping-sites"}/${id}/featured`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featured: !currentlyFeatured }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        alert(
          `Failed to update featured status: ${error.message || "Unknown error"}`,
        );
        return;
      }

      await invalidateAll();
    } catch (error) {
      console.error("Failed to toggle featured status:", error);
      alert("Failed to update featured status. Please try again.");
    } finally {
      processingIds.delete(id);
      processingIds = processingIds; // Trigger reactivity
    }
  }

  function formatLocation(address: any): string {
    if (!address) return "N/A";
    const parts = [address.city, address.state].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  }
</script>

<svelte:head>
  <title>Featured Items - Scouts Adventures</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Manage Featured Items</h1>

    <div class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Hikes</h2>
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Location
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Featured
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each data.hikes as hike}
              <tr>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  {hike.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatLocation(hike.address)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {hike.featured ? "Yes" : "No"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    on:click={() =>
                      toggleFeatured("hike", hike.id, hike.featured)}
                    disabled={processingIds.has(hike.id)}
                    class="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingIds.has(hike.id)
                      ? "Processing..."
                      : hike.featured
                        ? "Remove from Featured"
                        : "Add to Featured"}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Camping Sites</h2>
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Location
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Featured
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each data.campingSites as campingSite}
              <tr>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  {campingSite.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatLocation(campingSite.address)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {campingSite.featured ? "Yes" : "No"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    on:click={() =>
                      toggleFeatured(
                        "camping_site",
                        campingSite.id,
                        campingSite.featured,
                      )}
                    disabled={processingIds.has(campingSite.id)}
                    class="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingIds.has(campingSite.id)
                      ? "Processing..."
                      : campingSite.featured
                        ? "Remove from Featured"
                        : "Add to Featured"}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
