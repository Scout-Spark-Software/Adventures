<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>Sign In - Adventure Spark</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div
  class="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8"
  style="background: linear-gradient(160deg, #0a1a0d 0%, #081510 40%, #050a08 100%); background-color: #0c0f0a;"
>
  <!-- Ambient glow -->
  <div
    class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
    style="background: radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%);"
  ></div>

  <div class="relative w-full max-w-md text-center">
    <!-- Brand mark -->
    <div class="mb-8">
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
          <path d="M3 17l4-8 4 4 3-6 4 10" />
          <path d="M3 20h18" />
        </svg>
      </div>
      <h1 class="text-3xl font-black tracking-tight" style="color: #f5f0e8;">Adventure Spark</h1>
    </div>

    {#if data.passwordReset}
      <div
        class="rounded-xl p-4 mb-6 flex items-start gap-3 text-left"
        style="background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25);"
      >
        <svg class="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="#34d399" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium" style="color: #6ee7b7;">
          Password reset! You can now sign in with your new password.
        </p>
      </div>
    {/if}

    {#if data.authError}
      <div
        class="rounded-xl p-4 mb-6 flex items-start gap-3 text-left"
        style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);"
      >
        <svg class="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="#f87171" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm" style="color: #fca5a5;">Sign in failed. Please try again.</p>
      </div>
    {/if}

    <a
      href="/login"
      class="inline-block w-full rounded-full py-3 px-6 text-sm font-bold tracking-wide"
      style="background: linear-gradient(135deg, #34d399 0%, #059669 100%); color: #0c0f0a;"
    >
      Continue to Sign In
    </a>

    <p class="mt-6 text-sm" style="color: rgba(245,240,232,0.4);">
      New to Adventure Spark?
      <a href="/signup" class="font-semibold" style="color: #34d399;">Create an account</a>
    </p>
  </div>
</div>

<style>
  :global(body) {
    background-color: #0c0f0a;
  }
</style>
