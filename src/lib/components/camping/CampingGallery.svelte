<script lang="ts">
  import Card from "../Card.svelte";

  export let files:
    | Array<{ fileName: string; fileUrl: string; fileType: string }>
    | undefined;
</script>

{#if files && files.length > 0}
  <Card>
    <h2 slot="header" class="text-xl font-bold text-gray-900">
      Images & Documents
    </h2>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      {#each files as file}
        {#if file.fileType === "image"}
          <img
            src={file.fileUrl}
            alt={file.fileName}
            class="w-full h-48 object-cover rounded-lg shadow"
          />
        {:else}
          <a
            href={file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="block p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-indigo-300 transition-colors"
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
            <p class="text-sm font-medium text-gray-900 truncate">
              {file.fileName}
            </p>
          </a>
        {/if}
      {/each}
    </div>
  </Card>
{/if}
