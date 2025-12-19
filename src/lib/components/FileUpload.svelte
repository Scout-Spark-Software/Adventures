<script lang="ts">
	export let entityType: 'hike' | 'camping_site';
	export let entityId: string;
	export let fileType: 'image' | 'document' = 'image';

	let files: File[] = [];
	let uploading = false;
	let error: string | null = null;

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			files = Array.from(input.files);
		}
	}

	async function uploadFiles() {
		if (files.length === 0) return;

		uploading = true;
		error = null;

		try {
			for (const file of files) {
				const formData = new FormData();
				formData.append('file', file);
				formData.append('entity_type', entityType);
				formData.append('entity_id', entityId);
				formData.append('file_type', fileType);

				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error('Upload failed');
				}
			}

			files = [];
			// Trigger reload or emit event
			window.location.reload();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Upload failed';
		} finally {
			uploading = false;
		}
	}
</script>

<div class="space-y-4">
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Upload {fileType === 'image' ? 'Images' : 'Documents'}
		</label>
		<input
			type="file"
			multiple
			accept={fileType === 'image' ? 'image/*' : '.pdf,.doc,.docx'}
			onchange={handleFileSelect}
			class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
		/>
	</div>

	{#if files.length > 0}
		<div class="space-y-2">
			{#each files as file}
				<p class="text-sm text-gray-600">{file.name}</p>
			{/each}
			<button
				onclick={uploadFiles}
				disabled={uploading}
				class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
			>
				{uploading ? 'Uploading...' : 'Upload'}
			</button>
		</div>
	{/if}

	{#if error}
		<div class="rounded-md bg-red-50 p-4">
			<div class="text-sm text-red-800">{error}</div>
		</div>
	{/if}
</div>

