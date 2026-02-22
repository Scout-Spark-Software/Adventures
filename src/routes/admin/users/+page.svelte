<script lang="ts">
  import { ChevronRight } from "lucide-svelte";
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

  const roleBadgeClasses: Record<string, string> = {
    admin: "bg-red-50 text-red-700",
    member: "bg-gray-100 text-gray-600",
  };
</script>

<svelte:head>
  <title>Users - Admin - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <nav class="flex items-center gap-1.5 text-sm mb-6">
      <a href="/admin" class="text-gray-500 hover:text-gray-700 transition-colors">Admin</a>
      <ChevronRight size={14} class="text-gray-300" />
      <span class="text-gray-900 font-medium">Users</span>
    </nav>

    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Users</h1>
      <span class="text-sm text-gray-500">{data.users.length} total</span>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr class="bg-gray-50/50">
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
            >
              Name
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
            >
              Email
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
            >
              Role
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
            >
              Joined
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each data.users as user (user.id)}
            <tr class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {formatName(user)}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {user.email}
              </td>
              <td class="px-6 py-4">
                {#if user.id === data.currentUserId}
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {roleBadgeClasses[
                      user.role
                    ] || roleBadgeClasses.member}"
                  >
                    {user.role}
                  </span>
                {:else}
                  <select
                    value={user.role}
                    on:change={(e) => updateRole(user.id, e.currentTarget.value)}
                    disabled={processingIds.has(user.id)}
                    class="text-sm border border-gray-200 rounded-lg px-2.5 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {#each roles as role}
                      <option value={role}>{role}</option>
                    {/each}
                  </select>
                {/if}
                {#if errors.has(user.id)}
                  <p class="text-xs text-red-600 mt-1">{errors.get(user.id)}</p>
                {/if}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {formatDate(user.createdAt)}
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                No users found.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
