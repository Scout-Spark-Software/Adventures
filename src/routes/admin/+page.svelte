<script lang="ts">
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
            <svg
              class="w-12 h-12 text-sky-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
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
            <svg
              class="w-12 h-12 text-emerald-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
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
            <svg
              class="w-12 h-12 text-amber-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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
            <svg
              class="w-12 h-12 text-purple-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <p class="text-xs text-gray-500 mt-2">User-submitted edits</p>
        </div>
      </div>
    </div>

    <!-- Additional Stats -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">
        Community Engagement
      </h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="bg-white rounded-lg shadow p-5">
          <div class="flex items-center">
            <svg
              class="w-10 h-10 text-rose-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
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
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Moderation Queue
          </h3>
          <p class="text-sm text-gray-600 mb-2">
            Review and approve pending submissions
          </p>
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
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Featured Items
          </h3>
          <p class="text-sm text-gray-600 mb-2">
            Manage featured hikes and camping sites
          </p>
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
          <p class="text-sm text-gray-600">
            Configure features, amenities, and facilities
          </p>
        </a>
      </div>
    </div>
  </div>
</div>
