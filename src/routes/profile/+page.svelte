<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { goto } from "$app/navigation";
  import { enhance } from "$app/forms";
  import Tabs from "$lib/components/Tabs.svelte";
  import NotesSection from "$lib/components/NotesSection.svelte";

  export let data: PageData;
  export let form: ActionData;

  let activeTab = "profile";
  $: tabs = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "notes", label: "Notes" },
  ];

  let isChangingPassword = false;

  async function handleLogout() {
    await fetch("/logout", { method: "POST" });
    goto("/login");
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Profile Header -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-2">
        <div
          class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
        >
          {data.user.email?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {data.user.name || "Your Profile"}
          </h1>
          <p class="text-gray-600">{data.user.email}</p>
        </div>
      </div>
    </div>

    <Tabs {tabs} bind:activeTab>
      {#if activeTab === "profile"}
        <div class="bg-white shadow-lg rounded-xl overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white">Account Information</h2>
          </div>

          <div class="px-6 py-6">
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors"
                >
                  <label
                    class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                    >Email Address</label
                  >
                  <p class="text-base text-gray-900 font-medium">
                    {data.user.email}
                  </p>
                </div>

                <div
                  class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors"
                >
                  <label
                    class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                    >Display Name</label
                  >
                  <p class="text-base text-gray-900 font-medium">
                    {data.user.name || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-8 pt-6 border-t border-gray-200">
              <button
                on:click={handleLogout}
                type="button"
                class="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      {:else if activeTab === "security"}
        <div class="bg-white shadow-lg rounded-xl overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white">Security Settings</h2>
          </div>

          <div class="px-6 py-6">
            {#if form?.success}
              <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center gap-2">
                  <svg
                    class="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p class="text-sm text-green-800 font-medium">
                    {form.message}
                  </p>
                </div>
              </div>
            {/if}

            {#if form?.error}
              <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-center gap-2">
                  <svg
                    class="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p class="text-sm text-red-800 font-medium">{form.error}</p>
                </div>
              </div>
            {/if}

            <form
              method="POST"
              action="?/changePassword"
              use:enhance={() => {
                isChangingPassword = true;
                return async ({ update }) => {
                  await update();
                  isChangingPassword = false;
                };
              }}
              class="space-y-6"
            >
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <p class="text-sm text-gray-600 mb-4">
                  Update your password to keep your account secure.
                </p>
              </div>

              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  minlength="8"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p class="mt-1 text-sm text-gray-500">Must be at least 8 characters long</p>
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  minlength="8"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div class="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  class="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      {:else if activeTab === "notes"}
        <NotesSection userId={data.user.id} />
      {/if}
    </Tabs>
  </div>
</div>
