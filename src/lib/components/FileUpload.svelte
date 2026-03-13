<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Upload, ImageIcon, X, FileText } from "lucide-svelte";
  import Button from "./Button.svelte";
  import Alert from "./Alert.svelte";

  export let entityType: "hike" | "camping_site" | "backpacking";
  export let entityId: string;
  export let fileType: "image" | "document" = "image";
  export let existingCount: number = 0;

  const MAX_PHOTOS = 6;

  const dispatch = createEventDispatcher<{ uploaded: void }>();

  let files: File[] = [];
  let uploading = false;
  let error: string | null = null;
  let success = false;
  let fileInput: HTMLInputElement;
  let dragOver = false;

  $: atLimit = fileType === "image" && existingCount >= MAX_PHOTOS;
  $: remaining = fileType === "image" ? Math.max(0, MAX_PHOTOS - existingCount) : Infinity;

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      files = Array.from(input.files).slice(0, remaining);
      success = false;
      error = null;
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    if (atLimit) return;
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    const accepted =
      fileType === "image"
        ? dropped.filter((f) => f.type.startsWith("image/"))
        : dropped.filter((f) => /\.(pdf|doc|docx)$/i.test(f.name));
    files = accepted.slice(0, remaining);
    success = false;
    error = null;
  }

  function removeFile(index: number) {
    files = files.filter((_, i) => i !== index);
  }

  async function uploadFiles() {
    if (files.length === 0 || uploading) return;

    const filesToUpload = [...files];
    uploading = true;
    error = null;
    success = false;

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("entity_type", entityType);
        formData.append("entity_id", entityId);
        formData.append("file_type", fileType);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.message ?? "Upload failed");
        }
      }

      files = [];
      if (fileInput) fileInput.value = "";
      success = true;
      dispatch("uploaded");
    } catch (err) {
      error = err instanceof Error ? err.message : "Upload failed";
    } finally {
      uploading = false;
    }
  }
</script>

<div class="space-y-4">
  {#if atLimit}
    <Alert
      variant="warning"
      message="Photo limit reached (max {MAX_PHOTOS}). Delete a photo to add more."
    />
  {:else}
    <!-- Drop zone -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="relative border-2 border-dashed rounded-xl p-6 text-center transition-colors {dragOver
        ? 'border-indigo-400 bg-indigo-50'
        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}"
      on:dragover|preventDefault={() => (dragOver = true)}
      on:dragleave={() => (dragOver = false)}
      on:drop={handleDrop}
    >
      <div class="flex flex-col items-center gap-2 pointer-events-none">
        {#if fileType === "image"}
          <ImageIcon size={32} class="text-gray-300" />
        {:else}
          <FileText size={32} class="text-gray-300" />
        {/if}
        <p class="text-sm font-medium text-gray-600">
          Drag & drop {fileType === "image" ? "images" : "documents"} here
        </p>
        <p class="text-xs text-gray-400">or click to browse</p>
        {#if fileType === "image"}
          <p class="text-xs text-gray-400">{existingCount}/{MAX_PHOTOS} photos used</p>
        {/if}
      </div>
      <input
        type="file"
        multiple
        accept={fileType === "image" ? "image/*" : ".pdf,.doc,.docx"}
        disabled={uploading}
        bind:this={fileInput}
        on:change={handleFileSelect}
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
    </div>
  {/if}

  <!-- Selected files -->
  {#if files.length > 0}
    <div class="space-y-2">
      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Selected ({files.length})
      </p>
      <ul class="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
        {#each files as file, i (file.name)}
          <li class="flex items-center gap-3 px-3 py-2 bg-white text-sm text-gray-700">
            {#if fileType === "image"}
              <ImageIcon size={14} class="flex-shrink-0 text-indigo-400" />
            {:else}
              <FileText size={14} class="flex-shrink-0 text-indigo-400" />
            {/if}
            <span class="flex-1 truncate">{file.name}</span>
            <button
              type="button"
              class="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
              on:click={() => removeFile(i)}
            >
              <X size={14} />
            </button>
          </li>
        {/each}
      </ul>

      <Button variant="primary" size="sm" loading={uploading} on:click={uploadFiles}>
        <svelte:fragment slot="icon-left">
          <Upload size={14} />
        </svelte:fragment>
        {uploading ? "Uploading…" : `Upload ${files.length === 1 ? "photo" : "photos"}`}
      </Button>
    </div>
  {/if}

  {#if success}
    <Alert variant="success" message="Files uploaded successfully." />
  {/if}

  {#if error}
    <Alert variant="error" message={error} />
  {/if}
</div>
