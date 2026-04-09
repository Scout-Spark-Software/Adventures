<script lang="ts">
  import { onMount } from "svelte";

  export let adSlot: string;
  export let client = "ca-pub-6855584270685805";

  onMount(() => {
    try {
      // @ts-expect-error ads by google
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded
    }
  });
</script>

<ins
  class="adsbygoogle"
  style="display:block"
  data-ad-client={client}
  data-ad-slot={adSlot}
  data-ad-format="auto"
  data-full-width-responsive="true"
></ins>
