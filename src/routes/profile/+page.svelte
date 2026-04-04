<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { goto } from "$app/navigation";
  import { enhance } from "$app/forms";
  import Tabs from "$lib/components/Tabs.svelte";
  import NotesSection from "$lib/components/NotesSection.svelte";
  import { Check, CircleAlertIcon, LogOut, Lock, Mail, UserCircle, Shield } from "lucide-svelte";
  import CouncilSelect from "$lib/components/CouncilSelect.svelte";

  export let data: PageData;
  export let form: ActionData;

  let activeTab = "profile";
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "notes", label: "My Notes" },
  ];

  let isChangingPassword = false;
  let isSavingProfile = false;

  async function handleLogout() {
    await fetch("/logout", { method: "POST" });
    goto("/login");
  }

  $: initials = (data.user.name?.[0] ?? data.user.email[0]).toUpperCase();
  $: displayName = data.user.name || data.user.email.split("@")[0];
</script>

<svelte:head>
  <title>Profile — Adventure Spark</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-stone-100">
  <!-- Full-bleed dark banner, pulled up behind nav -->
  <div class="relative overflow-hidden profile-banner -mt-16">
    <div class="absolute inset-0 banner-gradient"></div>
    <div class="absolute inset-0 grain-overlay pointer-events-none"></div>
    <!-- Mountain silhouettes -->
    <div class="absolute bottom-0 left-0 right-0 pointer-events-none">
      <svg class="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path
          d="M0,120 L0,80 L200,45 L400,70 L600,30 L800,60 L1000,35 L1200,65 L1440,40 L1440,120 Z"
          fill="rgba(6,78,59,0.35)"
        />
        <path
          d="M0,120 L0,95 L240,65 L480,85 L700,55 L920,78 L1140,58 L1440,72 L1440,120 Z"
          fill="rgba(2,44,34,0.55)"
        />
      </svg>
    </div>

    <!-- Avatar + name, padded to clear the nav -->
    <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div class="flex items-center gap-5">
        <div
          class="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl flex-shrink-0 border-2 border-white/20"
          style="background: linear-gradient(135deg, #059669, #34d399);"
        >
          {initials}
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-black leading-tight mb-0.5" style="color: #f5f0e8;">
            {displayName}
          </h1>
          <p class="text-sm" style="color: rgba(245,240,232,0.45);">{data.user.email}</p>
          {#if data.user.role === "admin"}
            <span
              class="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold"
              style="background: rgba(251,146,60,0.15); border: 1px solid rgba(251,146,60,0.35); color: rgb(251,146,60);"
            >
              Admin
            </span>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Main content area -->
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div class="px-6">
        <Tabs {tabs} bind:activeTab>
          {#if activeTab === "profile"}
            <div class="space-y-6 pb-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="rounded-xl p-5 bg-stone-50 border border-stone-100">
                  <div class="flex items-center gap-2 mb-3">
                    <Mail size={13} class="text-stone-400" />
                    <p class="text-xs font-bold text-stone-400 uppercase tracking-widest">Email</p>
                  </div>
                  <p class="text-sm font-semibold text-stone-900">{data.user.email}</p>
                </div>
                <div class="rounded-xl p-5 bg-stone-50 border border-stone-100">
                  <div class="flex items-center gap-2 mb-3">
                    <UserCircle size={13} class="text-stone-400" />
                    <p class="text-xs font-bold text-stone-400 uppercase tracking-widest">
                      Display Name
                    </p>
                  </div>
                  <p class="text-sm font-semibold text-stone-900">{data.user.name || "Not set"}</p>
                </div>
              </div>

              <!-- Scout Unit Information -->
              <div class="pt-4 border-t border-stone-100">
                <h3 class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                  Scout Unit
                </h3>

                {#if form?.profileSuccess}
                  <div
                    class="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3"
                  >
                    <div
                      class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
                    >
                      <Check size={13} class="text-white" />
                    </div>
                    <p class="text-sm font-semibold text-emerald-800">Unit info saved!</p>
                  </div>
                {/if}
                {#if form?.profileError}
                  <div
                    class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                  >
                    <div
                      class="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"
                    >
                      <CircleAlertIcon size={13} class="text-white" />
                    </div>
                    <p class="text-sm font-semibold text-red-800">{form.profileError}</p>
                  </div>
                {/if}

                <form
                  method="POST"
                  action="?/saveProfile"
                  use:enhance={() => {
                    isSavingProfile = true;
                    return async ({ update }) => {
                      await update();
                      isSavingProfile = false;
                    };
                  }}
                  class="space-y-4"
                >
                  <div>
                    <label
                      for="councilId"
                      class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2"
                      >Council</label
                    >
                    <CouncilSelect
                      id="councilId"
                      name="councilId"
                      value={data.profile?.councilId ?? ""}
                      councils={data.councils}
                      placeholder="Select your council..."
                      variant="form"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        for="unitType"
                        class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2"
                        >Unit Type</label
                      >
                      <select
                        id="unitType"
                        name="unitType"
                        value={data.profile?.unitType ?? ""}
                        class="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all outline-none"
                      >
                        <option value="">Select type...</option>
                        <option value="Pack">Pack (Cub Scouts)</option>
                        <option value="Troop">Troop (Scouts BSA)</option>
                        <option value="Crew">Crew (Venturing)</option>
                        <option value="Ship">Ship (Sea Scouts)</option>
                        <option value="Post">Post (Exploring)</option>
                      </select>
                    </div>
                    <div>
                      <label
                        for="unitNumber"
                        class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2"
                        >Unit Number</label
                      >
                      <input
                        type="text"
                        id="unitNumber"
                        name="unitNumber"
                        value={data.profile?.unitNumber ?? ""}
                        maxlength="10"
                        placeholder="e.g. 42"
                        class="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div
                    class="rounded-xl p-4 bg-stone-50 border border-stone-100 flex items-start gap-4"
                  >
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <Shield size={13} class="text-stone-400" />
                        <p class="text-xs font-bold text-stone-500 uppercase tracking-widest">
                          Display Unit Info Publicly
                        </p>
                      </div>
                      <p class="text-xs text-stone-400">
                        When on, your name and unit appear on submissions and reviews. Toggle off to
                        hide this info from all your past and future posts.
                      </p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer mt-0.5">
                      <input
                        type="checkbox"
                        name="showUnitInfo"
                        class="sr-only peer"
                        checked={data.profile?.showUnitInfo ?? true}
                      />
                      <div
                        class="w-10 h-6 bg-stone-200 peer-focus:ring-2 peer-focus:ring-emerald-400 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                      ></div>
                    </label>
                  </div>

                  <div class="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-stone-950 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      style="background: linear-gradient(135deg, #86efac, #34d399);"
                    >
                      {isSavingProfile ? "Saving..." : "Save Unit Info"}
                    </button>
                  </div>
                </form>
              </div>

              <div class="pt-2 border-t border-stone-100">
                <p class="text-xs text-stone-400 mb-3">Done for the day?</p>
                <button
                  on:click={handleLogout}
                  type="button"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style="background: linear-gradient(135deg, #ef4444, #dc2626);"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          {:else if activeTab === "security"}
            <div class="pb-6">
              {#if form?.success}
                <div
                  class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3"
                >
                  <div
                    class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
                  >
                    <Check size={13} class="text-white" />
                  </div>
                  <p class="text-sm font-semibold text-emerald-800">{form.message}</p>
                </div>
              {/if}
              {#if form?.error}
                <div
                  class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                >
                  <div
                    class="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"
                  >
                    <CircleAlertIcon size={13} class="text-white" />
                  </div>
                  <p class="text-sm font-semibold text-red-800">{form.error}</p>
                </div>
              {/if}

              <p class="text-sm text-stone-500 mb-6">
                Update your password to keep your account secure.
              </p>

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
                class="space-y-5 max-w-sm"
              >
                <div>
                  <label
                    for="currentPassword"
                    class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2"
                    >Current Password</label
                  >
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    required
                    class="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  />
                </div>
                <div>
                  <label
                    for="newPassword"
                    class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2"
                    >New Password</label
                  >
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    required
                    minlength="8"
                    class="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  />
                  <p class="mt-1.5 text-xs text-stone-400">At least 8 characters</p>
                </div>
                <div>
                  <label
                    for="confirmPassword"
                    class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2"
                    >Confirm New Password</label
                  >
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    minlength="8"
                    class="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  />
                </div>
                <div class="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-stone-950 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style="background: linear-gradient(135deg, #86efac, #34d399);"
                  >
                    <Lock size={14} />
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          {:else if activeTab === "notes"}
            <div class="pb-6">
              <NotesSection userId={data.user.id} />
            </div>
          {/if}
        </Tabs>
      </div>
    </div>
  </div>
</div>

<style>
  .profile-banner {
    background-color: #0c0f0a;
  }
  .banner-gradient {
    background:
      radial-gradient(ellipse 70% 150% at 85% 50%, rgba(52, 211, 153, 0.12) 0%, transparent 55%),
      radial-gradient(ellipse 50% 120% at 5% 50%, rgba(251, 146, 60, 0.08) 0%, transparent 55%),
      linear-gradient(160deg, #0a1a0d 0%, #060d09 100%);
  }
  .grain-overlay {
    opacity: 0.04;
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");
    background-size: 200px 200px;
  }
</style>
