<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData, PageData } from "./$types";

  export let data: PageData;
  export let form: ActionData;

  let isLoading = false;
  let showPassword = false;
  let showConfirm = false;

  $: token = form?.token ?? data.token ?? "";
</script>

<svelte:head>
  <title>Reset Password - Adventure Spark</title>
</svelte:head>

<div
  class="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8"
  style="background: linear-gradient(160deg, #0a1a0d 0%, #081510 40%, #050a08 100%); background-color: #0c0f0a;"
>
  <!-- Grain texture overlay -->
  <div class="absolute inset-0 pointer-events-none" style="opacity: 0.04;">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="grain-reset">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-reset)" />
    </svg>
  </div>

  <!-- Ambient glow blobs -->
  <div
    class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
    style="background: radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%);"
  ></div>
  <div
    class="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
    style="background: radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%);"
  ></div>

  <!-- Mountain silhouette -->
  <div class="absolute bottom-0 left-0 right-0 pointer-events-none" style="opacity: 0.15;">
    <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path
        d="M0,200 L0,120 L120,60 L240,100 L360,30 L480,80 L600,20 L720,70 L840,10 L960,55 L1080,25 L1200,65 L1320,40 L1440,80 L1440,200 Z"
        fill="#4ade80"
      />
    </svg>
  </div>

  <!-- Card -->
  <div class="relative w-full max-w-md">
    <!-- Brand mark -->
    <div class="text-center mb-8">
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
        style="background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.25);"
      >
        <svg
          class="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#34d399"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1 class="text-3xl font-black tracking-tight" style="color: #f5f0e8;">New password</h1>
      <p class="mt-1 text-sm" style="color: rgba(245,240,232,0.5);">
        Choose a strong password for your account
      </p>
    </div>

    <!-- Form card -->
    <div
      class="rounded-2xl p-8 space-y-6"
      style="background: rgba(245,240,232,0.05); border: 1px solid rgba(245,240,232,0.1); backdrop-filter: blur(12px);"
    >
      {#if !token}
        <div
          class="rounded-xl p-4 flex items-start gap-3"
          style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);"
        >
          <svg
            class="h-5 w-5 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="#f87171"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p class="text-sm font-medium" style="color: #fca5a5;">Invalid reset link</p>
            <p class="text-sm mt-0.5" style="color: rgba(252,165,165,0.75);">
              This link is missing a reset token. Please request a new one.
            </p>
          </div>
        </div>
        <a
          href="/forgot-password"
          class="block w-full text-center rounded-full py-3 px-6 text-sm font-bold tracking-wide"
          style="background: linear-gradient(135deg, #34d399 0%, #059669 100%); color: #0c0f0a;"
        >
          Request new reset link
        </a>
      {:else}
        {#if form?.error}
          <div
            class="rounded-xl p-4 flex items-start gap-3"
            style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);"
          >
            <svg
              class="h-5 w-5 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="#f87171"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-sm" style="color: #fca5a5;">{form.error}</p>
          </div>
        {/if}

        <form
          method="POST"
          use:enhance={() => {
            isLoading = true;
            return async ({ update }) => {
              await update();
              isLoading = false;
            };
          }}
          class="space-y-4"
        >
          <input type="hidden" name="token" value={token} />

          <!-- New password -->
          <div>
            <label
              for="password"
              class="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
              style="color: rgba(245,240,232,0.5);">New password</label
            >
            <div class="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autocomplete="new-password"
                required
                minlength="8"
                placeholder="At least 8 characters"
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
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                {:else}
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                {/if}
              </button>
            </div>
          </div>

          <!-- Confirm password -->
          <div>
            <label
              for="confirmPassword"
              class="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
              style="color: rgba(245,240,232,0.5);">Confirm password</label
            >
            <div class="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autocomplete="new-password"
                required
                minlength="8"
                placeholder="Repeat your password"
                class="dark-input w-full rounded-xl px-4 py-3 pr-11 text-sm"
              />
              <button
                type="button"
                class="eye-btn absolute inset-y-0 right-0 z-10 flex items-center pr-3.5"
                on:click={() => (showConfirm = !showConfirm)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {#if showConfirm}
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                {:else}
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                {/if}
              </button>
            </div>
          </div>

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
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Resetting...
                </span>
              {:else}
                Reset password
              {/if}
            </button>
          </div>
        </form>
      {/if}
    </div>

    <!-- Footer link -->
    <p class="text-center mt-6 text-sm" style="color: rgba(245,240,232,0.4);">
      Remember your password?
      <a href="/login" class="link-green font-semibold">Sign in</a>
    </p>
  </div>
</div>

<style>
  :global(body) {
    background-color: #0c0f0a;
  }
  .dark-input {
    background: rgba(245, 240, 232, 0.07);
    border: 1px solid rgba(245, 240, 232, 0.12);
    color: #f5f0e8;
    transition:
      border-color 0.15s,
      background 0.15s;
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
