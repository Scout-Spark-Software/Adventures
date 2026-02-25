<script lang="ts">
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  export let stats: {
    trails: number;
    campsites: number;
    backpacking: number;
    scouts: number;
  } | null = null;

  const trailCount = tweened(0, { duration: 2000, easing: cubicOut });
  const campsiteCount = tweened(0, { duration: 2000, easing: cubicOut });
  const backpackingCount = tweened(0, { duration: 2000, easing: cubicOut });
  const scoutCount = tweened(0, { duration: 2000, easing: cubicOut });

  let loading = true;

  function applyStats(data: { trails: number; campsites: number; backpacking: number; scouts: number }) {
    $trailCount = data.trails;
    $campsiteCount = data.campsites;
    $backpackingCount = data.backpacking;
    $scoutCount = data.scouts;
    loading = false;
  }

  onMount(async () => {
    if (stats) {
      applyStats(stats);
      return;
    }
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        applyStats(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      loading = false;
    }
  });
</script>

<!-- Hero — negative top margin pulls it up behind the sticky nav -->
<div class="relative overflow-hidden hero-bg -mt-16">
  <!-- Grain texture overlay -->
  <div class="grain-overlay absolute inset-0 pointer-events-none"></div>

  <!-- Base deep forest gradient -->
  <div class="absolute inset-0 hero-gradient"></div>

  <!-- Moonrise glow — top right warm light source -->
  <div class="absolute -top-32 right-0 w-[700px] h-[700px] rounded-full pointer-events-none" style="background: radial-gradient(circle at 70% 30%, rgba(251,191,36,0.18) 0%, rgba(251,146,60,0.08) 35%, transparent 65%);"></div>

  <!-- Forest floor green ambient — bottom left -->
  <div class="absolute bottom-0 -left-20 w-[600px] h-[500px] pointer-events-none" style="background: radial-gradient(ellipse at 20% 90%, rgba(52,211,153,0.2) 0%, rgba(16,185,129,0.08) 40%, transparent 70%);"></div>

  <!-- Mountain silhouettes -->
  <div class="absolute bottom-0 left-0 right-0 pointer-events-none">
    <!-- Far mountains — muted deep teal -->
    <svg class="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
      <path d="M0,320 L0,200 L120,140 L240,180 L360,100 L480,150 L600,80 L720,130 L840,70 L960,120 L1080,90 L1200,140 L1320,110 L1440,160 L1440,320 Z" fill="rgba(6,78,59,0.45)" />
    </svg>
    <!-- Mid mountains — richer forest green -->
    <svg class="absolute bottom-0 w-full" viewBox="0 0 1440 280" preserveAspectRatio="none">
      <path d="M0,280 L0,220 L180,160 L320,200 L500,130 L660,175 L800,110 L980,160 L1120,125 L1260,170 L1440,140 L1440,280 Z" fill="rgba(4,120,87,0.35)" />
    </svg>
    <!-- Near ridge — darkest, closest -->
    <svg class="absolute bottom-0 w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
      <path d="M0,200 L0,160 L200,120 L380,150 L520,100 L680,140 L820,90 L1000,135 L1140,105 L1300,145 L1440,120 L1440,200 Z" fill="rgba(2,44,34,0.7)" />
    </svg>
  </div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-0">
    <!-- Scout badge -->
    <div class="flex justify-center lg:justify-start mb-10">
      <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase border" style="background: rgba(251,146,60,0.1); border-color: rgba(251,146,60,0.25); color: rgb(251,146,60);">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
        For Scouts &amp; Explorers
      </span>
    </div>

    <!-- Main headline -->
    <div class="text-center lg:text-left max-w-4xl">
      <h1 class="font-black tracking-tight leading-[0.95] mb-6" style="font-size: clamp(3rem, 8vw, 6rem); color: #f5f0e8;">
        Your Compass to<br />
        <span style="background: linear-gradient(135deg, #86efac 0%, #34d399 40%, #6ee7b7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
          Epic Adventures
        </span>
      </h1>
      <p class="text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed mb-2" style="color: rgba(245,240,232,0.7);">
        Trails, campsites, and backpacking routes handpicked for the wilderness-bound scout
      </p>
      <p class="text-sm max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10" style="color: rgba(245,240,232,0.4);">
        Community-curated adventures from scouts who've been there
      </p>

      <!-- CTAs -->
      <div class="flex flex-wrap gap-3 justify-center lg:justify-start mb-16">
        <a href="/hikes" class="group inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-stone-950 transition-all hover:scale-105" style="background: linear-gradient(135deg, #86efac, #34d399);">
          Explore Adventures
          <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
        <a href="/submit" class="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all" style="background: rgba(245,240,232,0.07); border: 1px solid rgba(245,240,232,0.15); color: rgba(245,240,232,0.85);">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Share a Trail
        </a>
        <a href="/essentials" class="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all" style="background: rgba(251,146,60,0.1); border: 1px solid rgba(251,146,60,0.25); color: rgba(251,146,60,0.9);">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Scout Essentials
        </a>
      </div>
    </div>

    <!-- Stats bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden" style="border-top: 1px solid rgba(245,240,232,0.08);">
      {#each [
        { count: $trailCount, label: "Trails", accent: "#86efac" },
        { count: $campsiteCount, label: "Campsites", accent: "#6ee7b7" },
        { count: $backpackingCount, label: "Routes", accent: "#fbbf24" },
        { count: $scoutCount, label: "Scouts", accent: "#c4b5fd" },
      ] as stat}
        <div class="px-6 py-6 text-center sm:text-left" style="background: rgba(245,240,232,0.025);">
          <div class="text-3xl font-black mb-0.5" style="color: {stat.accent};">
            {#if loading}
              <span class="animate-pulse" style="color: rgba(245,240,232,0.2);">—</span>
            {:else}
              {Math.floor(stat.count).toLocaleString()}{#if stat.count > 0}+{/if}
            {/if}
          </div>
          <div class="text-xs font-semibold tracking-widest uppercase" style="color: rgba(245,240,232,0.35);">{stat.label}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Organic wave transition to content below -->
  <div class="relative h-20 overflow-hidden">
    <svg class="absolute bottom-0 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,80 L0,40 Q180,0 360,30 Q540,60 720,25 Q900,-5 1080,35 Q1260,70 1440,30 L1440,80 Z" fill="#fafaf9" />
    </svg>
  </div>
</div>

<style>
  .hero-bg {
    background-color: #0c0f0a;
  }
  .hero-gradient {
    background:
      radial-gradient(ellipse 80% 60% at 75% 20%, #1c2a14 0%, transparent 60%),
      radial-gradient(ellipse 100% 80% at 20% 60%, #0d2a1f 0%, transparent 65%),
      linear-gradient(170deg, #0a1a0d 0%, #081510 40%, #050a08 100%);
  }
  .grain-overlay {
    opacity: 0.04;
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");
    background-size: 200px 200px;
  }
</style>
