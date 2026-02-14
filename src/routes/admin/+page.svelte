<script lang="ts">
  import { Check, CircleAlert, Heart, House } from "lucide-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: stats = data.stats;
</script>

<svelte:head>
  <title>Admin Dashboard - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

    <!-- Statistics Grid -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">Overview</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white rounded-lg shadow p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Hikes</p>
              <p class="text-2xl font-bold text-sky-600 mt-2">
                {stats.totalHikes}
              </p>
            </div>
            <Check size={48} class="text-sky-200" />
          </div>
          <p class="text-xs text-gray-500 mt-2">
            {stats.featuredHikes} featured
          </p>
        </div>

        <div class="bg-white rounded-lg shadow p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Camping Sites</p>
              <p class="text-2xl font-bold text-emerald-600 mt-2">
                {stats.totalCampingSites}
              </p>
            </div>
            <House size={48} class="text-emerald-200" />
          </div>
          <p class="text-xs text-gray-500 mt-2">
            {stats.featuredCampingSites} featured
          </p>
        </div>

        <div class="bg-white rounded-lg shadow p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p class="text-2xl font-bold text-amber-600 mt-2">
                {stats.pendingHikes + stats.pendingCampingSites}
              </p>
            </div>
            <CircleAlert size={48} class="text-amber-200" />
          </div>
          <p class="text-xs text-gray-500 mt-2">
            {stats.pendingHikes} hikes, {stats.pendingCampingSites} sites
          </p>
        </div>

        <div class="bg-white rounded-lg shadow p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Pending Edits</p>
              <p class="text-2xl font-bold text-purple-600 mt-2">
                {stats.pendingAlterations}
              </p>
            </div>

            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0
            002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828
            15H9v-2.828l8.586-8.586z" />
          </div>
          <p class="text-xs text-gray-500 mt-2">User-submitted edits</p>
        </div>
      </div>
    </div>

    <!-- Additional Stats -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">Community Engagement</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="bg-white rounded-lg shadow p-5">
          <div class="flex items-center">
            <Heart size={40} class="text-rose-500" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Favorites</p>
              <p class="text-2xl font-bold text-gray-900">
                {stats.totalFavorites}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Actions -->
    <div>
      <h2 class="text-lg font-semibold text-gray-900 mb-3">Admin Actions</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/admin/moderation"
          class="bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow border-l-4 border-amber-500"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Moderation Queue</h3>
          <p class="text-sm text-gray-600 mb-2">Review and approve pending submissions</p>
          {#if stats.pendingHikes + stats.pendingCampingSites > 0}
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800"
            >
              {stats.pendingHikes + stats.pendingCampingSites} pending
            </span>
          {/if}
        </a>

        <a
          href="/admin/featured"
          class="bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow border-l-4 border-sky-500"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Featured Items</h3>
          <p class="text-sm text-gray-600 mb-2">Manage featured hikes and camping sites</p>
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-800"
          >
            {stats.featuredHikes + stats.featuredCampingSites} featured
          </span>
        </a>

        <a
          href="/admin/types"
          class="bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow border-l-4 border-purple-500"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Manage Types</h3>
          <p class="text-sm text-gray-600">Configure features, amenities, and facilities</p>
        </a>
      </div>
    </div>
  </div>
</div>
