<script lang="ts">
  import { ChevronRight, Users } from "lucide-svelte";
  import type { PageData } from "./$types";
  import { invalidateAll } from "$app/navigation";

  export let data: PageData;

  let processingIds = new Set<string>();
  let errors = new Map<string, string>();

  async function updateRole(userId: string, role: string) {
    if (processingIds.has(userId)) return;

    processingIds.add(userId);
    processingIds = processingIds;
    errors.delete(userId);
    errors = errors;

    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const err = await response.json();
        errors.set(userId, err.message || "Failed to update role");
        errors = errors;
        return;
      }

      await invalidateAll();
    } catch (err) {
      console.error("Failed to update role:", err);
      errors.set(userId, "Failed to update role. Please try again.");
      errors = errors;
    } finally {
      processingIds.delete(userId);
      processingIds = processingIds;
    }
  }

  function formatName(user: { firstName: string | null; lastName: string | null; email: string }) {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : user.email;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const roles = ["admin", "member"] as const;

  function roleBadgeClass(role: string) {
    if (role === "admin") return "bg-red-500/20 text-red-300 border-red-500/30";
    return "bg-stone-500/20 text-stone-400 border-stone-500/30";
  }

  function avatarLetter(user: { firstName: string | null; email: string }) {
    return (user.firstName?.[0] ?? user.email[0]).toUpperCase();
  }
</script>

<svelte:head>
  <title>Users - Admin - Adventure Spark</title>
</svelte:head>

<div class="grain"></div>

<div class="relative z-10 min-h-screen pt-10 pb-16">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-1.5 text-sm mb-6">
      <a href="/admin" class="text-stone-400 hover:text-stone-200 transition-colors">Admin</a>
      <ChevronRight size={14} class="text-stone-600" />
      <span class="text-stone-200 font-medium">Users</span>
    </nav>

    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-emerald-500/15 border border-emerald-500/25 rounded-xl">
          <Users size={20} class="text-emerald-400" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-stone-100">Users</h1>
          <p class="text-sm text-stone-400">
            {data.users.length} registered user{data.users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
      <!-- Desktop table -->
      <div class="hidden sm:block">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-white/10">
              <th
                class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider"
                >User</th
              >
              <th
                class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider"
                >Email</th
              >
              <th
                class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider"
                >Role</th
              >
              <th
                class="px-5 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider"
                >Joined</th
              >
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            {#each data.users as user (user.id)}
              <tr class="hover:bg-white/3 transition-colors">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-bold flex-shrink-0"
                    >
                      {avatarLetter(user)}
                    </div>
                    <span class="text-sm font-medium text-stone-200">{formatName(user)}</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-sm text-stone-500">
                  {user.email}
                </td>
                <td class="px-5 py-4">
                  {#if user.id === data.currentUserId}
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border {roleBadgeClass(
                        user.role
                      )}"
                    >
                      {user.role}
                    </span>
                  {:else}
                    <div>
                      <select
                        value={user.role}
                        on:change={(e) => updateRole(user.id, e.currentTarget.value)}
                        disabled={processingIds.has(user.id)}
                        class="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {#each roles as role (role)}
                          <option value={role} class="bg-stone-900">{role}</option>
                        {/each}
                      </select>
                      {#if errors.has(user.id)}
                        <p class="text-xs text-red-400 mt-1">{errors.get(user.id)}</p>
                      {/if}
                    </div>
                  {/if}
                </td>
                <td class="px-5 py-4 text-sm text-stone-500">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="4" class="px-5 py-12 text-center text-stone-600 text-sm"
                  >No users found.</td
                >
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Mobile card list -->
      <div class="sm:hidden divide-y divide-white/5">
        {#each data.users as user (user.id)}
          <div class="px-4 py-4">
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-9 h-9 rounded-full bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 flex items-center justify-center text-sm font-bold flex-shrink-0"
              >
                {avatarLetter(user)}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-stone-200 truncate">{formatName(user)}</p>
                <p class="text-xs text-stone-500 truncate">{user.email}</p>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-stone-600">{formatDate(user.createdAt)}</span>
              {#if user.id === data.currentUserId}
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border {roleBadgeClass(
                    user.role
                  )}"
                >
                  {user.role}
                </span>
              {:else}
                <select
                  value={user.role}
                  on:change={(e) => updateRole(user.id, e.currentTarget.value)}
                  disabled={processingIds.has(user.id)}
                  class="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {#each roles as role (role)}
                    <option value={role} class="bg-stone-900">{role}</option>
                  {/each}
                </select>
              {/if}
            </div>
            {#if errors.has(user.id)}
              <p class="text-xs text-red-400 mt-2">{errors.get(user.id)}</p>
            {/if}
          </div>
        {:else}
          <div class="px-4 py-12 text-center text-stone-600 text-sm">No users found.</div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .grain {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }
</style>
