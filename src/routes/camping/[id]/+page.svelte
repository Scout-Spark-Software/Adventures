<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import type { PageData } from "./$types";
  import FavoriteButton from "$lib/components/FavoriteButton.svelte";
  import ModerationBadge from "$lib/components/ModerationBadge.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Tabs from "$lib/components/Tabs.svelte";
  import NotesSection from "$lib/components/NotesSection.svelte";
  import DescriptionSection from "$lib/components/detail-pages/DescriptionSection.svelte";
  import CampingAmenities from "$lib/components/camping/CampingAmenities.svelte";
  import CampingFacilities from "$lib/components/camping/CampingFacilities.svelte";
  import CampingPolicies from "$lib/components/camping/CampingPolicies.svelte";
  import CampingCost from "$lib/components/camping/CampingCost.svelte";
  import CampingSitePolicies from "$lib/components/camping/CampingSitePolicies.svelte";
  import Gallery from "$lib/components/detail-pages/Gallery.svelte";
  import LocationSidebar from "$lib/components/detail-pages/LocationSidebar.svelte";
  import DetailPageHero from "$lib/components/DetailPageHero.svelte";
  import EditButton from "$lib/components/EditButton.svelte";
  import ReviewsTab from "$lib/components/ratings/ReviewsTab.svelte";
  import HeroRatingDisplay from "$lib/components/ratings/HeroRatingDisplay.svelte";
  import { buildCampingBadges, buildCampingStats } from "$lib/utils/detail-page-helpers";

  export let data: PageData;

  $: isAdmin = data.userRole === "admin";

  let activeTab = "details";
  let notesCount = data.notesCount;

  // Handle URL hash navigation
  onMount(() => {
    const hash = window.location.hash.slice(1);
    if (hash && ["details", "reviews", "notes"].includes(hash)) {
      activeTab = hash;
    }
  });

  // Update URL when tab changes
  $: if (browser) {
    const newHash = `#${activeTab}`;
    if (window.location.hash !== newHash) {
      history.replaceState(null, "", newHash);
    }
  }

  $: tabs = [
    { id: "details", label: "Details" },
    {
      id: "reviews",
      label: "Reviews",
      count: data.ratingAggregate?.totalReviews || 0,
    },
    { id: "notes", label: "Notes", count: notesCount },
  ];

  function scrollToReviews() {
    activeTab = "reviews";
  }

  // Build badges and stats using utility functions
  $: heroBadges = buildCampingBadges(data.campingSite);
  $: heroStats = buildCampingStats(data.campingSite);

  function handleNotesCountChanged(event: CustomEvent<number>) {
    notesCount = event.detail;
  }
</script>

<svelte:head>
  <title>{data.campingSite.name} - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <DetailPageHero
    title={data.campingSite.name}
    location={data.address ? { city: data.address.city, state: data.address.state } : undefined}
    stats={heroStats}
    backgroundType="gradient"
  >
    <div slot="badges">
      <ModerationBadge status={data.campingSite.status} />
      {#each heroBadges as badge}
        <Badge variant={badge.variant} size="md">
          {badge.text}
        </Badge>
      {/each}
    </div>

    <FavoriteButton
      slot="favorite-button"
      campingSiteId={data.campingSite.id}
      userId={data.userId}
    />

    <div slot="rating-display">
      {#if data.ratingAggregate}
        <HeroRatingDisplay
          averageRating={data.ratingAggregate.averageRating}
          totalRatings={data.ratingAggregate.totalRatings}
          clickable={true}
          onRatingClick={scrollToReviews}
        />
      {/if}
    </div>
  </DetailPageHero>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <Tabs {tabs} bind:activeTab>
      {#if activeTab === "details"}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Column -->
          <div class="lg:col-span-2 space-y-6">
            <DescriptionSection description={data.campingSite.description} title="Description" />
            <CampingAmenities amenities={data.campingSite.amenities} />
            <CampingFacilities facilities={data.campingSite.facilities} />
            <CampingCost
              baseFee={data.campingSite.baseFee}
              costPerNight={data.campingSite.costPerNight}
            />
            <CampingSitePolicies
              siteType={data.campingSite.siteType}
              petPolicy={data.campingSite.petPolicy}
              firePolicy={data.campingSite.firePolicy}
              reservationRequired={data.campingSite.reservationRequired}
              operatingSeasonStart={data.campingSite.operatingSeasonStart}
              operatingSeasonEnd={data.campingSite.operatingSeasonEnd}
            />
            <CampingPolicies
              capacity={data.campingSite.capacity}
              reservationInfo={data.campingSite.reservationInfo}
              policies={data.campingSite.policies}
            />
            <Gallery files={data.files} />
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <LocationSidebar address={data.address} />
            {#if data.userId}
              <div class="max-w-7xl mx-auto mt-4">
                <EditButton
                  href="/camping/{data.campingSite.id}/edit"
                  text={isAdmin ? "Edit" : "Suggest Edit"}
                />
              </div>
            {/if}
          </div>
        </div>
      {:else if activeTab === "reviews"}
        <ReviewsTab campingSiteId={data.campingSite.id} userId={data.userId} />
      {:else if activeTab === "notes"}
        <NotesSection
          campingSiteId={data.campingSite.id}
          userId={data.userId}
          on:notesCountChanged={handleNotesCountChanged}
        />
      {/if}
    </Tabs>
  </div>
</div>
