<script lang="ts">
  import Card from "../Card.svelte";
  import { File } from "lucide-svelte";

  export let files: Array<{ fileName: string; fileUrl: string; fileType: string }> | undefined;
</script>

{#if files && files.length > 0}
  <Card>
    <h2 slot="header" class="text-xl font-bold text-gray-900">Images & Documents</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      {#each files as file (file.fileUrl)}
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
            <File size={32} class="text-gray-400 mb-2" />
            <p class="text-sm font-medium text-gray-900 truncate">
              {file.fileName}
            </p>
          </a>
        {/if}
      {/each}
    </div>
  </Card>
{/if}
