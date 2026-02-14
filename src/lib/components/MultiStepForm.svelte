<script lang="ts">
  import { Check, ChevronLeft, ChevronRight } from "lucide-svelte";

  export let currentStep: number = 0;
  export let totalSteps: number;
  export let stepTitles: string[];
  export let onNext: () => boolean = () => true; // Returns false if validation fails
  export let onBack: () => void = () => {};
  export let loading: boolean = false;

  function handleNext() {
    if (onNext()) {
      if (currentStep < totalSteps - 1) {
        currentStep++;
      }
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      currentStep--;
      onBack();
    }
  }

  $: progress = ((currentStep + 1) / totalSteps) * 100;
</script>

<div class="multi-step-form">
  <!-- Progress Bar -->
  <div class="mb-8">
    <div class="flex justify-between mb-2">
      {#each stepTitles as title, index}
        <div class="flex flex-col items-center flex-1">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 {currentStep ===
            index
              ? 'bg-indigo-600 text-white scale-110'
              : currentStep > index
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'}"
          >
            {#if currentStep > index}
              <Check size={20} strokeWidth={3} />
            {:else}
              <span class="text-sm font-medium">{index + 1}</span>
            {/if}
          </div>
          <span
            class="text-xs mt-1 text-center hidden sm:block {currentStep === index
              ? 'text-indigo-600 font-semibold'
              : currentStep > index
                ? 'text-green-600'
                : 'text-gray-500'}">{title}</span
          >
        </div>
        {#if index < stepTitles.length - 1}
          <div class="flex-1 flex items-center px-2 pt-4">
            <div
              class="h-1 w-full rounded transition-all duration-300 {currentStep > index
                ? 'bg-green-500'
                : 'bg-gray-200'}"
            ></div>
          </div>
        {/if}
      {/each}
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
        style="width: {progress}%"
      ></div>
    </div>
  </div>

  <!-- Step Content -->
  <div class="step-content mb-8">
    <slot />
  </div>

  <!-- Navigation Buttons -->
  <div class="flex justify-between items-center pt-6 border-t">
    <button
      type="button"
      on:click={handleBack}
      disabled={currentStep === 0}
      class="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      <ChevronLeft size={16} class="inline mr-2" />
      Back
    </button>

    <div class="text-sm text-gray-600">
      Step {currentStep + 1} of {totalSteps}
    </div>

    {#if currentStep < totalSteps - 1}
      <button
        type="button"
        on:click={handleNext}
        class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
      >
        Next
        <ChevronRight size={16} class="inline ml-2" />
      </button>
    {:else}
      <button
        type="submit"
        disabled={loading}
        class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {#if loading}
          <svg class="animate-spin h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Submitting...
        {:else}
          Submit
          <Check size={16} class="inline ml-2" />
        {/if}
      </button>
    {/if}
  </div>
</div>

<style>
  .step-content {
    min-height: 300px;
  }
</style>
