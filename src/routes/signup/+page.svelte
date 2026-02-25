<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData, ActionData } from "./$types";

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

  // Password requirement checks
  $: hasMinLength = password.length >= 12;
  $: hasUppercase = /[A-Z]/.test(password);
  $: hasLowercase = /[a-z]/.test(password);
  $: hasNumber = /[0-9]/.test(password);
  $: passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  $: allRequirementsMet = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  // Check if we're in verification mode from server load or form response
  $: if (data.needsVerification || form?.needsVerification) {
    showVerification = true;
    userEmail = data.email || form?.email || "";
    userId = data.userId || form?.userId || "";
  }
</script>

<svelte:head>
  <title>{showVerification ? "Verify Email" : "Sign Up"} - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <div
        class="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
      >
        {#if showVerification}
          <svg
            class="h-8 w-8 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        {:else}
          <svg
            class="h-8 w-8 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        {/if}
      </div>
      <h2 class="text-center text-3xl font-extrabold text-gray-900">
        {showVerification ? "Verify Your Email" : "Create your account"}
      </h2>
      {#if showVerification}
        <p class="mt-2 text-center text-sm text-gray-600">
          We sent a verification code to <span class="font-semibold text-gray-900">{userEmail}</span
          >
        </p>
      {/if}
    </div>

    {#if !showVerification}
      <!-- Sign Up Form -->
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
        class="mt-8 space-y-6"
      >
        {#if form?.error}
          <div class="rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-800">{form.error}</div>
          </div>
        {/if}
        <div class="space-y-4">
          <div>
            <label for="name" class="sr-only">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Full name"
            />
          </div>
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>

          <!-- Password field -->
          <div class="relative">
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autocomplete="new-password"
              required
              bind:value={password}
              class="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Password"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              on:click={() => (showPassword = !showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {#if showPassword}
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              {:else}
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>

            <!-- Password requirements tooltip — floats to the right, no layout shift -->
            {#if password.length > 0}
              <div class="absolute left-full top-0 ml-3 w-52 z-50">
                <!-- Arrow pointing left -->
                <div class="relative">
                  <div class="absolute -left-1.5 top-3 w-3 h-3 rotate-45 bg-white border-l border-b border-gray-200"></div>
                  <div class="rounded-lg bg-white border border-gray-200 shadow-lg p-3 space-y-1.5">
                    <p class="text-xs font-medium text-gray-500 mb-1">Password must have:</p>
                    {#each [
                      { met: hasMinLength, label: "12+ characters" },
                      { met: hasUppercase, label: "Uppercase letter" },
                      { met: hasLowercase, label: "Lowercase letter" },
                      { met: hasNumber,    label: "Number" },
                    ] as req}
                      <div class="flex items-center gap-1.5">
                        {#if req.met}
                          <svg class="h-3.5 w-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        {:else}
                          <svg class="h-3.5 w-3.5 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        {/if}
                        <span class="text-xs {req.met ? 'text-green-700' : 'text-gray-400'}">{req.label}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <!-- Confirm password field -->
          <div>
            <div class="relative">
              <label for="confirmPassword" class="sr-only">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autocomplete="new-password"
                required
                bind:value={confirmPassword}
                class="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border placeholder-gray-500 text-gray-900 focus:outline-none sm:text-sm
                  {confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'border-green-400 focus:ring-green-500 focus:border-green-500'
                      : 'border-red-400 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}"
                placeholder="Confirm password"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                on:click={() => (showConfirmPassword = !showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {#if showConfirmPassword}
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                {:else}
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                {/if}
              </button>
            </div>
            {#if confirmPassword.length > 0 && !passwordsMatch}
              <p class="mt-1 text-xs text-red-600">Passwords do not match</p>
            {/if}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSigningUp || !allRequirementsMet || !passwordsMatch}
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if isSigningUp}
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
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
            {:else}
              Sign up
            {/if}
          </button>
        </div>
      </form>
      <div class="text-center">
        <a href="/login" class="text-sm text-indigo-600 hover:text-indigo-500">
          Already have an account? Sign in
        </a>
      </div>
    {:else}
      <!-- Verification Form -->
      <div class="mt-8 space-y-6">
        {#if form?.error}
          <div class="rounded-lg bg-red-50 border border-red-200 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-800">{form.error}</p>
              </div>
            </div>
          </div>
        {/if}

        {#if form?.success}
          <div class="rounded-lg bg-green-50 border border-green-200 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-800">{form.message}</p>
              </div>
            </div>
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
        >
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="email" value={userEmail} />

          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputmode="numeric"
              required
              maxlength="6"
              minlength="6"
              placeholder="Enter 6-digit code"
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-2xl"
            />
            <p class="mt-2 text-xs text-gray-500">Enter the 6-digit code sent to your email</p>
          </div>

          <div class="mt-6">
            <button
              type="submit"
              disabled={isVerifying}
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {#if isVerifying}
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
              {:else}
                Verify Email
              {/if}
            </button>
          </div>
        </form>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">Didn't receive the code?</span>
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
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {#if isResending}
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
              >
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
            {:else}
              Resend Verification Code
            {/if}
          </button>
        </form>

        <p class="text-center text-sm text-gray-600 mt-4">
          Already verified? <a
            href="/login"
            class="font-medium text-indigo-600 hover:text-indigo-500">Sign in</a
          >
        </p>
      </div>
    {/if}
  </div>
</div>
