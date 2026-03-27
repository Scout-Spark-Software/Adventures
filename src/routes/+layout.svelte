<script lang="ts">
  import "../app.css";
  import type { LayoutData } from "./$types";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { dev } from "$app/environment";

  export let data: LayoutData;
  $: user = data.user;
</script>

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
