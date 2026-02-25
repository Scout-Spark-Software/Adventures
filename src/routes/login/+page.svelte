<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  import type { ActionData } from "./$types";

  export let form: ActionData;

  let isLoading = false;
  let showPassword = false;

  $: verified = $page.url.searchParams.get("verified") === "true";
</script>

<svelte:head>
  <title>Sign In - Adventure Spark</title>
</svelte:head>

<style>
  :global(body) {
    background-color: #0c0f0a;
  }
  .dark-input {
    background: rgba(245, 240, 232, 0.07);
    border: 1px solid rgba(245, 240, 232, 0.12);
    color: #f5f0e8;
    transition: border-color 0.15s, background 0.15s;
  }
  .dark-input::placeholder {
    color: rgba(245, 240, 232, 0.25);
  }
  .dark-input:focus {
    outline: none;
    border-color: rgba(52, 211, 153, 0.5);
    background: rgba(245, 240, 232, 0.09);
  }
  .eye-btn {
    color: rgba(245, 240, 232, 0.35);
    transition: color 0.15s;
  }
  .eye-btn:hover {
    color: rgba(245, 240, 232, 0.7);
  }
  .link-green {
    color: #34d399;
    transition: color 0.15s;
  }
  .link-green:hover {
    color: #6ee7b7;
  }
</style>

<div
  class="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8"
  style="background: linear-gradient(160deg, #0a1a0d 0%, #081510 40%, #050a08 100%); background-color: #0c0f0a;"
>
  <!-- Grain texture overlay -->
  <div class="absolute inset-0 pointer-events-none" style="opacity: 0.04;">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="grain-login">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-login)" />
    </svg>
  </div>

  <!-- Ambient glow blobs -->
  <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%);"></div>
  <div class="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%);"></div>

  <!-- Mountain silhouette -->
  <div class="absolute bottom-0 left-0 right-0 pointer-events-none" style="opacity: 0.15;">
    <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M0,200 L0,120 L120,60 L240,100 L360,30 L480,80 L600,20 L720,70 L840,10 L960,55 L1080,25 L1200,65 L1320,40 L1440,80 L1440,200 Z" fill="#4ade80" />
    </svg>
  </div>

  <!-- Card -->
  <div class="relative w-full max-w-md">
    <!-- Brand mark -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style="background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.25);">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 17l4-8 4 4 3-6 4 10" />
          <path d="M3 20h18" />
        </svg>
      </div>
      <h1 class="text-3xl font-black tracking-tight" style="color: #f5f0e8;">Welcome back</h1>
      <p class="mt-1 text-sm" style="color: rgba(245,240,232,0.5);">Sign in to continue your adventures</p>
    </div>

    <!-- Form card -->
    <div class="rounded-2xl p-8 space-y-6" style="background: rgba(245,240,232,0.05); border: 1px solid rgba(245,240,232,0.1); backdrop-filter: blur(12px);">

      {#if verified}
        <div class="rounded-xl p-4 flex items-start gap-3" style="background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25);">
          <svg class="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="#34d399" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-medium" style="color: #6ee7b7;">Email verified! You can now sign in.</p>
        </div>
      {/if}

      {#if form?.error}
        <div class="rounded-xl p-4 flex items-start gap-3" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);">
          <svg class="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="#f87171" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm" style="color: #fca5a5;">{form.error}</p>
        </div>
      {/if}

      <form
        method="POST"
        action="?/login"
        use:enhance={() => {
          isLoading = true;
          return async ({ update }) => {
            await update();
            isLoading = false;
          };
        }}
        class="space-y-4"
      >
        <!-- Email -->
        <div>
          <label for="email" class="block text-xs font-semibold mb-1.5 tracking-wide uppercase" style="color: rgba(245,240,232,0.5);">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
            class="dark-input w-full rounded-xl px-4 py-3 text-sm"
          />
        </div>

        <!-- Password -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="password" class="block text-xs font-semibold tracking-wide uppercase" style="color: rgba(245,240,232,0.5);">Password</label>
            <a href="/forgot-password" class="link-green text-xs">Forgot password?</a>
          </div>
          <div class="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autocomplete="current-password"
              required
              placeholder="••••••••••••"
              class="dark-input w-full rounded-xl px-4 py-3 pr-11 text-sm"
            />
            <button
              type="button"
              class="eye-btn absolute inset-y-0 right-0 z-10 flex items-center pr-3.5"
              on:click={() => (showPassword = !showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {#if showPassword}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              {:else}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
        </div>

        <!-- Submit -->
        <div class="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            class="w-full rounded-full py-3 px-6 text-sm font-bold tracking-wide transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style="background: linear-gradient(135deg, #34d399 0%, #059669 100%); color: #0c0f0a;"
          >
            {#if isLoading}
              <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            {:else}
              Sign in
            {/if}
          </button>
        </div>
      </form>
    </div>

    <!-- Footer link -->
    <p class="text-center mt-6 text-sm" style="color: rgba(245,240,232,0.4);">
      New to Adventure Spark?
      <a href="/signup" class="link-green font-semibold">Create an account</a>
    </p>
  </div>
</div>
