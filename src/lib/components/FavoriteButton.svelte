<script lang="ts">
  import { onMount } from "svelte";

  export let hikeId: string | null = null;
  export let campingSiteId: string | null = null;
  export let userId: string | null = null;

  let isFavorite = false;
  let loading = false;
  let justToggled = false;

  onMount(async () => {
    if (!userId) return;
    await checkFavorite();
  });

  async function checkFavorite() {
    if (!userId) return;
    try {
      const params = new URLSearchParams();
      if (hikeId) params.append("hike_id", hikeId);
      if (campingSiteId) params.append("camping_site_id", campingSiteId);
      const response = await fetch(
        `/api/favorites/${hikeId || campingSiteId}?${params}`,
      );
      if (!response.ok) {
        console.error("Failed to check favorite status");
        return;
      }
      const data = await response.json();
      isFavorite = data.isFavorite;
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  }

  async function toggleFavorite() {
    if (!userId) {
      window.location.href = "/login";
      return;
    }
    loading = true;
    try {
      if (isFavorite) {
        const params = new URLSearchParams();
        if (hikeId) params.append("hike_id", hikeId);
        if (campingSiteId) params.append("camping_site_id", campingSiteId);
        const response = await fetch(
          `/api/favorites/${hikeId || campingSiteId}?${params}`,
          {
            method: "DELETE",
          },
        );
        if (!response.ok) {
          throw new Error("Failed to remove favorite");
        }
        isFavorite = false;
      } else {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hikeId, campingSiteId }),
        });
        if (!response.ok) {
          throw new Error("Failed to add favorite");
        }
        isFavorite = true;
      }
      justToggled = true;
      setTimeout(() => {
        justToggled = false;
      }, 300);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      await checkFavorite();
    } finally {
      loading = false;
    }
  }
</script>

<span title={!userId ? "Log in to save favorites" : undefined}>
  <button
    on:click={toggleFavorite}
    disabled={loading || !userId}
    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {#if isFavorite}
      <svg
        class="w-5 h-5 text-red-500 transition-transform duration-300 {justToggled
          ? 'scale-125'
          : 'scale-100'}"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clip-rule="evenodd"
        />
      </svg>
    {:else}
      <svg
        class="w-5 h-5 text-gray-400 transition-transform duration-300 {justToggled
          ? 'scale-125'
          : 'scale-100'}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    {/if}
  </button>
</span>
