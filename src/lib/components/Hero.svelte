<script lang="ts">
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  const trailCount = tweened(0, { duration: 2000, easing: cubicOut });
  const campsiteCount = tweened(0, { duration: 2000, easing: cubicOut });
  const scoutCount = tweened(0, { duration: 2000, easing: cubicOut });

  let loading = true;

  onMount(async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        $trailCount = data.trails;
        $campsiteCount = data.campsites;
        $scoutCount = data.scouts;
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      loading = false;
    }
  });
</script>

<!-- Hero Section -->
<div
  class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
>
  <!-- Topographic Background Pattern -->
  <div class="absolute inset-0 opacity-5">
    <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="topo"
          x="0"
          y="0"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            stroke-width="0.5"
            class="text-white"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="currentColor"
            stroke-width="0.5"
            class="text-white"
          />
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="currentColor"
            stroke-width="0.5"
            class="text-white"
          />
          <circle
            cx="50"
            cy="50"
            r="10"
            fill="none"
            stroke="currentColor"
            stroke-width="0.5"
            class="text-white"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#topo)" />
    </svg>
  </div>

  <!-- Gradient Overlays -->
  <div
    class="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"
  ></div>
  <div
    class="absolute inset-0 bg-gradient-to-r from-sky-900/20 to-transparent"
  ></div>

  <!-- Mountain Range Background - Full Width -->
  <div class="absolute bottom-0 left-0 right-0 h-48 opacity-10">
    <svg
      class="w-full h-full"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
    >
      <!-- Back mountain layer -->
      <path
        d="M0,200 L0,140 L150,80 L300,110 L500,50 L700,90 L900,60 L1050,100 L1200,80 L1200,200 Z"
        fill="currentColor"
        class="text-slate-600"
        opacity="0.4"
      />
      <!-- Middle mountain layer -->
      <path
        d="M0,200 L0,150 L200,90 L400,120 L650,60 L850,100 L1050,70 L1200,130 L1200,200 Z"
        fill="currentColor"
        class="text-slate-500"
        opacity="0.6"
      />
      <!-- Front mountain layer -->
      <path
        d="M0,200 L0,160 L180,110 L350,140 L600,80 L800,130 L1000,100 L1200,150 L1200,200 Z"
        fill="currentColor"
        class="text-sky-600"
        opacity="0.8"
      />
    </svg>
  </div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
    <div class="grid lg:grid-cols-2 gap-8 items-center">
      <!-- Left Column: Text Content -->
      <div class="text-center lg:text-left">
        <div
          class="inline-flex items-center gap-2 px-4 py-2 bg-sky-600/20 border border-sky-500/30 rounded-full text-sky-300 text-sm font-medium mb-6"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"
            />
          </svg>
          For Scouts & Outdoor Enthusiasts
        </div>

        <h1
          class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4"
        >
          Your Compass to
          <span
            class="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 mt-1"
          >
            Epic Adventures
          </span>
        </h1>

        <p class="text-lg text-slate-300 mb-3 max-w-2xl lg:max-w-none">
          Navigate extraordinary hiking trails and discover perfect camping
          sites
        </p>
        <p class="text-sm text-slate-400 mb-6 max-w-2xl lg:max-w-none">
          Community-curated adventures from scouts who've been there
        </p>

        <!-- CTA Buttons -->
        <div
          class="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
        >
          <a
            href="/hikes"
            class="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Explore Adventures
            <svg
              class="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
          <a
            href="/essentials"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-lg transition-all"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Scout Essentials
          </a>
        </div>

        <!-- Secondary CTA -->
        <div class="mt-4">
          <a
            href="/submit"
            class="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200 text-sm font-medium transition-colors"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Share Your Trail
          </a>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-700">
          <div>
            <div class="text-2xl font-bold text-sky-400">
              {#if loading}
                <span class="animate-pulse">--</span>
              {:else}
                {Math.floor(
                  $trailCount,
                ).toLocaleString()}{#if $trailCount > 0}+{/if}
              {/if}
            </div>
            <div class="text-xs text-slate-400 mt-1">Trails</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-sky-400">
              {#if loading}
                <span class="animate-pulse">--</span>
              {:else}
                {Math.floor(
                  $campsiteCount,
                ).toLocaleString()}{#if $campsiteCount > 0}+{/if}
              {/if}
            </div>
            <div class="text-xs text-slate-400 mt-1">Campsites</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-sky-400">
              {#if loading}
                <span class="animate-pulse">--</span>
              {:else}
                {Math.floor(
                  $scoutCount,
                ).toLocaleString()}{#if $scoutCount > 0}+{/if}
              {/if}
            </div>
            <div class="text-xs text-slate-400 mt-1">Scouts</div>
          </div>
        </div>
      </div>

      <!-- Right Column: Visual Element -->
      <div class="hidden lg:block relative">
        <!-- Floating Cards -->
        <div class="relative h-[400px]">
          <!-- Card 1 -->
          <div
            class="absolute top-0 right-0 w-72 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform"
          >
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-12 h-12 bg-sky-600 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-white"
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
              <div>
                <div class="text-white font-semibold">Mountain Peak Trail</div>
                <div class="text-slate-400 text-sm">5.2 miles • Hard</div>
              </div>
            </div>
            <div class="flex gap-1">
              {#each [1, 2, 3, 4, 5] as _}
                <svg
                  class="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              {/each}
            </div>
          </div>

          <!-- Card 2 -->
          <div
            class="absolute bottom-20 left-0 w-64 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-5 shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform"
          >
            <div class="flex items-center gap-3 mb-2">
              <div
                class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-white"
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
              <div>
                <div class="text-white font-semibold">Pine Grove Camp</div>
                <div class="text-slate-400 text-sm">Featured Site</div>
              </div>
            </div>
            <div class="text-slate-300 text-sm">
              Perfect basecamp with lake access
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
