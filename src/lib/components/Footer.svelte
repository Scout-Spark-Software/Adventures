<script lang="ts">
  import logo from "$lib/assets/Adventure_Spark_Logo.png";
  import { MountainIcon, Tent, Backpack, BookOpen, Plus, Heart, User } from "lucide-svelte";

  export let user: {
    id: string;
    email: string;
    name?: string;
    isAdmin?: boolean;
  } | null;
</script>

<footer class="relative overflow-hidden footer-bg">
  <!-- Gradient overlay -->
  <div class="absolute inset-0 footer-gradient"></div>
  <!-- Subtle grain -->
  <div class="grain-overlay absolute inset-0 pointer-events-none"></div>
  <!-- Mountain silhouette -->
  <div class="absolute top-0 left-0 right-0 pointer-events-none">
    <svg class="w-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
      <path
        d="M0,0 L0,40 Q200,80 400,50 Q600,20 720,55 Q900,85 1100,40 Q1280,10 1440,50 L1440,0 Z"
        fill="rgba(245,240,232,0.02)"
      />
    </svg>
  </div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
      <!-- Brand -->
      <div class="md:col-span-1 flex flex-col items-center text-center">
        <a href="/" class="flex flex-col items-center mb-4 group">
          <img src={logo} alt="Adventure Spark" class="w-24 h-24" />
        </a>
        <p class="text-sm leading-relaxed mb-6" style="color: rgba(245,240,232,0.4);">
          Community-curated adventures for scouts and outdoor explorers.
        </p>
        <a
          href="https://buymeacoffee.com/landersmikm"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
          style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1c1917;"
        >
          ☕ Buy me a coffee
        </a>
      </div>

      <!-- Explore -->
      <div>
        <h3
          class="text-xs font-bold tracking-widest uppercase mb-5"
          style="color: rgba(245,240,232,0.35);"
        >
          Explore
        </h3>
        <ul class="space-y-3">
          <li>
            <a
              href="/hikes"
              class="group inline-flex items-center gap-2 text-sm font-medium transition-colors"
              style="color: rgba(245,240,232,0.6);"
            >
              <MountainIcon size={14} class="text-emerald-500 flex-shrink-0" />
              <span class="group-hover:text-emerald-300 transition-colors">Hiking Trails</span>
            </a>
          </li>
          <li>
            <a
              href="/camping"
              class="group inline-flex items-center gap-2 text-sm font-medium transition-colors"
              style="color: rgba(245,240,232,0.6);"
            >
              <Tent size={14} class="text-emerald-500 flex-shrink-0" />
              <span class="group-hover:text-emerald-300 transition-colors">Camping Sites</span>
            </a>
          </li>
          <li>
            <a
              href="/backpacking"
              class="group inline-flex items-center gap-2 text-sm font-medium transition-colors"
              style="color: rgba(245,240,232,0.6);"
            >
              <Backpack size={14} class="text-amber-500 flex-shrink-0" />
              <span class="group-hover:text-amber-300 transition-colors">Backpacking Routes</span>
            </a>
          </li>
          <li>
            <a
              href="/essentials"
              class="group inline-flex items-center gap-2 text-sm font-medium transition-colors"
              style="color: rgba(245,240,232,0.6);"
            >
              <BookOpen size={14} class="text-orange-400 flex-shrink-0" />
              <span class="group-hover:text-orange-300 transition-colors">Scout Essentials</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Account -->
      <div>
        <h3
          class="text-xs font-bold tracking-widest uppercase mb-5"
          style="color: rgba(245,240,232,0.35);"
        >
          Account
        </h3>
        <ul class="space-y-3">
          {#if user}
            <li>
              <a
                href="/profile"
                class="group inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style="color: rgba(245,240,232,0.6);"
              >
                <User size={14} class="text-emerald-500 flex-shrink-0" />
                <span class="group-hover:text-emerald-300 transition-colors">Profile</span>
              </a>
            </li>
            <li>
              <a
                href="/favorites"
                class="group inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style="color: rgba(245,240,232,0.6);"
              >
                <Heart size={14} class="text-emerald-500 flex-shrink-0" />
                <span class="group-hover:text-emerald-300 transition-colors">Favorites</span>
              </a>
            </li>
            <li>
              <a
                href="/submit"
                class="group inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style="color: rgba(245,240,232,0.6);"
              >
                <Plus size={14} class="text-emerald-500 flex-shrink-0" />
                <span class="group-hover:text-emerald-300 transition-colors">Submit Adventure</span>
              </a>
            </li>
          {:else}
            <li>
              <a
                href="/login"
                class="group inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style="color: rgba(245,240,232,0.6);"
              >
                <span class="group-hover:text-emerald-300 transition-colors">Login</span>
              </a>
            </li>
            <li>
              <a
                href="/signup"
                class="group inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style="color: rgba(245,240,232,0.6);"
              >
                <span class="group-hover:text-emerald-300 transition-colors">Sign Up</span>
              </a>
            </li>
            <li>
              <a
                href="/submit"
                class="group inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style="color: rgba(245,240,232,0.6);"
              >
                <Plus size={14} class="text-emerald-500 flex-shrink-0" />
                <span class="group-hover:text-emerald-300 transition-colors">Submit Adventure</span>
              </a>
            </li>
          {/if}
        </ul>
      </div>

      <!-- CTA card -->
      <div class="md:col-span-1">
        <div class="rounded-2xl p-5 border cta-card">
          <p
            class="text-xs font-bold tracking-widest uppercase mb-2"
            style="color: rgba(245,240,232,0.35);"
          >
            Ready to explore?
          </p>
          <p class="text-sm font-semibold mb-4" style="color: #f5f0e8;">
            Find your next trail or share one you love.
          </p>
          <div class="flex flex-col gap-2">
            <a
              href="/hikes"
              class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-stone-950 transition-all hover:scale-105"
              style="background: linear-gradient(135deg, #86efac, #34d399);"
            >
              Browse Adventures
            </a>
            <a
              href="/submit"
              class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors"
              style="background: rgba(245,240,232,0.07); border: 1px solid rgba(245,240,232,0.15); color: rgba(245,240,232,0.7);"
            >
              Share a Trail
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div
      class="flex flex-col items-center gap-3 pt-8"
      style="border-top: 1px solid rgba(245,240,232,0.07);"
    >
      <p class="text-xs text-center" style="color: rgba(245,240,232,0.18);">
        Adventure Spark is an independent community platform and is not affiliated with, endorsed
        by, or sponsored by Scouting America or any official scouting organization.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
        <p class="text-xs" style="color: rgba(245,240,232,0.25);">
          &copy; {new Date().getFullYear()} Adventure Spark. All rights reserved.
        </p>
        <div class="flex items-center gap-4">
          <a href="#" class="termly-display-preferences text-gray-300">Consent Preferences</a>
          <p class="text-xs" style="color: rgba(245,240,232,0.2);">
            Made with ❤️ for scouts everywhere
          </p>
        </div>
      </div>
    </div>
  </div>
</footer>

<style>
  .footer-bg {
    background-color: #080c07;
  }
  .footer-gradient {
    background:
      radial-gradient(ellipse 70% 80% at 90% 50%, rgba(52, 211, 153, 0.05) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 5% 50%, rgba(251, 146, 60, 0.04) 0%, transparent 60%),
      linear-gradient(180deg, #0a1208 0%, #060909 100%);
  }
  .grain-overlay {
    opacity: 0.035;
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");
    background-size: 200px 200px;
  }
  .cta-card {
    background: rgba(245, 240, 232, 0.03);
    border-color: rgba(245, 240, 232, 0.08);
  }
  .footer-consent-link {
    color: rgba(245, 240, 232, 0.25);
  }
  .footer-consent-link:hover {
    color: rgba(245, 240, 232, 0.5);
  }
</style>
