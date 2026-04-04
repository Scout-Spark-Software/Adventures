<script lang="ts">
  import { page } from "$app/stores";
  import { Mountain, Tent, Backpack } from "lucide-svelte";

  const contexts = {
    hikes: {
      icon: Mountain,
      heading: "Hike not found",
      body: "This trail doesn't seem to exist. It may have been removed or the link might be wrong.",
      browseLabel: "Browse hikes",
      browseHref: "/hikes",
    },
    camping: {
      icon: Tent,
      heading: "Camping site not found",
      body: "This campsite couldn't be located. It may have been removed or the link might be wrong.",
      browseLabel: "Browse camping",
      browseHref: "/camping",
    },
    backpacking: {
      icon: Backpack,
      heading: "Route not found",
      body: "This backpacking route doesn't exist. It may have been removed or the link might be wrong.",
      browseLabel: "Browse routes",
      browseHref: "/backpacking",
    },
  } as const;

  $: section = $page.url.pathname.startsWith("/camping")
    ? "camping"
    : $page.url.pathname.startsWith("/backpacking")
      ? "backpacking"
      : $page.url.pathname.startsWith("/hikes")
        ? "hikes"
        : null;

  $: ctx = section ? contexts[section] : null;
</script>

<div class="min-h-[70vh] flex flex-col items-center justify-center px-4 py-24 text-center">
  <div class="mb-8 flex flex-col items-center gap-3">
    <div class="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center">
      {#if ctx}
        <svelte:component this={ctx.icon} class="w-10 h-10 text-stone-400" />
      {:else}
        <Mountain class="w-10 h-10 text-stone-400" />
      {/if}
    </div>
    <span class="text-8xl font-black text-emerald-600 leading-none select-none tracking-tight">
      {$page.status}
    </span>
  </div>

  {#if $page.status === 404 && ctx}
    <h1 class="text-2xl font-bold text-stone-800 mb-2">{ctx.heading}</h1>
    <p class="text-stone-500 max-w-sm mb-8">{ctx.body}</p>
  {:else if $page.status === 404}
    <h1 class="text-2xl font-bold text-stone-800 mb-2">Page not found</h1>
    <p class="text-stone-500 max-w-sm mb-8">
      This page doesn't exist. You may have followed a broken link.
    </p>
  {:else}
    <h1 class="text-2xl font-bold text-stone-800 mb-2">Something went wrong</h1>
    <p class="text-stone-500 max-w-sm mb-8">
      {$page.error?.message ?? "An unexpected error occurred. Please try again."}
    </p>
  {/if}

  <div class="flex flex-col sm:flex-row gap-3">
    <a
      href="/"
      class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
    >
      Back to home
    </a>
    <a
      href={ctx?.browseHref ?? "/hikes"}
      class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-stone-100 text-stone-700 text-sm font-medium hover:bg-stone-200 transition-colors"
    >
      {ctx?.browseLabel ?? "Browse hikes"}
    </a>
  </div>
</div>
