<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let postId: string;
  export let initialData: Record<string, unknown> | null = null;

  let editorContainer: HTMLDivElement;
  let editor: import("@editorjs/editorjs").default | null = null;

  onMount(async () => {
    const [
      { default: EditorJS },
      { default: Header },
      { default: List },
      { default: Quote },
      { default: Code },
      { default: ImageTool },
      { default: Delimiter },
    ] = await Promise.all([
      import("@editorjs/editorjs"),
      import("@editorjs/header"),
      import("@editorjs/list"),
      import("@editorjs/quote"),
      import("@editorjs/code"),
      import("@editorjs/image"),
      import("@editorjs/delimiter"),
    ]);

    editor = new EditorJS({
      holder: editorContainer,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: (initialData ?? undefined) as any,
      tools: {
        header: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          class: Header as any,
          inlineToolbar: true,
          config: { levels: [1, 2, 3, 4], defaultLevel: 2 },
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: { defaultStyle: "unordered" },
        },
        quote: { class: Quote, inlineToolbar: true },
        code: Code,
        delimiter: Delimiter,
        image: {
          class: ImageTool,
          inlineToolbar: true,
          config: {
            uploader: {
              async uploadByFile(file: File) {
                const fd = new FormData();
                fd.append("file", file);
                fd.append("postId", postId);
                const res = await fetch("/api/posts/cover", { method: "POST", body: fd });
                if (!res.ok) return { success: 0 };
                const { url } = await res.json();
                return { success: 1, file: { url } };
              },
              async uploadByUrl(url: string) {
                return { success: 1, file: { url } };
              },
            },
          },
        },
      },
      placeholder: "Start writing…",
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });

  export async function getData(): Promise<unknown> {
    if (!editor) return { blocks: [] };
    return editor.save();
  }
</script>

<div
  bind:this={editorContainer}
  class="editorjs-wrapper min-h-[400px] bg-white rounded-lg py-2"
></div>

<style>
  :global(.ce-block__content) {
    max-width: none;
  }
  :global(.ce-toolbar__content) {
    max-width: none;
  }
  :global(.codex-editor__redactor) {
    padding-bottom: 100px !important;
    padding-left: 60px !important;
    padding-right: 16px !important;
  }
  :global(.ce-toolbar__plus),
  :global(.ce-toolbar__settings-btn) {
    color: #a8a29e !important;
    background: transparent !important;
  }
  :global(.ce-toolbar__plus:hover),
  :global(.ce-toolbar__settings-btn:hover) {
    color: #ffffff !important;
    background: rgba(255, 255, 255, 0.1) !important;
  }

  /* Restore heading sizes inside the editor so WYSIWYG matches rendered output */
  :global(.editorjs-wrapper h1) {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.2;
  }
  :global(.editorjs-wrapper h2) {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.3;
  }
  :global(.editorjs-wrapper h3) {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.4;
  }
  :global(.editorjs-wrapper h4) {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.4;
  }
</style>
