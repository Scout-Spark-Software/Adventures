<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData, ActionData } from "./$types";
  import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
  import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
  import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

  zxcvbnOptions.setOptions({
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
  });

  export let data: PageData;
  export let form: ActionData;

  let isSigningUp = false;
  let isVerifying = false;
  let isResending = false;
  let showVerification = false;
  let userEmail = "";
  let userId = "";

  let password = "";
  let confirmPassword = "";
  let showPassword = false;
  let showConfirmPassword = false;

  const MIN_STRENGTH = 3;

  $: strengthResult = password.length > 0 ? zxcvbn(password) : null;
  $: strengthScore = strengthResult?.score ?? 0;
  $: strengthFeedback = strengthResult?.feedback?.suggestions ?? [];
  $: strengthWarning = strengthResult?.feedback?.warning ?? "";

  const strengthLabels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
  const strengthColors = ["#ef4444", "#f97316", "#eab308", "#34d399", "#34d399"];

  $: hasMinLength = password.length >= 12;
  $: passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  $: allRequirementsMet = hasMinLength && strengthScore >= MIN_STRENGTH;

  // Check if we're in verification mode from server load or form response
  $: if (data.needsVerification || form?.needsVerification) {
    showVerification = true;
    userEmail = data.email || form?.email || "";
    userId = data.userId || form?.userId || "";
  }
</script>

<svelte:head>
  <title>{showVerification ? "Verify Email" : "Sign Up"} - Adventure Spark</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div
  class="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8"
  style="background: linear-gradient(160deg, #0a1a0d 0%, #081510 40%, #050a08 100%); background-color: #0c0f0a;"
>
  <!-- Grain texture overlay -->
  <div class="absolute inset-0 pointer-events-none" style="opacity: 0.04;">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="grain-signup">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-signup)" />
    </svg>
  </div>

  <!-- Ambient glow blobs -->
  <div
    class="absolute top-1/4 right-1/3 w-96 h-96 rounded-full pointer-events-none"
    style="background: radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%);"
  ></div>
  <div
    class="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full pointer-events-none"
    style="background: radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%);"
  ></div>

  <!-- Mountain silhouette -->
  <div class="absolute bottom-0 left-0 right-0 pointer-events-none" style="opacity: 0.12;">
    <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path
        d="M0,200 L0,130 L100,70 L200,110 L340,40 L460,90 L580,25 L700,75 L820,15 L940,60 L1060,30 L1180,70 L1300,45 L1440,85 L1440,200 Z"
        fill="#4ade80"
      />
    </svg>
  </div>

  <!-- Card -->
  <div class="relative w-full max-w-md">
    {#if !showVerification}
      <!-- Sign Up state -->
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
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
            <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 class="text-3xl font-black tracking-tight" style="color: #f5f0e8;">
          Start your journey
        </h1>
        <p class="mt-1 text-sm" style="color: rgba(245,240,232,0.5);">
          Create your free Adventure Spark account
        </p>
      </div>

      <div
        class="rounded-2xl p-8 space-y-6"
        style="background: rgba(245,240,232,0.05); border: 1px solid rgba(245,240,232,0.1); backdrop-filter: blur(12px);"
      >
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
          action="?/signup"
          use:enhance={() => {
            isSigningUp = true;
            return async ({ update }) => {
              await update();
              isSigningUp = false;
            };
          }}
          class="space-y-4"
        >
          <!-- Name -->
          <div>
            <label
              for="name"
              class="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
              style="color: rgba(245,240,232,0.5);">Full name</label
            >
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Alex Rivera"
              class="dark-input w-full rounded-xl px-4 py-3 text-sm"
            />
          </div>

          <!-- Email -->
          <div>
            <label
              for="email"
              class="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
              style="color: rgba(245,240,232,0.5);">Email</label
            >
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
            <label
              for="password"
              class="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
              style="color: rgba(245,240,232,0.5);">Password</label
            >
            <div class="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autocomplete="new-password"
                required
                bind:value={password}
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

              <!-- Strength meter -->
              {#if password.length > 0}
                <div class="mt-2.5 space-y-1.5">
                  <!-- Bar -->
                  <div class="flex gap-1">
                    {#each [0, 1, 2, 3, 4] as i (i)}
                      <div
                        class="h-1.5 flex-1 rounded-full transition-colors duration-200"
                        style="background: {i <= strengthScore
                          ? strengthColors[strengthScore]
                          : 'rgba(245,240,232,0.1)'};"
                      ></div>
                    {/each}
                  </div>
                  <!-- Label row -->
                  <div class="flex items-center justify-between">
                    <span class="text-xs" style="color: {strengthColors[strengthScore]};">
                      {strengthLabels[strengthScore]}
                    </span>
                    {#if !hasMinLength}
                      <span class="text-xs" style="color: rgba(245,240,232,0.35);">12+ characters required</span>
                    {:else if strengthScore < MIN_STRENGTH}
                      <span class="text-xs" style="color: rgba(245,240,232,0.35);">Too weak for signup</span>
                    {/if}
                  </div>
                  <!-- Feedback -->
                  {#if strengthWarning}
                    <p class="text-xs" style="color: rgba(245,240,232,0.4);">{strengthWarning}</p>
                  {/if}
                  {#if strengthFeedback.length > 0 && strengthScore < MIN_STRENGTH}
                    <ul class="space-y-0.5">
                      {#each strengthFeedback as suggestion (suggestion)}
                        <li class="text-xs" style="color: rgba(245,240,232,0.4);">• {suggestion}</li>
                      {/each}
                    </ul>
                  {/if}
                </div>
              {/if}
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
                type={showConfirmPassword ? "text" : "password"}
                autocomplete="new-password"
                required
                bind:value={confirmPassword}
                placeholder="••••••••••••"
                class="dark-input w-full rounded-xl px-4 py-3 pr-11 text-sm"
                class:dark-input-match={confirmPassword.length > 0 && passwordsMatch}
                class:dark-input-mismatch={confirmPassword.length > 0 && !passwordsMatch}
              />
              <button
                type="button"
                class="eye-btn absolute inset-y-0 right-0 z-10 flex items-center pr-3.5"
                on:click={() => (showConfirmPassword = !showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {#if showConfirmPassword}
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
            {#if confirmPassword.length > 0 && !passwordsMatch}
              <p class="mt-1.5 text-xs" style="color: #f87171;">Passwords do not match</p>
            {/if}
          </div>

          <!-- Submit -->
          <div class="pt-2">
            <button
              type="submit"
              disabled={isSigningUp || !allRequirementsMet || !passwordsMatch}
              class="w-full rounded-full py-3 px-6 text-sm font-bold tracking-wide transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style="background: linear-gradient(135deg, #34d399 0%, #059669 100%); color: #0c0f0a;"
            >
              {#if isSigningUp}
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
                  Creating account...
                </span>
              {:else}
                Create account
              {/if}
            </button>
          </div>
        </form>
      </div>

      <p class="text-center mt-6 text-sm" style="color: rgba(245,240,232,0.4);">
        Already have an account?
        <a href="/login" class="link-green font-semibold">Sign in</a>
      </p>
    {:else}
      <!-- Verification state -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
          style="background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.25);"
        >
          <svg
            class="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fbbf24"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 class="text-3xl font-black tracking-tight" style="color: #f5f0e8;">Check your inbox</h1>
        <p class="mt-2 text-sm" style="color: rgba(245,240,232,0.5);">
          We sent a code to <span class="font-semibold" style="color: rgba(245,240,232,0.8);"
            >{userEmail}</span
          >
        </p>
      </div>

      <div
        class="rounded-2xl p-8 space-y-6"
        style="background: rgba(245,240,232,0.05); border: 1px solid rgba(245,240,232,0.1); backdrop-filter: blur(12px);"
      >
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

        {#if form?.success}
          <div
            class="rounded-xl p-4 flex items-start gap-3"
            style="background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25);"
          >
            <svg
              class="h-5 w-5 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="#34d399"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-sm" style="color: #6ee7b7;">{form.message}</p>
          </div>
        {/if}

        <form
          method="POST"
          action="?/verify"
          use:enhance={() => {
            isVerifying = true;
            return async ({ update }) => {
              await update();
              isVerifying = false;
            };
          }}
          class="space-y-4"
        >
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="email" value={userEmail} />

          <div>
            <label
              for="code"
              class="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
              style="color: rgba(245,240,232,0.5);">Verification code</label
            >
            <input
              id="code"
              name="code"
              type="text"
              inputmode="numeric"
              required
              maxlength="6"
              minlength="6"
              placeholder="000000"
              class="dark-input dark-input-amber w-full rounded-xl px-4 py-4 text-center text-2xl font-mono"
              style="letter-spacing: 0.4em;"
            />
            <p class="mt-1.5 text-xs text-center" style="color: rgba(245,240,232,0.35);">
              Enter the 6-digit code from your email
            </p>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              disabled={isVerifying}
              class="w-full rounded-full py-3 px-6 text-sm font-bold tracking-wide transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style="background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); color: #0c0f0a;"
            >
              {#if isVerifying}
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
                  Verifying...
                </span>
              {:else}
                Verify email
              {/if}
            </button>
          </div>
        </form>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full" style="border-top: 1px solid rgba(245,240,232,0.1);"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span
              class="px-3"
              style="background: rgba(8,21,16,0.95); color: rgba(245,240,232,0.35);"
              >Didn't receive the code?</span
            >
          </div>
        </div>

        <form
          method="POST"
          action="?/resend"
          use:enhance={() => {
            isResending = true;
            return async ({ update }) => {
              await update();
              isResending = false;
            };
          }}
        >
          <input type="hidden" name="userId" value={userId} />
          <button
            type="submit"
            disabled={isResending}
            class="ghost-btn w-full rounded-full py-2.5 px-6 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if isResending}
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
                Sending...
              </span>
            {:else}
              Resend code
            {/if}
          </button>
        </form>
      </div>

      <p class="text-center mt-6 text-sm" style="color: rgba(245,240,232,0.4);">
        Already verified?
        <a href="/login" class="link-green font-semibold">Sign in</a>
      </p>
    {/if}
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
  .dark-input-amber:focus {
    outline: none;
    border-color: rgba(251, 191, 36, 0.5);
    background: rgba(245, 240, 232, 0.09);
  }
  .dark-input-match {
    border-color: rgba(52, 211, 153, 0.5) !important;
  }
  .dark-input-mismatch {
    border-color: rgba(239, 68, 68, 0.5) !important;
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
  .ghost-btn {
    background: rgba(245, 240, 232, 0.07);
    border: 1px solid rgba(245, 240, 232, 0.15);
    color: rgba(245, 240, 232, 0.7);
    transition: background 0.15s;
  }
  .ghost-btn:hover {
    background: rgba(245, 240, 232, 0.12);
  }
</style>
