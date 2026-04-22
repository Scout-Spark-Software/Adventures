<script lang="ts">
  import {
    BookOpen,
    ChevronRight,
    CircleAlert,
    Flag,
    Heart,
    Mountain,
    Pencil,
    Shield,
    Star,
    Tags,
    Tent,
    Users,
    Backpack,
  } from "lucide-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: stats = data.stats;
</script>

<svelte:head>
  <title>Admin Dashboard - Adventure Spark</title>
</svelte:head>

<div class="grain"></div>

<div class="relative z-10 min-h-screen pt-16 pb-16">
  <!-- Mountain silhouette -->
  <div class="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden opacity-10">
    <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg" class="w-full">
      <path
        d="M0,200 L0,140 L120,60 L240,130 L360,40 L480,110 L600,30 L720,100 L840,20 L960,90 L1080,10 L1200,80 L1320,50 L1440,120 L1440,200 Z"
        fill="#4ade80"
      />
    </svg>
  </div>

  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-10">
      <div class="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
        <Shield size={22} class="text-emerald-400" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-stone-100">Admin Dashboard</h1>
        <p class="text-sm text-stone-400">Manage content and monitor activity</p>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-10">
      <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-4 py-4">
        <div class="flex items-center gap-2 mb-3">
          <Mountain size={14} class="text-emerald-400" />
          <span class="text-xs font-semibold text-stone-400 uppercase tracking-widest">Hikes</span>
        </div>
        <p class="text-3xl font-bold text-stone-100 tabular-nums">{stats.totalHikes}</p>
        <p class="text-xs text-stone-500 mt-1">{stats.featuredHikes} featured</p>
      </div>

      <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-4 py-4">
        <div class="flex items-center gap-2 mb-3">
          <Tent size={14} class="text-emerald-400" />
          <span class="text-xs font-semibold text-stone-400 uppercase tracking-widest">Sites</span>
        </div>
        <p class="text-3xl font-bold text-stone-100 tabular-nums">{stats.totalCampingSites}</p>
        <p class="text-xs text-stone-500 mt-1">{stats.featuredCampingSites} featured</p>
      </div>

      <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-4 py-4">
        <div class="flex items-center gap-2 mb-3">
          <Backpack size={14} class="text-emerald-400" />
          <span class="text-xs font-semibold text-stone-400 uppercase tracking-widest">Backpacking</span>
        </div>
        <p class="text-3xl font-bold text-stone-100 tabular-nums">{stats.totalBackpacking}</p>
        <p class="text-xs text-stone-500 mt-1">Approved routes</p>
      </div>

      <a
        href="/admin/moderation"
        class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-4 py-4 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-200"
      >
        <div class="flex items-center gap-2 mb-3">
          <CircleAlert size={14} class="text-amber-400" />
          <span class="text-xs font-semibold text-stone-400 uppercase tracking-widest">Pending</span
          >
        </div>
        <p class="text-3xl font-bold text-amber-300 tabular-nums">
          {stats.pendingHikes + stats.pendingCampingSites + stats.pendingBackpacking}
        </p>
        <p class="text-xs text-stone-500 mt-1">
          {stats.pendingHikes} hikes, {stats.pendingCampingSites} camping, {stats.pendingBackpacking} backpacking
        </p>
      </a>

      <a
        href="/admin/moderation"
        class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-4 py-4 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
      >
        <div class="flex items-center gap-2 mb-3">
          <Pencil size={14} class="text-stone-400" />
          <span class="text-xs font-semibold text-stone-400 uppercase tracking-widest">Edits</span>
        </div>
        <p class="text-3xl font-bold text-stone-100 tabular-nums">{stats.pendingAlterations}</p>
        <p class="text-xs text-stone-500 mt-1">Pending review</p>
      </a>

      <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-4 py-4">
        <div class="flex items-center gap-2 mb-3">
          <Heart size={14} class="text-rose-400" />
          <span class="text-xs font-semibold text-stone-400 uppercase tracking-widest">Saved</span>
        </div>
        <p class="text-3xl font-bold text-stone-100 tabular-nums">{stats.totalFavorites}</p>
        <p class="text-xs text-stone-500 mt-1">Total favorites</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <p class="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">Quick Actions</p>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <a
        href="/admin/moderation"
        class="group flex items-center justify-between bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-5 py-4 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-200"
      >
        <div class="flex items-center gap-4">
          <div class="p-2 bg-amber-500/15 border border-amber-500/25 rounded-lg">
            <CircleAlert size={18} class="text-amber-400" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-stone-100">Moderation Queue</h3>
            <p class="text-xs text-stone-500 mt-0.5">Review pending submissions</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          {#if stats.pendingHikes + stats.pendingCampingSites > 0}
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"
            >
              {stats.pendingHikes + stats.pendingCampingSites}
            </span>
          {/if}
          <ChevronRight
            size={16}
            class="text-stone-600 group-hover:text-emerald-400 transition-colors"
          />
        </div>
      </a>

      <a
        href="/admin/featured"
        class="group flex items-center justify-between bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-5 py-4 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-200"
      >
        <div class="flex items-center gap-4">
          <div class="p-2 bg-sky-500/15 border border-sky-500/25 rounded-lg">
            <Star size={18} class="text-sky-400" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-stone-100">Featured Items</h3>
            <p class="text-xs text-stone-500 mt-0.5">Manage featured content</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30"
          >
            {stats.featuredHikes + stats.featuredCampingSites}
          </span>
          <ChevronRight
            size={16}
            class="text-stone-600 group-hover:text-emerald-400 transition-colors"
          />
        </div>
      </a>

      <a
        href="/admin/types"
        class="group flex items-center justify-between bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-5 py-4 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-200"
      >
        <div class="flex items-center gap-4">
          <div class="p-2 bg-violet-500/15 border border-violet-500/25 rounded-lg">
            <Tags size={18} class="text-violet-400" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-stone-100">Manage Types</h3>
            <p class="text-xs text-stone-500 mt-0.5">Features, amenities, facilities</p>
          </div>
        </div>
        <ChevronRight
          size={16}
          class="text-stone-600 group-hover:text-emerald-400 transition-colors"
        />
      </a>

      <a
        href="/admin/users"
        class="group flex items-center justify-between bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-5 py-4 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-200"
      >
        <div class="flex items-center gap-4">
          <div class="p-2 bg-emerald-500/15 border border-emerald-500/25 rounded-lg">
            <Users size={18} class="text-emerald-400" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-stone-100">Users</h3>
            <p class="text-xs text-stone-500 mt-0.5">Manage users and roles</p>
          </div>
        </div>
        <ChevronRight
          size={16}
          class="text-stone-600 group-hover:text-emerald-400 transition-colors"
        />
      </a>

      <a
        href="/admin/blog"
        class="group flex items-center justify-between bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-5 py-4 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-200"
      >
        <div class="flex items-center gap-4">
          <div class="p-2 bg-indigo-500/15 border border-indigo-500/25 rounded-lg">
            <BookOpen size={18} class="text-indigo-400" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-stone-100">Blog</h3>
            <p class="text-xs text-stone-500 mt-0.5">
              {stats.publishedPosts} published · {stats.draftPosts} draft{stats.scheduledPosts > 0
                ? ` · ${stats.scheduledPosts} scheduled`
                : ""}
            </p>
          </div>
        </div>
        <ChevronRight size={16} class="text-stone-600 group-hover:text-emerald-400 transition-colors" />
      </a>

      <a
        href="/admin/image-flags"
        class="group flex items-center justify-between bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-5 py-4 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-200"
      >
        <div class="flex items-center gap-4">
          <div class="p-2 bg-red-500/15 border border-red-500/25 rounded-lg">
            <Flag size={18} class="text-red-400" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-stone-100">Flagged Images</h3>
            <p class="text-xs text-stone-500 mt-0.5">Review reported photos</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          {#if stats.pendingImageFlags > 0}
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30"
            >
              {stats.pendingImageFlags}
            </span>
          {/if}
          <ChevronRight
            size={16}
            class="text-stone-600 group-hover:text-emerald-400 transition-colors"
          />
        </div>
      </a>
    </div>
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
