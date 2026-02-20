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
  import LocationMap from "$lib/components/LocationMap.svelte";
  import { House, User, Map, MountainIcon, ChevronLeft } from "lucide-svelte";
  import CompactRating from "$lib/components/ratings/CompactRating.svelte";
  import ReviewsTab from "$lib/components/ratings/ReviewsTab.svelte";
  import HeroRatingDisplay from "$lib/components/ratings/HeroRatingDisplay.svelte";
  import Card from "$lib/components/Card.svelte";
  import { SITE_TYPE_LABELS } from "$lib/db/schemas/enums";

  export let data: PageData;

  $: isAdmin = data.userRole === "admin";
  // Explicitly type userRole for type safety
  $: typedUserRole = data.userRole as "user" | "admin" | "moderator" | null | undefined;

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
    { id: "map", label: "Map" },
    { id: "media", label: "Media" },
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
            text: SITE_TYPE_LABELS[data.campingSite.siteType] ?? data.campingSite.siteType,
            variant: "info" as
              | "primary"
              | "info"
              | "success"
              | "warning"
              | "error"
              | "neutral"
              | undefined,
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
            value: SITE_TYPE_LABELS[data.campingSite.siteType] ?? data.campingSite.siteType,
            icon: House,
          },
        ]
      : []),
    ...(data.campingSite.capacity
      ? [
          {
            label: "Capacity",
            value: `${data.campingSite.capacity} people`,
            icon: User,
          },
        ]
      : []),
    ...(data.campingSite.location
      ? [
          {
            label: "Location",
            value: data.campingSite.location,
            icon: Map,
          },
        ]
      : []),
  ];

  // For top actions
  // (typedUserRole now set above with explicit type)

  function handleNotesCountChanged(event: CustomEvent<number>) {
    notesCount = event.detail;
  }
</script>

<svelte:head>
  <title>{data.campingSite.name} - Adventure Spark</title>
</svelte:head>

<div class="min-h-screen bg-gray-100/60">
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-8">
    <!-- Top Bar -->
    <div class="flex items-center justify-between">
      <a
        href="/camping"
        class="inline-flex items-center justify-center w-10 h-10 rounded-2xl text-gray-600 hover:bg-gray-200/80 transition-colors"
      >
        <ChevronLeft size={24} class="text-indigo-600" />
      </a>
      <div class="flex items-center gap-2">
        <FavoriteButton campingSiteId={data.campingSite.id} userId={data.userId} />
        <ModerationBadge status={data.campingSite.status} userRole={typedUserRole} />
      </div>
    </div>

    <!-- Hero Image/Gradient -->
    <div class="relative rounded-2xl overflow-hidden shadow-lg">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600">
        <svg
          class="absolute bottom-0 w-full h-48 text-indigo-600/30"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
        >
          <path
            d="M0 200 L0 120 L150 60 L300 100 L450 30 L600 80 L750 20 L900 70 L1050 40 L1200 90 L1200 200 Z"
            fill="currentColor"
          />
        </svg>
        <svg
          class="absolute bottom-0 w-full h-40 text-indigo-700/25"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
        >
          <path
            d="M0 160 L0 100 L200 50 L400 90 L600 30 L800 70 L1000 45 L1200 80 L1200 160 Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {#if data.files && data.files.length > 0}
        <img
          src={data.files[0].fileUrl}
          alt={data.campingSite.name}
          class="relative w-full h-80 object-cover"
        />
      {:else}
        <div class="w-full h-80"></div>
      {/if}
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6 text-white"
      >
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-3xl font-bold">{data.campingSite.name}</h1>
          {#if heroBadges.length > 0}
            {#each heroBadges as badge (badge.text)}
              <Badge variant={badge.variant} size="md">{badge.text}</Badge>
            {/each}
          {/if}
        </div>
        <div class="flex flex-wrap gap-4 text-sm text-white/90">
          {#if data.address && (data.address.city || data.address.state)}
            <span class="flex items-center gap-1">
              <Map size={16} />
              {[data.address.city, data.address.state].filter(Boolean).join(", ")}
            </span>
          {/if}
          {#if data.campingSite.capacity}
            <span class="flex items-center gap-1">
              <User size={16} />
              {data.campingSite.capacity} people
            </span>
          {/if}
          {#if data.campingSite.siteType}
            <span class="flex items-center gap-1">
              <House size={16} />
              {SITE_TYPE_LABELS[data.campingSite.siteType] ?? data.campingSite.siteType}
            </span>
          {/if}
          {#if data.ratingAggregate}
            <button
              on:click={scrollToReviews}
              class="flex items-center gap-1 hover:text-white transition-colors"
            >
              <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              {parseFloat(String(data.ratingAggregate.averageRating)).toFixed(1)}
              <span class="text-white/70">
                ({data.ratingAggregate.totalRatings})
              </span>
            </button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Tabs and Main Content -->
    <Tabs {tabs} bind:activeTab fullWidth>
      {#if activeTab === "details"}
        <div class="space-y-6">
          <DescriptionSection description={data.campingSite.description} title="About This Site" />
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
          {#if data.userId}
            <div class="max-w-7xl mx-auto">
              <EditButton
                href="/camping/{data.campingSite.id}/edit"
                text={isAdmin ? "Edit" : "Suggest Edit"}
              />
            </div>
          {/if}
        </div>
      {:else if activeTab === "map"}
        <Card variant="elevated" padding="lg">
          {#if data.address?.latitude && data.address?.longitude}
            <div class="rounded-2xl overflow-hidden">
              <LocationMap
                latitude={data.address.latitude}
                longitude={data.address.longitude}
                height="400px"
              />
            </div>
            <div class="mt-4 space-y-3">
              <div class="text-sm text-gray-700">
                {#if data.address.address}
                  <p class="font-medium">
                    {data.address.address}
                  </p>
                {/if}
                <p>
                  {#if data.address.city}{data.address
                      .city}{/if}{#if data.address.city && data.address.state},{/if}
                  {#if data.address.state}{data.address.state}{/if}
                  {#if data.address.postalCode}
                    {data.address.postalCode}
                  {/if}
                </p>
              </div>
              <div class="flex gap-3">
                <a
                  href="https://www.openstreetmap.org/?mlat={data.address.latitude}&mlon={data
                    .address.longitude}#map=15/{data.address.latitude}/{data.address.longitude}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <Map size={16} />
                  OpenStreetMap
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query={data.address
                    .latitude},{data.address.longitude}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <Map size={16} />
                  Google Maps
                </a>
              </div>
              <div class="pt-3 border-t border-gray-200">
                <p class="text-xs text-gray-500 mb-1">GPS Coordinates</p>
                <p class="text-sm font-mono bg-gray-50 p-2 rounded">
                  {data.address.latitude}, {data.address.longitude}
                </p>
              </div>
            </div>
          {:else}
            <div
              class="h-80 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400"
            >
              <div class="text-center">
                <Map size={24} />
                <p class="mt-2">No location data available</p>
              </div>
            </div>
          {/if}
        </Card>
      {:else if activeTab === "media"}
        <Card variant="elevated" padding="lg">
          {#if data.files && data.files.length > 0}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {#each data.files.filter((f) => f.mimeType && f.mimeType.startsWith("image/")) as file (file.fileUrl)}
                <div class="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                  <img src={file.fileUrl} alt={file.fileName} class="w-full h-full object-cover" />
                </div>
              {/each}
              {#each data.files.filter((f) => !f.mimeType || !f.mimeType.startsWith("image/")) as file (file.fileUrl)}
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="aspect-square rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center p-4 hover:bg-gray-100 hover:border-indigo-300 transition-colors"
                >
                  <svg
                    class="w-8 h-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <p class="text-xs font-medium text-gray-900 truncate max-w-full">
                    {file.fileName}
                  </p>
                </a>
              {/each}
            </div>
          {:else}
            <div class="h-40 flex items-center justify-center text-gray-400">
              <span>No media files available.</span>
            </div>
          {/if}
        </Card>
      {:else if activeTab === "reviews"}
        <ReviewsTab
          campingSiteId={data.campingSite.id}
          userId={data.userId}
        />
      {:else if activeTab === "notes"}
        <NotesSection
          campingSiteId={data.campingSite.id}
          userId={data.userId ?? undefined}
          on:notesCountChanged={handleNotesCountChanged}
        />
      {/if}
    </Tabs>
  </div>
</div>
