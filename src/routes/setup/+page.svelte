<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";
  import { Tent, Users, Hash, ChevronRight } from "lucide-svelte";
  import CouncilSelect from "$lib/components/CouncilSelect.svelte";

  export let data: PageData;
  export let form: ActionData;

  let isSaving = false;
</script>

<svelte:head>
  <title>Set Up Your Profile — Adventure Spark</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-stone-100 flex flex-col items-center justify-center px-4 py-16">
  <div class="w-full max-w-md">
    <!-- Header -->
    <div class="text-center mb-8">
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 shadow-lg"
        style="background: linear-gradient(135deg, #059669, #34d399);"
      >
        <Tent size={28} class="text-white" />
      </div>
      <h1 class="text-2xl font-black text-stone-900 mb-2">Welcome to Adventure Spark!</h1>
      <p class="text-sm text-stone-500">
        Tell us about your scout unit so we can personalize your experience.
      </p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      {#if form?.error}
        <div class="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-sm font-semibold text-red-800">{form.error}</p>
        </div>
      {/if}

      <form
        method="POST"
        action="?/saveProfile"
        use:enhance={() => {
          isSaving = true;
          return async ({ update }) => {
            await update();
            isSaving = false;
          };
        }}
        class="space-y-5"
      >
        <!-- Council -->
        <div>
          <label
            for="councilId"
            class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2"
          >
            <span class="inline-flex items-center gap-1.5">
              <Users size={11} />
              Council
            </span>
          </label>
          <CouncilSelect
            id="councilId"
            name="councilId"
            value=""
            councils={data.councils}
            placeholder="Select your council..."
            variant="form"
          />
        </div>

        <!-- Unit Type + Number -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label
              for="unitType"
              class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2"
            >
              <span class="inline-flex items-center gap-1.5">
                <Tent size={11} />
                Unit Type
              </span>
            </label>
            <select
              id="unitType"
              name="unitType"
              class="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all outline-none"
            >
              <option value="">Select type...</option>
              <option value="Pack">Pack (Cub Scouts)</option>
              <option value="Troop">Troop (Scouts BSA)</option>
              <option value="Crew">Crew (Venturing)</option>
              <option value="Ship">Ship (Sea Scouts)</option>
              <option value="Post">Post (Exploring)</option>
            </select>
          </div>
          <div>
            <label
              for="unitNumber"
              class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2"
            >
              <span class="inline-flex items-center gap-1.5">
                <Hash size={11} />
                Unit Number
              </span>
            </label>
            <input
              type="text"
              id="unitNumber"
              name="unitNumber"
              maxlength="10"
              placeholder="e.g. 42"
              class="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        <div class="pt-1 flex items-center justify-between gap-4">
          <a
            href="/"
            class="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            Skip for now
          </a>
          <button
            type="submit"
            disabled={isSaving}
            class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-stone-950 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style="background: linear-gradient(135deg, #86efac, #34d399);"
          >
            {isSaving ? "Saving..." : "Complete Setup"}
            {#if !isSaving}
              <ChevronRight size={14} />
            {/if}
          </button>
        </div>
      </form>
    </div>

    <p class="text-center text-xs text-stone-400 mt-5">
      You can always update this later in your <a href="/profile" class="underline hover:text-stone-600">profile</a>.
    </p>
  </div>
</div>
