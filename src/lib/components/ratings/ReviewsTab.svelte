<script lang="ts">
  import { onMount } from "svelte";
  import RatingDisplay from "./RatingDisplay.svelte";
  import UserRatingCard from "./UserRatingCard.svelte";
  import type { Rating } from "$lib/db/schemas";

  export let hikeId: string | null = null;
  export let campingSiteId: string | null = null;
  export let userId: string | null = null;

  type RatingWithUser = Rating & { userName?: string };

  let reviews: RatingWithUser[] = [];
  let aggregate = {
    averageRating: null as number | null,
    totalRatings: 0,
    totalReviews: 0,
  };
  let userRating: Rating | null = null;
  let hasUserRated = false;
  let loading = true;
  let error = "";

  async function loadReviews() {
    loading = true;
    error = "";

    try {
      const params = new URLSearchParams({ reviews_only: "true" });
      if (hikeId) params.set("hike_id", hikeId);
      if (campingSiteId) params.set("camping_site_id", campingSiteId);

      const response = await fetch(`/api/ratings?${params}`);
      if (!response.ok) throw new Error("Failed to load reviews");

      const data = await response.json();
      reviews = data.ratings;
      aggregate = data.aggregate;
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load reviews";
    } finally {
      loading = false;
    }
  }

  async function loadUserRating() {
    if (!userId) return;

    try {
      const params = new URLSearchParams();
      if (hikeId) params.set("hike_id", hikeId);
      if (campingSiteId) params.set("camping_site_id", campingSiteId);

      const response = await fetch(`/api/ratings/my-rating?${params}`);
      if (!response.ok) return;

      const data = await response.json();
      hasUserRated = data.hasRated;
      userRating = data.rating;
    } catch (e) {
      console.error("Error loading user rating:", e);
    }
  }

  function handleRatingSaved() {
    loadReviews();
    loadUserRating();
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  onMount(() => {
    loadReviews();
    loadUserRating();
  });
</script>

<div class="space-y-6">
  {#if loading}
    <div class="text-center py-12">
      <p class="text-gray-500">Loading ratings...</p>
    </div>
  {:else}
    <!-- Overall Rating Summary -->
    {#if aggregate.averageRating !== null && aggregate.totalRatings > 0}
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Overall Rating</h3>
        <div class="flex items-center gap-4">
          <div class="text-5xl font-bold text-gray-900">
            {parseFloat(aggregate.averageRating).toFixed(1)}
          </div>
          <div>
            <RatingDisplay
              rating={parseFloat(aggregate.averageRating)}
              totalRatings={aggregate.totalRatings}
              size="lg"
              showCount={false}
            />
            <p class="text-sm text-gray-600 mt-1">
              {aggregate.totalRatings}
              {aggregate.totalRatings === 1 ? "rating" : "ratings"}
              {#if aggregate.totalReviews > 0}
                • {aggregate.totalReviews}
                {aggregate.totalReviews === 1 ? "review" : "reviews"}
              {/if}
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- User's Rating (if logged in) -->
    {#if userId}
      <UserRatingCard
        {hikeId}
        {campingSiteId}
        hasExistingRating={hasUserRated}
        initialRating={userRating?.rating ? parseFloat(userRating.rating) : 0}
        initialReview={userRating?.reviewText || ""}
        on:saved={handleRatingSaved}
      />
    {:else}
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p class="text-gray-600 mb-3">Want to share your experience?</p>
        <a
          href="/login"
          class="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Log in to rate
        </a>
      </div>
    {/if}

    <!-- Reviews List -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Reviews ({aggregate.totalReviews})
      </h3>

      {#if error}
        <div
          class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          {error}
        </div>
      {:else if reviews.length === 0}
        <div class="text-center py-8 bg-gray-50 rounded-lg">
          <p class="text-gray-600">
            No reviews yet. Be the first to share your experience!
          </p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each reviews as review}
            <div class="bg-white rounded-lg shadow p-5">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <RatingDisplay
                    rating={parseFloat(review.rating)}
                    size="sm"
                    showCount={false}
                  />
                  <p class="text-sm text-gray-500 mt-1">
                    {formatDate(review.createdAt)}
                    {#if review.createdAt !== review.updatedAt}
                      • Edited
                    {/if}
                  </p>
                </div>
              </div>
              {#if review.reviewText}
                <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {review.reviewText}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
