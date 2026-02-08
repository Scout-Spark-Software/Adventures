<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import type { PageData } from "./$types";
  import FavoriteButton from "$lib/components/FavoriteButton.svelte";
  import ModerationBadge from "$lib/components/ModerationBadge.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Tabs from "$lib/components/Tabs.svelte";
  import NotesSection from "$lib/components/NotesSection.svelte";
  import CampingDescription from "$lib/components/camping/CampingDescription.svelte";
  import CampingAmenities from "$lib/components/camping/CampingAmenities.svelte";
  import CampingFacilities from "$lib/components/camping/CampingFacilities.svelte";
  import CampingPolicies from "$lib/components/camping/CampingPolicies.svelte";
  import CampingCost from "$lib/components/camping/CampingCost.svelte";
  import CampingSitePolicies from "$lib/components/camping/CampingSitePolicies.svelte";
  import CampingGallery from "$lib/components/camping/CampingGallery.svelte";
  import CampingLocationSidebar from "$lib/components/camping/CampingLocationSidebar.svelte";
  import DetailPageHero from "$lib/components/DetailPageHero.svelte";
  import CampingIcon from "$lib/components/icons/CampingIcon.svelte";
  import UserIcon from "$lib/components/icons/UserIcon.svelte";
  import MapIcon from "$lib/components/icons/MapIcon.svelte";
  import CompactRating from "$lib/components/ratings/CompactRating.svelte";
  import ReviewsTab from "$lib/components/ratings/ReviewsTab.svelte";
  import HeroRatingDisplay from "$lib/components/ratings/HeroRatingDisplay.svelte";

  export let data: PageData;

  $: isAdmin = data.userRole === "admin";

  let activeTab = "details";
  let notesCount = data.notesCount;

  // Handle URL hash navigation
  onMount(() => {
    const hash = window.location.hash.slice(1); // Remove the #
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

  // Prepare badges for hero
  $: heroBadges = [
    ...(data.campingSite.siteType
      ? [
          {
            text:
              data.campingSite.siteType.charAt(0).toUpperCase() +
              data.campingSite.siteType.slice(1).replace("_", " "),
            variant: "info",
          },
        ]
      : []),
  ];

  // Prepare stats for hero
  $: heroStats = [
    ...(data.campingSite.siteType
      ? [
          {
            label: "Site Type",
            value:
              data.campingSite.siteType.charAt(0).toUpperCase() +
              data.campingSite.siteType.slice(1).replace("_", " "),
            icon: CampingIcon,
          },
        ]
      : []),
    ...(data.campingSite.capacity
      ? [
          {
            label: "Capacity",
            value: `${data.campingSite.capacity} people`,
            icon: UserIcon,
          },
        ]
      : []),
    ...(data.campingSite.location
      ? [
          {
            label: "Location",
            value: data.campingSite.location,
            icon: MapIcon,
          },
        ]
      : []),
  ];

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
    location={data.address
      ? { city: data.address.city, state: data.address.state }
      : undefined}
    stats={heroStats}
    backgroundType="gradient"
    showEdit={!!data.userId}
    editUrl="/camping/{data.campingSite.id}/edit"
    editText={isAdmin ? "Edit" : "Suggest Edit"}
  >
    <div slot="badges">
      <ModerationBadge status={data.campingSite.status} />
      {#each heroBadges as badge}
        <Badge variant={badge.variant} size="md">
          {badge.text}
        </Badge>
      {/each}
      {#if data.ratingAggregate}
        <CompactRating
          averageRating={data.ratingAggregate.averageRating}
          totalRatings={data.ratingAggregate.totalRatings}
          clickable={true}
          onRatingClick={scrollToReviews}
        />
      {/if}
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
            <CampingDescription description={data.campingSite.description} />
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
            <CampingGallery files={data.files} />
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <CampingLocationSidebar address={data.address} />
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
