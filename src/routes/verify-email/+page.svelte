<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData, ActionData } from "./$types";

  export let data: PageData;
  export let form: ActionData;

  let verifying = false;
  let resending = false;
</script>

<svelte:head>
  <title>Verify Email - Adventure Spark</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <div
        class="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
      >
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
      </div>
      <h2 class="text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
      <p class="mt-2 text-sm text-gray-600">
        We sent a verification code to <span class="font-semibold text-gray-900"
          >{data.email}</span
        >
      </p>
    </div>

    <div class="mt-8 bg-white rounded-xl shadow-xl p-8 space-y-6">
      {#if form?.error}
        <div class="rounded-lg bg-red-50 border border-red-200 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
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
              <svg
                class="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
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
          verifying = true;
          return async ({ update }) => {
            await update();
            verifying = false;
          };
        }}
      >
        <div>
          <label
            for="code"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
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
          <p class="mt-2 text-xs text-gray-500">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div class="mt-6">
          <button
            type="submit"
            disabled={verifying}
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {#if verifying}
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
          <span class="px-2 bg-white text-gray-500"
            >Didn't receive the code?</span
          >
        </div>
      </div>

      <form
        method="POST"
        action="?/resend"
        use:enhance={() => {
          resending = true;
          return async ({ update }) => {
            await update();
            resending = false;
          };
        }}
      >
        <button
          type="submit"
          disabled={resending}
          class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {#if resending}
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
    </div>

    <p class="text-center text-sm text-gray-600">
      Already verified? <a
        href="/login"
        class="font-medium text-indigo-600 hover:text-indigo-500">Sign in</a
      >
    </p>
  </div>
</div>
