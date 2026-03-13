<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { ChevronLeft, ChevronRight, X, Trash2, Flag, Star } from "lucide-svelte";

  export let images: Array<{
    id: string;
    fileUrl: string;
    fileName: string;
    uploadedBy: string;
    isBanner?: boolean;
  }>;
  export let initialIndex: number = 0;
  export let isAdmin: boolean = false;
  export let userId: string | null = null;
  export let flaggedImageIds: Set<string> = new Set();

  const dispatch = createEventDispatcher<{
    close: void;
    deleted: { id: string };
    flagged: { id: string };
    bannerChanged: { id: string };
  }>();

  let currentIndex = initialIndex;
  let deleting = false;
  let confirmDelete = false;
  let flagging = false;
  let settingBanner = false;

  $: image = images[currentIndex];
  $: hasPrev = currentIndex > 0;
  $: hasNext = currentIndex < images.length - 1;
  $: isBannerImage = image?.isBanner ?? false;

  function close() {
    dispatch("close");
  }

  function prev() {
    if (hasPrev) {
      currentIndex--;
      confirmDelete = false;
    }
  }

  function next() {
    if (hasNext) {
      currentIndex++;
      confirmDelete = false;
    }
  }

  async function deleteImage() {
    if (deleting) return;
    deleting = true;
    try {
      const response = await fetch(`/api/files/${image.id}`, { method: "DELETE" });
      if (response.ok) {
        dispatch("deleted", { id: image.id });
        // Move to adjacent image or close if none left
        if (images.length === 1) {
          close();
        } else if (currentIndex >= images.length - 1) {
          currentIndex = images.length - 2;
        }
        confirmDelete = false;
      }
    } finally {
      deleting = false;
    }
  }

  async function flagImage() {
    if (flagging || flaggedImageIds.has(image.id)) return;
    flagging = true;
    try {
      const response = await fetch(`/api/files/${image.id}/flag`, { method: "POST" });
      if (response.ok || response.status === 409) {
        dispatch("flagged", { id: image.id });
      }
    } finally {
      flagging = false;
    }
  }

  async function setBanner() {
    if (settingBanner || isBannerImage) return;
    settingBanner = true;
    try {
      const response = await fetch(`/api/files/${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanner: true }),
      });
      if (response.ok) {
        dispatch("bannerChanged", { id: image.id });
      }
    } finally {
      settingBanner = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    document.body.style.overflow = "hidden";
  });

  onDestroy(() => {
    document.removeEventListener("keydown", handleKeydown);
    document.body.style.overflow = "";
  });
</script>

<!-- Backdrop -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
  on:click|self={close}
  role="dialog"
  aria-modal="true"
  aria-label="Image viewer"
>
  <!-- Top bar -->
  <div
    class="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent z-10"
  >
    <span class="text-sm text-white/70">
      {currentIndex + 1} / {images.length}
    </span>
    <div class="flex items-center gap-2">
      <!-- Flag button (logged-in non-uploader) -->
      {#if userId && image.uploadedBy !== userId && !isAdmin}
        <button
          on:click={flagImage}
          disabled={flagging || flaggedImageIds.has(image.id)}
          title={flaggedImageIds.has(image.id) ? "Image reported" : "Flag as inappropriate"}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors {flaggedImageIds.has(
            image.id
          )
            ? 'bg-red-500/80 text-white'
            : 'bg-white/10 hover:bg-red-500/70 text-white/80 hover:text-white'} disabled:opacity-50"
        >
          <Flag size={13} />
          {flaggedImageIds.has(image.id) ? "Reported" : "Report"}
        </button>
      {/if}

      <!-- Admin controls -->
      {#if isAdmin}
        <!-- Set banner button -->
        <button
          on:click={setBanner}
          disabled={settingBanner || isBannerImage}
          title={isBannerImage ? "Current banner image" : "Set as banner image"}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors {isBannerImage
            ? 'bg-yellow-500/80 text-white cursor-default'
            : 'bg-white/10 hover:bg-yellow-500/70 text-white/80 hover:text-white'} disabled:opacity-60"
        >
          <Star size={13} class={isBannerImage ? "fill-current" : ""} />
          {isBannerImage ? "Banner" : settingBanner ? "Saving..." : "Set banner"}
        </button>

        <!-- Delete button -->
        {#if confirmDelete}
          <div class="flex items-center gap-2">
            <span class="text-sm text-white/80">Remove this image?</span>
            <button
              on:click={deleteImage}
              disabled={deleting}
              class="px-3 py-1.5 rounded-full text-xs font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
            >
              {deleting ? "Removing..." : "Yes, remove"}
            </button>
            <button
              on:click={() => (confirmDelete = false)}
              class="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        {:else}
          <button
            on:click={() => (confirmDelete = true)}
            title="Remove image"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-red-500/70 text-white/80 hover:text-white transition-colors"
          >
            <Trash2 size={13} />
            Remove
          </button>
        {/if}
      {/if}

      <!-- Close button -->
      <button
        on:click={close}
        title="Close"
        class="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  </div>

  <!-- Image -->
  <div class="relative flex items-center justify-center w-full h-full px-16">
    <img
      src={image.fileUrl}
      alt={image.fileName}
      class="max-w-full max-h-[85vh] object-contain rounded shadow-2xl select-none"
      draggable="false"
    />
  </div>

  <!-- Prev button -->
  {#if hasPrev}
    <button
      on:click={prev}
      title="Previous image"
      class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
    >
      <ChevronLeft size={22} />
    </button>
  {/if}

  <!-- Next button -->
  {#if hasNext}
    <button
      on:click={next}
      title="Next image"
      class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
    >
      <ChevronRight size={22} />
    </button>
  {/if}

  <!-- Bottom: filename -->
  <div
    class="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/60 to-transparent text-center"
  >
    <p class="text-sm text-white/60 truncate">{image.fileName}</p>
  </div>
</div>
