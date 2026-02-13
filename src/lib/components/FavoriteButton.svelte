<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let hikeId: string | null = null;
  export let campingSiteId: string | null = null;
  export let userId: string | null = null;

  let isFavorite = false;
  let loading = false;
  let justToggled = false;
  let showBurst = false;
  let toggleTimer: ReturnType<typeof setTimeout> | null = null;
  let burstTimer: ReturnType<typeof setTimeout> | null = null;

  onMount(async () => {
    if (!userId) return;
    await checkFavorite();
  });

  onDestroy(() => {
    if (toggleTimer) clearTimeout(toggleTimer);
    if (burstTimer) clearTimeout(burstTimer);
  });

  async function checkFavorite() {
    if (!userId) return;
    try {
      const params = new URLSearchParams();
      if (hikeId) params.append("hike_id", hikeId);
      if (campingSiteId) params.append("camping_site_id", campingSiteId);
      const response = await fetch(`/api/favorites/${hikeId || campingSiteId}?${params}`);
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
    if (loading) return;
    loading = true;

    const wasFavorite = isFavorite;

    // Optimistic update
    isFavorite = !isFavorite;
    justToggled = true;
    if (toggleTimer) clearTimeout(toggleTimer);
    toggleTimer = setTimeout(() => {
      justToggled = false;
      toggleTimer = null;
    }, 300);

    if (!wasFavorite) {
      showBurst = true;
      if (burstTimer) clearTimeout(burstTimer);
      burstTimer = setTimeout(() => {
        showBurst = false;
        burstTimer = null;
      }, 600);
    }

    try {
      if (wasFavorite) {
        const params = new URLSearchParams();
        if (hikeId) params.append("hike_id", hikeId);
        if (campingSiteId) params.append("camping_site_id", campingSiteId);
        const response = await fetch(`/api/favorites/${hikeId || campingSiteId}?${params}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to remove favorite");
      } else {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hikeId, campingSiteId }),
        });
        if (!response.ok) throw new Error("Failed to add favorite");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      isFavorite = wasFavorite;
    } finally {
      loading = false;
    }
  }
</script>

<div class="relative inline-flex items-center justify-center">
  {#if showBurst}
    <div class="burst">
      {#each Array(6) as _, i}
        <span class="particle" style="--i: {i};" />
      {/each}
    </div>
  {/if}
  <button
    type="button"
    on:click={toggleFavorite}
    disabled={loading}
    aria-disabled={!userId || undefined}
    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    aria-describedby={!userId ? "favorite-login-hint" : undefined}
    class="relative inline-flex items-center focus:outline-none disabled:opacity-50 {!userId
      ? 'opacity-50 cursor-not-allowed'
      : ''}"
  >
    {#if isFavorite}
      <svg
        class="w-7 h-7 text-red-500 transition-transform duration-300 {justToggled
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
        class="w-7 h-7 text-white/80 hover:text-white transition-transform duration-300 {justToggled
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
    {/if}
  </button>
</div>
{#if !userId}
  <span id="favorite-login-hint" class="sr-only">Log in to save favorites</span>
{/if}

<style>
  .burst {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .particle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ef4444;
    transform: translate(-50%, -50%);
    animation: burst 0.6s ease-out forwards;
    --angle: calc(var(--i) * 60deg);
  }

  @keyframes burst {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-18px) scale(0);
    }
  }
</style>
