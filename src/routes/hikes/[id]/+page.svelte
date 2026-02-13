<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import type { PageData } from "./$types";
  import FavoriteButton from "$lib/components/FavoriteButton.svelte";
  import ModerationBadge from "$lib/components/ModerationBadge.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import StatCard from "$lib/components/StatCard.svelte";
  import Tabs from "$lib/components/Tabs.svelte";
  import NotesSection from "$lib/components/NotesSection.svelte";
  import HikeDescription from "$lib/components/hikes/HikeDescription.svelte";
  import HikeFeatures from "$lib/components/hikes/HikeFeatures.svelte";
  import HikeConditions from "$lib/components/hikes/HikeConditions.svelte";
  import HikeGallery from "$lib/components/hikes/HikeGallery.svelte";
  import HikeLocationSidebar from "$lib/components/hikes/HikeLocationSidebar.svelte";
  import DetailPageHero from "$lib/components/DetailPageHero.svelte";
  import EditButton from "$lib/components/EditButton.svelte";
  import HikeIcon from "$lib/components/icons/HikeIcon.svelte";
  import ClockIcon from "$lib/components/icons/ClockIcon.svelte";
  import ArrowIcon from "$lib/components/icons/ArrowIcon.svelte";
  import MapIcon from "$lib/components/icons/MapIcon.svelte";
  import { TRAIL_TYPE_LABELS } from "$lib/db/schemas/enums";
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
    ...(data.hike.difficulty
      ? [
          {
            text:
              data.hike.difficulty.charAt(0).toUpperCase() +
              data.hike.difficulty.slice(1).replace("_", " "),
            variant: (data.hike.difficulty === "easy"
              ? "success"
              : data.hike.difficulty === "moderate"
                ? "warning"
                : "error") as "success" | "warning" | "error",
          },
        ]
      : []),
  ];

  // Prepare stats for hero
  $: heroStats = [
    ...(data.hike.distance
      ? [{ label: "Distance", value: data.hike.distance, icon: HikeIcon }]
      : []),
    ...(data.hike.duration
      ? [{ label: "Duration", value: data.hike.duration, icon: ClockIcon }]
      : []),
    ...(data.hike.elevation
      ? [
          {
            label: "Elevation Gain",
            value: data.hike.elevation,
            icon: ArrowIcon,
          },
        ]
      : []),
    ...(data.hike.trailType
      ? [
          {
            label: "Trail Type",
            value:
              TRAIL_TYPE_LABELS[data.hike.trailType] || data.hike.trailType,
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
  <title>{data.hike.name} - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <DetailPageHero
    title={data.hike.name}
    location={data.address
      ? {
          city: data.address.city ?? undefined,
          state: data.address.state ?? undefined,
        }
      : undefined}
    stats={heroStats}
    backgroundType="gradient"
  >
    <div slot="badges">
      <ModerationBadge status={data.hike.status} />
      {#each heroBadges as badge}
        <Badge variant={badge.variant} size="md">
          {badge.text}
        </Badge>
      {/each}
    </div>

    <FavoriteButton
      slot="favorite-button"
      hikeId={data.hike.id}
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
            <HikeDescription description={data.hike.description} />
            <HikeFeatures features={data.hike.features} />
            <HikeConditions
              dogFriendly={data.hike.dogFriendly}
              waterSources={data.hike.waterSources}
              bestSeason={data.hike.bestSeason}
              permitsRequired={data.hike.permitsRequired}
              parkingInfo={data.hike.parkingInfo}
            />
            <HikeGallery files={data.files} />
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <HikeLocationSidebar address={data.address} />
            {#if data.userId}
              <div class="max-w-7xl mx-auto mt-4">
                <EditButton
                  href="/hikes/{data.hike.id}/edit"
                  text={isAdmin ? "Edit" : "Suggest Edit"}
                />
              </div>
            {/if}
          </div>
        </div>
      {:else if activeTab === "reviews"}
        <ReviewsTab hikeId={data.hike.id} userId={data.userId} />
      {:else if activeTab === "notes"}
        <NotesSection
          hikeId={data.hike.id}
          userId={data.userId ?? undefined}
          on:notesCountChanged={handleNotesCountChanged}
        />
      {/if}
    </Tabs>
  </div>
</div>
