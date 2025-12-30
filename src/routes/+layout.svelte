<script lang="ts">
  import "../app.css";
  import type { LayoutData } from "./$types";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { dev } from '$app/environment';
  import { injectAnalytics } from '@vercel/analytics/sveltekit';

  injectAnalytics({ mode: dev ? 'development' : 'production' });

  export let data: LayoutData;
  $: user = data.user;
</script>

<Header {user} />

<main>
  <slot />
</main>

<Footer {user} />
