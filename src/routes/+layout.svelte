<script lang="ts">
  import "../app.css";
  import type { LayoutData } from "./$types";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { dev } from "$app/environment";
  import { page } from "$app/stores";

  export let data: LayoutData;
  $: user = data.user;
  const BASE_URL = "https://www.adventurespark.org";
  $: canonicalUrl = (data.isPreview ? $page.url.origin : BASE_URL) + $page.url.pathname;
</script>

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:site_name" content="Adventure Spark" />
  <meta property="og:url" content={canonicalUrl} />
</svelte:head>

{#if data.isPreview}
  <div class="bg-yellow-400 text-yellow-900 text-center text-xs font-semibold py-1.5 px-4">
    Preview Environment
  </div>
{/if}

<Header {user} />

<main>
  <slot />
</main>

<Footer {user} />
