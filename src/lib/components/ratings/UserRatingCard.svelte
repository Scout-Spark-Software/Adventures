<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import RatingInput from "./RatingInput.svelte";

  export let initialRating: number = 0;
  export let initialReview: string = "";
  export let hikeId: string | null = null;
  export let campingSiteId: string | null = null;
  export let hasExistingRating: boolean = false;

  const dispatch = createEventDispatcher();

  let rating = initialRating;
  let reviewText = initialReview;
  let isEditing = !hasExistingRating; // Auto-edit if no existing rating
  let isSaving = false;
  let error = "";

  function startEdit() {
    isEditing = true;
    error = "";
  }

  function cancelEdit() {
    if (!hasExistingRating) return; // Can't cancel if never rated
    isEditing = false;
    rating = initialRating;
    reviewText = initialReview;
    error = "";
  }

  async function saveRating() {
    if (rating === 0) {
      error = "Please select a rating";
      return;
    }

    isSaving = true;
    error = "";

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hikeId,
          campingSiteId,
          rating,
          reviewText: reviewText.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to save rating");
      }

      const savedRating = await response.json();
      isEditing = false;
      hasExistingRating = true;
      initialRating = rating;
      initialReview = reviewText;
      dispatch("saved", savedRating);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to save rating";
    } finally {
      isSaving = false;
    }
  }

  function handleRatingChange(event: CustomEvent<number>) {
    rating = event.detail;
  }
</script>

<div class="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-5">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-indigo-900">Your Rating</h3>
    {#if hasExistingRating && !isEditing}
      <button
        on:click={startEdit}
        class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        Edit
      </button>
    {/if}
  </div>

  {#if isEditing}
    <!-- Edit Mode -->
    <div class="space-y-4">
      <div>
        <label for="rating-input" class="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <RatingInput {rating} on:change={handleRatingChange} size="lg" />
      </div>

      <div>
        <label for="review-text" class="block text-sm font-medium text-gray-700 mb-2">
          Review (Optional)
        </label>
        <textarea
          id="review-text"
          bind:value={reviewText}
          placeholder="Share your experience..."
          maxlength="5000"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p class="text-sm text-gray-500 mt-1">
          {reviewText.length} / 5,000 characters
        </p>
      </div>

      {#if error}
        <div class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      {/if}

      <div class="flex gap-2">
        <button
          on:click={saveRating}
          disabled={isSaving || rating === 0}
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : hasExistingRating ? "Update Rating" : "Submit Rating"}
        </button>
        {#if hasExistingRating}
          <button
            on:click={cancelEdit}
            disabled={isSaving}
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        {/if}
      </div>
    </div>
  {:else}
    <!-- View Mode -->
    <div class="space-y-3">
      <RatingInput {rating} disabled={true} size="lg" />
      {#if reviewText}
        <div class="bg-white rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
          {reviewText}
        </div>
      {/if}
    </div>
  {/if}
</div>
