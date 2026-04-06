<script lang="ts">
  import { onMount } from "svelte";

  export let slot: string;
  export let client = "ca-pub-6855584270685805";

  onMount(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded
    }
  });
</script>

<svelte:head>
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={client}"
    crossorigin="anonymous"
  ></script>
</svelte:head>

<ins
  class="adsbygoogle"
  style="display:block"
  data-ad-client={client}
  data-ad-slot={slot}
  data-ad-format="auto"
  data-full-width-responsive="true"
></ins>
