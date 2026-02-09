<script lang="ts">
  import type { Status } from "$lib/db/schemas";

  export let status: Status;
  export let userRole: "admin" | "moderator" | "user" | null = null;

  $: canViewBadge = userRole === "admin" || userRole === "moderator";
</script>

{#if canViewBadge}
  {#if status === "pending"}
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
    >
      Pending
    </span>
  {:else if status === "approved"}
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
    >
      Approved
    </span>
  {:else if status === "rejected"}
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
    >
      Rejected
    </span>
  {/if}
{/if}
