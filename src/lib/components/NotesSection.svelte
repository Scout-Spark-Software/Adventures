<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { MapPin, Home } from "lucide-svelte";
  import type { Note } from "$lib/db/schemas";

  export let hikeId: string | undefined = undefined;
  export let campingSiteId: string | undefined = undefined;
  export let userId: string | undefined = undefined;

  const dispatch = createEventDispatcher();

  type NoteWithLocation = Note & {
    hike?: { id: string; name: string } | null;
    campingSite?: { id: string; name: string } | null;
  };

  let notes: NoteWithLocation[] = [];
  let filteredNotes: NoteWithLocation[] = [];
  let loading = true;
  let error = "";
  let editingNoteId: string | null = null;
  let newNoteContent = "";
  let editNoteContent = "";
  let showPreview = false;
  let editShowPreview = false;
  let isCreating = false;
  let filterType: "all" | "hikes" | "camping" = "all";
  let deletingNoteId: string = "";
  let isDeleting = false;
  let updatingNoteId: string | null = null;

  // Markdown rendering (simple implementation)
  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderMarkdown(text: string): string {
    // Escape HTML entities first to prevent XSS via {@html}
    const escaped = escapeHtml(text);
    return escaped
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*)\*/gim, "<em>$1</em>")
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/\n/g, "<br>")
      .replace(/^(.+)$/gm, '<p class="mb-2">$1</p>');
  }

  function applyFilter() {
    if (filterType === "all") {
      filteredNotes = notes;
    } else if (filterType === "hikes") {
      filteredNotes = notes.filter((note) => note.hikeId);
    } else if (filterType === "camping") {
      filteredNotes = notes.filter((note) => note.campingSiteId);
    }
  }

  $: if (filterType) {
    applyFilter();
  }

  async function loadNotes() {
    if (!userId) return;

    loading = true;
    error = "";

    try {
      const params = new URLSearchParams();
      if (hikeId) params.set("hike_id", hikeId);
      if (campingSiteId) params.set("camping_site_id", campingSiteId);

      const response = await fetch(`/api/notes?${params}`);
      if (!response.ok) throw new Error("Failed to load notes");

      notes = await response.json();
      applyFilter();
      dispatch("notesCountChanged", notes.length);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load notes";
    } finally {
      loading = false;
    }
  }

  async function createNote() {
    if (!newNoteContent.trim() || !userId) return;

    isCreating = true;
    error = "";

    // Create optimistic note
    const optimisticNote: NoteWithLocation = {
      id: `temp-${Date.now()}`,
      userId,
      hikeId: hikeId || null,
      campingSiteId: campingSiteId || null,
      content: newNoteContent,
      createdAt: new Date(),
      updatedAt: new Date(),
      hike: null,
      campingSite: null,
    };

    const contentToSubmit = newNoteContent;

    // Optimistic update
    notes = [optimisticNote, ...notes];
    applyFilter();
    dispatch("notesCountChanged", notes.length);
    newNoteContent = "";
    showPreview = false;

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hikeId,
          campingSiteId,
          content: contentToSubmit,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create note");
      }

      const createdNote = await response.json();

      // Replace optimistic note with real note
      notes = notes.map((n) => (n.id === optimisticNote.id ? createdNote : n));
      applyFilter();
    } catch (e) {
      // Revert optimistic update on error
      notes = notes.filter((n) => n.id !== optimisticNote.id);
      applyFilter();
      dispatch("notesCountChanged", notes.length);
      newNoteContent = contentToSubmit;
      error = e instanceof Error ? e.message : "Failed to create note";
    } finally {
      isCreating = false;
    }
  }

  async function updateNote(noteId: string) {
    if (!editNoteContent.trim()) return;

    updatingNoteId = noteId;
    error = "";

    // Store original note for rollback
    const originalNote = notes.find((n) => n.id === noteId);
    if (!originalNote) return;

    const originalContent = originalNote.content;
    const newContent = editNoteContent;

    // Optimistic update
    notes = notes.map((n) =>
      n.id === noteId
        ? {
            ...n,
            content: newContent,
            updatedAt: new Date(),
          }
        : n
    );
    applyFilter();
    editingNoteId = null;
    editNoteContent = "";
    editShowPreview = false;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update note");
      }

      const updatedNote = await response.json();

      // Replace optimistic note with server response
      notes = notes.map((n) => (n.id === noteId ? updatedNote : n));
      applyFilter();
    } catch (e) {
      // Revert optimistic update on error
      notes = notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              content: originalContent,
              updatedAt: originalNote.updatedAt,
            }
          : n
      );
      applyFilter();
      editingNoteId = noteId;
      editNoteContent = newContent;
      error = e instanceof Error ? e.message : "Failed to update note";
    } finally {
      updatingNoteId = null;
    }
  }

  async function deleteNote(noteId: string) {
    isDeleting = true;
    error = "";

    // Store original notes for rollback
    const originalNotes = [...notes];
    const originalCount = notes.length;

    // Optimistic update
    notes = notes.filter((n) => n.id !== noteId);
    applyFilter();
    dispatch("notesCountChanged", notes.length);
    deletingNoteId = "";

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");
    } catch (e) {
      // Revert optimistic update on error
      notes = originalNotes;
      applyFilter();
      dispatch("notesCountChanged", originalCount);
      deletingNoteId = noteId;
      error = e instanceof Error ? e.message : "Failed to delete note";
    } finally {
      isDeleting = false;
    }
  }

  function startEdit(note: Note) {
    editingNoteId = note.id;
    editNoteContent = note.content;
    editShowPreview = false;
  }

  function cancelEdit() {
    editingNoteId = null;
    editNoteContent = "";
    editShowPreview = false;
    error = "";
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  onMount(() => {
    loadNotes();
  });
</script>

{#if !userId}
  <div class="text-center py-8 bg-gray-50 rounded-lg">
    <p class="text-gray-600">Please log in to create and view notes.</p>
  </div>
{:else}
  {#if error}
    <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      {error}
    </div>
  {/if}

  <!-- Create New Note (only show when on specific hike/camping page) -->
  {#if hikeId || campingSiteId}
    <div class="mb-6 bg-white shadow rounded-lg p-5">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">New Note</h3>

      <div class="mb-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex gap-2">
            <button
              on:click={() => (showPreview = false)}
              class="px-3 py-1 text-sm rounded {!showPreview
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600'}"
            >
              Write
            </button>
            <button
              on:click={() => (showPreview = true)}
              class="px-3 py-1 text-sm rounded {showPreview
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600'}"
            >
              Preview
            </button>
          </div>
          <span class="text-sm text-gray-500">
            {newNoteContent.length} / 10,000
          </span>
        </div>

        {#if showPreview}
          <div class="prose max-w-none p-4 bg-gray-50 rounded border min-h-[150px]">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html renderMarkdown(newNoteContent || "_Nothing to preview_")}
          </div>
        {:else}
          <textarea
            bind:value={newNoteContent}
            placeholder="Write your note here... Markdown is supported!"
            maxlength="10000"
            rows="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        {/if}
      </div>

      <button
        on:click={createNote}
        disabled={!newNoteContent.trim() || isCreating}
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isCreating ? "Creating..." : "Create Note"}
      </button>
    </div>
  {/if}

  <!-- Notes List -->
  {#if loading}
    <div class="text-center py-8">
      <p class="text-gray-500">Loading notes...</p>
    </div>
  {:else if notes.length === 0}
    <div class="text-center py-8 bg-gray-50 rounded-lg">
      <p class="text-gray-600">No notes yet. Create your first note above!</p>
    </div>
  {:else}
    <!-- Filter Tabs (only show when on profile page with all notes) -->
    {#if !hikeId && !campingSiteId}
      <div class="mb-4 flex gap-2 border-b border-gray-200">
        <button
          on:click={() => (filterType = "all")}
          class="px-4 py-2 text-sm font-medium transition-colors border-b-2 {filterType === 'all'
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          All Notes ({notes.length})
        </button>
        <button
          on:click={() => (filterType = "hikes")}
          class="px-4 py-2 text-sm font-medium transition-colors border-b-2 {filterType === 'hikes'
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Hikes ({notes.filter((n) => n.hikeId).length})
        </button>
        <button
          on:click={() => (filterType = "camping")}
          class="px-4 py-2 text-sm font-medium transition-colors border-b-2 {filterType ===
          'camping'
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Camping ({notes.filter((n) => n.campingSiteId).length})
        </button>
      </div>
    {/if}

    <div class="space-y-4">
      {#each filteredNotes as note (note.id)}
        <div
          class="bg-white shadow rounded-lg p-5 transition-opacity duration-200 {note.id.startsWith(
            'temp-'
          )
            ? 'opacity-70'
            : ''}"
        >
          {#if editingNoteId === note.id}
            <!-- Edit Mode -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="flex gap-2">
                  <button
                    on:click={() => (editShowPreview = false)}
                    class="px-3 py-1 text-sm rounded {!editShowPreview
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600'}"
                  >
                    Write
                  </button>
                  <button
                    on:click={() => (editShowPreview = true)}
                    class="px-3 py-1 text-sm rounded {editShowPreview
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600'}"
                  >
                    Preview
                  </button>
                </div>
                <span class="text-sm text-gray-500">
                  {editNoteContent.length} / 10,000
                </span>
              </div>

              {#if editShowPreview}
                <div class="prose max-w-none p-4 bg-gray-50 rounded border min-h-[150px] mb-3">
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html renderMarkdown(editNoteContent)}
                </div>
              {:else}
                <textarea
                  bind:value={editNoteContent}
                  maxlength="10000"
                  rows="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
                />
              {/if}

              <div class="flex gap-2">
                <button
                  on:click={() => updateNote(note.id)}
                  disabled={updatingNoteId === note.id}
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingNoteId === note.id ? "Saving..." : "Save"}
                </button>
                <button
                  on:click={cancelEdit}
                  disabled={updatingNoteId === note.id}
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          {:else}
            <!-- View Mode -->
            <!-- Location badge -->
            {#if note.hike || note.campingSite}
              <div class="mb-3">
                {#if note.hike}
                  <a
                    href="/hikes/{note.hike.id}"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <MapPin size={16} />
                    {note.hike.name}
                  </a>
                {:else if note.campingSite}
                  <a
                    href="/camping/{note.campingSite.id}"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                  >
                    <Home size={16} />
                    {note.campingSite.name}
                  </a>
                {/if}
              </div>
            {/if}

            <div class="flex justify-between items-start mb-3">
              <div class="text-sm text-gray-500">
                {#if note.createdAt !== note.updatedAt}
                  Updated {formatDate(note.updatedAt?.toString())}
                {:else}
                  Created {formatDate(note.createdAt?.toString())}
                {/if}
              </div>
              {#if !note.id.startsWith("temp-")}
                <div class="flex gap-2">
                  <button
                    on:click={() => startEdit(note)}
                    class="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </button>
                  <button
                    on:click={() => (deletingNoteId = note.id)}
                    class="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              {/if}
            </div>

            <div class="prose max-w-none">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html renderMarkdown(note.content)}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
{/if}

<!-- Delete Confirmation Modal -->
{#if deletingNoteId}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Note?</h3>
      <p class="text-gray-600 mb-6">
        Are you sure you want to delete this note? This action cannot be undone.
      </p>
      {#if error}
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      {/if}
      <div class="flex gap-3 justify-end">
        <button
          on:click={() => (deletingNoteId = "")}
          disabled={isDeleting}
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          on:click={() => deleteNote(deletingNoteId)}
          disabled={isDeleting}
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
{/if}
