<script lang="ts">
  import { browser } from "$app/environment";
  import type { PageData } from "./$types";
  import FavoriteButton from "$lib/components/FavoriteButton.svelte";
  import ModerationBadge from "$lib/components/ModerationBadge.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Card from "$lib/components/Card.svelte";
  import Tabs from "$lib/components/Tabs.svelte";
  import NotesSection from "$lib/components/NotesSection.svelte";
  import DescriptionSection from "$lib/components/detail-pages/DescriptionSection.svelte";
  import HikeFeatures from "$lib/components/hikes/HikeFeatures.svelte";
  import EditButton from "$lib/components/EditButton.svelte";
  import LocationMap from "$lib/components/LocationMap.svelte";
  import {
    MapPin,
    TrendingUp,
    Clock,
    Map,
    AlertCircle,
    Check,
    ChevronLeft,
    FileText,
    User,
    ToiletIcon,
    ChromiumIcon,
    CompassIcon,
    TicketIcon,
    MapIcon,
    SquareParkingIcon,
  } from "lucide-svelte";
  import { TRAIL_TYPE_LABELS } from "$lib/db/schemas/enums";
  import ReviewsTab from "$lib/components/ratings/ReviewsTab.svelte";
  import FileUpload from "$lib/components/FileUpload.svelte";
  import ImageLightbox from "$lib/components/ImageLightbox.svelte";
  import { Flag, X, Trash2, Shield } from "lucide-svelte";
  import { invalidateAll, goto } from "$app/navigation";

  export let data: PageData;

  $: isAdmin = data.userRole === "admin";
  $: typedUserRole = data.userRole as "admin" | "member" | null;

  const VALID_TABS = ["details", "map", "media", "reviews", "notes"];
  const initialHash = browser ? window.location.hash.slice(1) : "";
  let activeTab = VALID_TABS.includes(initialHash) ? initialHash : "details";
  let notesCount = data.notesCount;

  // Lazy-loaded files — only fetched when the media tab is first opened
  let files: {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    isBanner?: boolean;
    uploadedBy: string;
  }[] = [];
  let filesLoaded = false;

  async function loadFiles() {
    if (filesLoaded) return;
    filesLoaded = true;
    const res = await fetch(`/api/files?entity_type=hike&entity_id=${data.hike.id}`);
    if (res.ok) files = await res.json();
  }

  $: if (activeTab === "media") loadFiles();

  // Hero image: use the SSR-provided bannerImageUrl until the media tab loads files,
  // then prefer the live banner from loaded files. Never blank it out mid-fetch.
  $: liveHeroUrl =
    files.length > 0
      ? ((files.find((f) => f.isBanner) ?? files.find((f) => f.fileType === "image"))?.fileUrl ??
        null)
      : null;
  $: heroImageUrl = liveHeroUrl ?? data.hike.bannerImageUrl ?? null;

  $: imageFiles = files.filter((f) => f.fileType === "image");
  $: nonImageFiles = files.filter((f) => f.fileType !== "image");

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
    { id: "notes", label: "My Notes", count: notesCount },
  ];

  function scrollToReviews() {
    activeTab = "reviews";
  }

  function handleNotesCountChanged(event: CustomEvent<number>) {
    notesCount = event.detail;
  }

  // Format location string
  $: locationString = [data.address?.city, data.address?.state].filter(Boolean).join(", ");

  // Quick stats
  $: quickStats = [
    ...(data.hike.distance
      ? [
          {
            label: "Distance",
            value:
              data.hike.distance + " " + (data.hike.distanceUnit === "kilometers" ? "km" : "mi"),
          },
        ]
      : []),
    ...(data.hike.elevation
      ? [
          {
            label: "Elevation",
            value: data.hike.elevation + " " + (data.hike.elevationUnit === "meters" ? "m" : "ft"),
          },
        ]
      : []),
    ...(data.hike.duration
      ? [
          {
            label: "Duration",
            value:
              "~" +
              data.hike.duration +
              " " +
              (data.hike.durationUnit === "minutes" ? "min" : "hr"),
          },
        ]
      : []),
  ];

  // Difficulty badge
  $: difficultyVariant = (
    data.hike.difficulty === "easy"
      ? "success"
      : data.hike.difficulty === "moderate"
        ? "warning"
        : "error"
  ) as "success" | "warning" | "error";

  $: difficultyLabel = data.hike.difficulty
    ? data.hike.difficulty.charAt(0).toUpperCase() + data.hike.difficulty.slice(1).replace("_", " ")
    : null;

  // Image flagging state
  let flaggedImageIds = new Set<string>();
  let flagMessage: string | null = null;

  // Lightbox state
  let lightboxIndex: number | null = null;

  // Upload modal state
  let showUploadModal = false;

  function openLightbox(index: number) {
    lightboxIndex = index;
  }

  function closeLightbox() {
    lightboxIndex = null;
  }

  function handleLightboxDeleted(e: CustomEvent<{ id: string }>) {
    files = files.filter((f) => f.id !== e.detail.id);
    closeLightbox();
  }

  function handleLightboxBannerChanged(e: CustomEvent<{ id: string }>) {
    files = files.map((f) => ({ ...f, isBanner: f.id === e.detail.id }));
  }

  function handleLightboxFlagged(e: CustomEvent<{ id: string }>) {
    flaggedImageIds.add(e.detail.id);
    flaggedImageIds = flaggedImageIds;
    flagMessage = "Image reported. Thank you.";
    setTimeout(() => (flagMessage = null), 4000);
  }

  async function flagImage(fileId: string) {
    if (flaggedImageIds.has(fileId)) return;
    try {
      const response = await fetch(`/api/files/${fileId}/flag`, { method: "POST" });
      if (response.ok) {
        flaggedImageIds.add(fileId);
        flaggedImageIds = flaggedImageIds;
        flagMessage = "Image reported. Thank you.";
      } else if (response.status === 409) {
        flagMessage = "You've already flagged this image.";
      } else {
        flagMessage = "Failed to report image. Please try again.";
      }
    } catch {
      flagMessage = "Failed to report image. Please try again.";
    } finally {
      setTimeout(() => (flagMessage = null), 4000);
    }
  }

  async function handleImageUploaded() {
    showUploadModal = false;
    // Re-fetch files so the newly uploaded image appears
    filesLoaded = false;
    await loadFiles();
  }

  let isDeleting = false;
  let deleteError: string | null = null;

  async function deleteHike() {
    if (
      !confirm(`Permanently delete "${data.hike.name}" and all its images? This cannot be undone.`)
    )
      return;
    isDeleting = true;
    deleteError = null;
    try {
      const res = await fetch(`/api/hikes/${data.hike.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        deleteError = err.message || "Failed to delete.";
        return;
      }
      goto("/hikes");
    } catch {
      deleteError = "Failed to delete. Please try again.";
    } finally {
      isDeleting = false;
    }
  }
</script>

<svelte:head>
  <title>{data.hike.name}{locationString ? ` – ${locationString}` : ''} | Hiking Trail – Adventure Spark</title>
  <meta name="description" content={[
    data.hike.description ? data.hike.description.slice(0, 140).replace(/\s\S*$/, '') + '…' : null,
    difficultyLabel ? `${difficultyLabel} difficulty.` : null,
    data.hike.distance ? `${data.hike.distance}${data.hike.distanceUnit === 'kilometers' ? 'km' : 'mi'}.` : null,
    locationString || null,
  ].filter(Boolean).join(' ') || `Explore the ${data.hike.name} hiking trail on Adventure Spark.`} />
  <meta property="og:title" content="{data.hike.name}{locationString ? ` – ${locationString}` : ''}" />
  <meta property="og:description" content={data.hike.description ? data.hike.description.slice(0, 200) : `Explore the ${data.hike.name} hiking trail on Adventure Spark.`} />
  <meta property="og:type" content="article" />
  {#if data.hike.bannerImageUrl}
    <meta property="og:image" content={data.hike.bannerImageUrl} />
    <meta name="twitter:image" content={data.hike.bannerImageUrl} />
  {/if}
  <meta name="twitter:card" content={data.hike.bannerImageUrl ? 'summary_large_image' : 'summary'} />
  {#if data.address?.latitude && data.address?.longitude}
    <meta name="geo.position" content="{data.address.latitude};{data.address.longitude}" />
    <meta name="ICBM" content="{data.address.latitude}, {data.address.longitude}" />
  {/if}
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": data.hike.name,
    "description": data.hike.description || undefined,
    "url": `https://www.adventurespark.org/hikes/${data.hike.slug}`,
    ...(data.hike.bannerImageUrl ? { "image": data.hike.bannerImageUrl } : {}),
    ...(data.address?.latitude && data.address?.longitude ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": data.address.latitude,
        "longitude": data.address.longitude,
      },
      "address": {
        "@type": "PostalAddress",
        ...(data.address.city ? { "addressLocality": data.address.city } : {}),
        ...(data.address.state ? { "addressRegion": data.address.state } : {}),
        "addressCountry": "US",
      },
    } : {}),
    ...(data.ratingAggregate && data.ratingAggregate.totalRatings > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": parseFloat(String(data.ratingAggregate.averageRating)).toFixed(1),
        "ratingCount": data.ratingAggregate.totalRatings,
        "reviewCount": data.ratingAggregate.totalReviews,
        "bestRating": "5",
        "worstRating": "1",
      },
    } : {}),
  })}</script>`}
</svelte:head>

<div class="min-h-screen bg-gray-100">
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-8">
    <!-- Top Bar -->
    <div class="relative flex items-center justify-between">
      <a
        href="/hikes"
        class="inline-flex items-center justify-center w-10 h-10 rounded-2xl text-gray-600 hover:bg-gray-200/80 transition-colors"
      >
        <ChevronLeft size={24} class="text-indigo-600" />
      </a>
      <div class="flex items-center gap-2">
        <FavoriteButton hikeId={data.hike.id} userId={data.userId} />
        <ModerationBadge status={data.hike.status} userRole={typedUserRole} />
        {#if isAdmin && data.hike.status === "rejected"}
          <button
            on:click={deleteHike}
            disabled={isDeleting}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-red-300 text-red-600 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={15} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        {/if}
      </div>
      {#if deleteError}
        <div
          class="absolute top-full right-0 mt-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5"
        >
          {deleteError}
        </div>
      {/if}
    </div>

    <!-- Hero Image -->
    <div class="relative rounded-2xl overflow-hidden shadow-lg">
      <div class="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600">
        <svg
          class="absolute bottom-0 w-full h-48 text-green-600/30"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
        >
          <path
            d="M0 200 L0 120 L150 60 L300 100 L450 30 L600 80 L750 20 L900 70 L1050 40 L1200 90 L1200 200 Z"
            fill="currentColor"
          />
        </svg>
        <svg
          class="absolute bottom-0 w-full h-40 text-green-700/25"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
        >
          <path
            d="M0 160 L0 100 L200 50 L400 90 L600 30 L800 70 L1000 45 L1200 80 L1200 160 Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {#if heroImageUrl}
        <img src={heroImageUrl} alt={data.hike.name} class="relative w-full h-80 object-cover" />
      {:else}
        <div class="w-full h-80"></div>
      {/if}
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6 text-white"
      >
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-3xl font-bold">{data.hike.name}</h1>
          {#if difficultyLabel}
            <Badge variant={difficultyVariant} size="md" rounded="lg">
              {difficultyLabel}
            </Badge>
          {/if}
        </div>
        <div class="flex flex-wrap gap-4 text-sm text-white/90">
          {#if locationString}
            <span class="flex items-center gap-1">
              <MapPin size={16} />
              {locationString}
            </span>
          {/if}
          {#if data.hike.council}
            <span class="flex items-center gap-1">
              <Shield size={16} />
              {data.hike.council.name}
            </span>
          {/if}
          {#if data.hike.distance}
            <span class="flex items-center gap-1">
              <TrendingUp size={16} />
              {data.hike.distance}
              {data.hike.distanceUnit === "kilometers" ? "km" : "mi"}
              {#if data.hike.elevation}
                &bull; {data.hike.elevation}{data.hike.elevationUnit === "meters" ? "m" : "ft"}
              {/if}
            </span>
          {/if}
          {#if data.hike.duration}
            <span class="flex items-center gap-1">
              <Clock size={16} />
              ~{data.hike.duration}
              {data.hike.durationUnit === "minutes" ? "min" : "hr"}
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
              <span class="text-white/70">({data.ratingAggregate.totalRatings})</span>
            </button>
          {/if}
        </div>
        {#if data.hike.submitterName}
          <p class="text-xs text-white/60 mt-1">
            Submitted by <span class="text-white/80 font-medium">{data.hike.submitterName}</span>
            {#if data.hike.submitterUnit}
              &middot; <span class="text-white/60">{data.hike.submitterUnit}</span>
            {/if}
          </p>
        {/if}
      </div>
    </div>

    <!-- Tabs -->
    <Tabs {tabs} bind:activeTab fullWidth>
      <!-- DETAILS TAB -->
      {#if activeTab === "details"}
        <div class="space-y-6">
          <!-- About -->
          <DescriptionSection description={data.hike.description} title="About This Trail" />

          <!-- Features as badges inside the about card if no description, otherwise standalone -->
          <HikeFeatures features={data.hike.features} />

          <!-- Quick Stats -->
          {#if quickStats.length > 0}
            <div class="grid md:grid-cols-3 gap-4">
              {#each quickStats as stat (stat.label)}
                <Card variant="elevated" padding="lg">
                  <p class="text-sm text-gray-500">
                    {stat.label}
                  </p>
                  <p class="text-lg font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </Card>
              {/each}
            </div>
          {/if}

          <!-- Trail Information -->
          <Card variant="elevated" padding="lg">
            <h2 slot="header" class="text-xl font-semibold text-gray-900">Trail Information</h2>

            <div class="grid md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
              {#if data.hike.trailType}
                <div class="flex items-start gap-3">
                  <MapIcon size={24} class="text-gray-400" />
                  <div>
                    <p class="font-medium text-gray-900">Trail Type</p>
                    <p class="text-gray-500">
                      {TRAIL_TYPE_LABELS[data.hike.trailType] || data.hike.trailType}
                    </p>
                  </div>
                </div>
              {/if}

              <div class="flex items-start gap-3">
                <CompassIcon size={24} class="text-gray-400" />
                <div>
                  <p class="font-medium text-gray-900">Official Trail Website</p>
                  <p class="text-gray-500 italic">No website linked yet</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <TicketIcon size={24} class="text-gray-400" />
                <div>
                  <p class="font-medium text-gray-900">Permit Info</p>
                  <p class="text-gray-500">
                    {data.hike.permitsRequired || "Standard state park entry fee may apply."}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <SquareParkingIcon size={24} class="text-gray-400" />
                <div>
                  <p class="font-medium text-gray-900">Parking Info</p>
                  <p class="text-gray-500">
                    {data.hike.parkingInfo || "Free lot available. Arrive 10 minutes early."}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <ToiletIcon size={24} class="text-gray-400" />
                <div>
                  <p class="font-medium text-gray-900">Restrooms</p>
                  <p class="text-gray-500">Available at trailhead only.</p>
                </div>
              </div>

              {#if data.hike.dogFriendly}
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-lg text-xs font-medium"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Dog Friendly
                  </span>
                </div>
              {/if}

              {#if data.hike.waterSources}
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded-lg text-xs font-medium"
                  >
                    >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                    Water Sources Available
                  </span>
                </div>
              {/if}

              {#if data.hike.bestSeason && Array.isArray(data.hike.bestSeason) && data.hike.bestSeason.length > 0}
                <div class="md:col-span-2">
                  <p class="font-medium text-gray-900 mb-2">Best Season</p>
                  <div class="flex flex-wrap gap-2">
                    {#each data.hike.bestSeason as season (season)}
                      <Badge variant="primary" size="sm">
                        {season}
                      </Badge>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </Card>

          <!-- Edit Button -->
          {#if data.userId}
            <div class="max-w-7xl mx-auto">
              <EditButton
                href="/hikes/{data.hike.slug}/edit"
                text={isAdmin ? "Edit" : "Suggest Edit"}
              />
            </div>
          {/if}
        </div>

        <!-- MAP TAB -->
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
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  OpenStreetMap
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query={data.address
                    .latitude},{data.address.longitude}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
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

        <!-- REVIEWS TAB -->
      {:else if activeTab === "reviews"}
        <ReviewsTab hikeId={data.hike.id} userId={data.userId} />

        <!-- NOTES TAB -->
      {:else if activeTab === "notes"}
        <NotesSection
          hikeId={data.hike.id}
          userId={data.userId ?? undefined}
          on:notesCountChanged={handleNotesCountChanged}
        />

        <!-- MEDIA TAB -->
      {:else if activeTab === "media"}
        <Card variant="elevated" padding="lg">
          <!-- Header row -->
          <div slot="header" class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">Photos</h2>
            {#if data.userId && imageFiles.length < 6}
              <button
                on:click={() => (showUploadModal = true)}
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Photos
              </button>
            {:else if !data.userId}
              <a href="/login" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >Sign in to add photos</a
              >
            {/if}
          </div>

          {#if flagMessage}
            <div class="mb-4 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-800">
              {flagMessage}
            </div>
          {/if}

          {#if !filesLoaded}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {#each [1, 2, 3, 4] as i (i)}
                <div class="aspect-square rounded-2xl bg-gray-100 animate-pulse"></div>
              {/each}
            </div>
          {:else if files.length > 0}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {#each imageFiles as file, i (file.fileUrl)}
                <div class="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative group">
                  <button
                    on:click={() => openLightbox(i)}
                    class="w-full h-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    title="View full size"
                  >
                    <img
                      src={file.fileUrl}
                      alt={file.fileName}
                      class="w-full h-full object-cover hover:brightness-90 transition-[filter]"
                    />
                  </button>
                  {#if data.userId && file.uploadedBy !== data.userId && !isAdmin}
                    <button
                      on:click={() => flagImage(file.id)}
                      disabled={flaggedImageIds.has(file.id)}
                      title={flaggedImageIds.has(file.id)
                        ? "Image reported"
                        : "Flag as inappropriate"}
                      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-red-50 rounded-full p-1.5 disabled:cursor-not-allowed"
                    >
                      <Flag
                        size={14}
                        class={flaggedImageIds.has(file.id)
                          ? "text-red-500"
                          : "text-gray-500 hover:text-red-500"}
                      />
                    </button>
                  {/if}
                </div>
              {/each}
              {#each nonImageFiles as file (file.fileUrl)}
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
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {#each [1, 2, 3, 4] as i (i)}
                <div
                  class="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300"
                >
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              {/each}
            </div>
          {/if}
        </Card>

        <!-- Upload modal -->
        {#if showUploadModal}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            on:click|self={() => (showUploadModal = false)}
          >
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Add Photos</h3>
                <button
                  on:click={() => (showUploadModal = false)}
                  class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <FileUpload
                entityType="hike"
                entityId={data.hike.id}
                fileType="image"
                existingCount={imageFiles.length}
                on:uploaded={handleImageUploaded}
              />
            </div>
          </div>
        {/if}
      {/if}
    </Tabs>
  </div>
</div>

{#if lightboxIndex !== null}
  <ImageLightbox
    images={imageFiles}
    initialIndex={lightboxIndex}
    {isAdmin}
    userId={data.userId}
    {flaggedImageIds}
    on:close={closeLightbox}
    on:deleted={handleLightboxDeleted}
    on:bannerChanged={handleLightboxBannerChanged}
    on:flagged={handleLightboxFlagged}
  />
{/if}
