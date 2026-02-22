<script lang="ts">
  import {
    ArrowRight,
    ChevronRight,
    CircleAlert,
    Heart,
    Mountain,
    Pencil,
    Shield,
    Sparkles,
    Star,
    Tags,
    Tent,
    Users,
  } from "lucide-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: stats = data.stats;
</script>

<svelte:head>
  <title>Admin Dashboard - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-gray-50/50 py-10">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center gap-3 mb-8">
      <div class="p-2 bg-gray-900 rounded-lg">
        <Shield size={18} class="text-white" />
      </div>
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p class="text-sm text-gray-500">Manage content and monitor activity</p>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-8">
      <div class="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
        <div class="flex items-center gap-2 mb-2">
          <Mountain size={14} class="text-gray-400" />
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Hikes</span>
        </div>
        <p class="text-2xl font-semibold text-gray-900 tabular-nums">{stats.totalHikes}</p>
        <p class="text-xs text-gray-400 mt-1">{stats.featuredHikes} featured</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
        <div class="flex items-center gap-2 mb-2">
          <Tent size={14} class="text-gray-400" />
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Sites</span>
        </div>
        <p class="text-2xl font-semibold text-gray-900 tabular-nums">{stats.totalCampingSites}</p>
        <p class="text-xs text-gray-400 mt-1">{stats.featuredCampingSites} featured</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
        <div class="flex items-center gap-2 mb-2">
          <CircleAlert size={14} class="text-amber-500" />
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</span>
        </div>
        <p class="text-2xl font-semibold text-gray-900 tabular-nums">
          {stats.pendingHikes + stats.pendingCampingSites}
        </p>
        <p class="text-xs text-gray-400 mt-1">
          {stats.pendingHikes} hikes, {stats.pendingCampingSites} sites
        </p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
        <div class="flex items-center gap-2 mb-2">
          <Pencil size={14} class="text-gray-400" />
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Edits</span>
        </div>
        <p class="text-2xl font-semibold text-gray-900 tabular-nums">
          {stats.pendingAlterations}
        </p>
        <p class="text-xs text-gray-400 mt-1">Pending review</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
        <div class="flex items-center gap-2 mb-2">
          <Heart size={14} class="text-gray-400" />
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Favorites</span>
        </div>
        <p class="text-2xl font-semibold text-gray-900 tabular-nums">{stats.totalFavorites}</p>
        <p class="text-xs text-gray-400 mt-1">Total saved</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <a
        href="/admin/moderation"
        class="group flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 hover:bg-gray-50/50 transition-all"
      >
        <div class="flex items-center gap-3">
          <div class="p-1.5 bg-amber-50 rounded-lg">
            <CircleAlert size={16} class="text-amber-600" />
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-900">Moderation Queue</h3>
            <p class="text-xs text-gray-500 mt-0.5">Review pending submissions</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          {#if stats.pendingHikes + stats.pendingCampingSites > 0}
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"
            >
              {stats.pendingHikes + stats.pendingCampingSites}
            </span>
          {/if}
          <ChevronRight
            size={16}
            class="text-gray-300 group-hover:text-gray-500 transition-colors"
          />
        </div>
      </a>

      <a
        href="/admin/featured"
        class="group flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 hover:bg-gray-50/50 transition-all"
      >
        <div class="flex items-center gap-3">
          <div class="p-1.5 bg-sky-50 rounded-lg">
            <Star size={16} class="text-sky-600" />
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-900">Featured Items</h3>
            <p class="text-xs text-gray-500 mt-0.5">Manage featured content</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700"
          >
            {stats.featuredHikes + stats.featuredCampingSites}
          </span>
          <ChevronRight
            size={16}
            class="text-gray-300 group-hover:text-gray-500 transition-colors"
          />
        </div>
      </a>

      <a
        href="/admin/types"
        class="group flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 hover:bg-gray-50/50 transition-all"
      >
        <div class="flex items-center gap-3">
          <div class="p-1.5 bg-violet-50 rounded-lg">
            <Tags size={16} class="text-violet-600" />
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-900">Manage Types</h3>
            <p class="text-xs text-gray-500 mt-0.5">Features, amenities, facilities</p>
          </div>
        </div>
        <ChevronRight
          size={16}
          class="text-gray-300 group-hover:text-gray-500 transition-colors"
        />
      </a>

      <a
        href="/admin/users"
        class="group flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 hover:bg-gray-50/50 transition-all"
      >
        <div class="flex items-center gap-3">
          <div class="p-1.5 bg-emerald-50 rounded-lg">
            <Users size={16} class="text-emerald-600" />
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-900">Users</h3>
            <p class="text-xs text-gray-500 mt-0.5">Manage users and roles</p>
          </div>
        </div>
        <ChevronRight
          size={16}
          class="text-gray-300 group-hover:text-gray-500 transition-colors"
        />
      </a>
    </div>
  </div>
</div>
