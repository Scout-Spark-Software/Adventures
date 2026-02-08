<script lang="ts">
  import type { PageData } from "./$types";
  import Hero from "$lib/components/Hero.svelte";
  import FeaturedHikes from "$lib/components/FeaturedHikes.svelte";
  import FeaturedCampingSites from "$lib/components/FeaturedCampingSites.svelte";
  import EmptyAdventures from "$lib/components/EmptyAdventures.svelte";

  export let data: PageData;

  $: hasNoContent =
    (!data.featuredHikes || data.featuredHikes.length === 0) &&
    (!data.featuredCampingSites || data.featuredCampingSites.length === 0);
</script>

<svelte:head>
  <title>Adventure Spark - Discover Hikes & Camping Sites</title>
</svelte:head>

<div class="min-h-screen bg-slate-50">
  <Hero />

  <FeaturedHikes hikes={data.featuredHikes} />

  <FeaturedCampingSites campingSites={data.featuredCampingSites} />

  {#if hasNoContent}
    <EmptyAdventures />
  {/if}
</div>
