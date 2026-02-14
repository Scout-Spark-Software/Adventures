<script lang="ts">
  import { SquarePen } from "lucide-svelte";

  export let href: string;
  export let text: string = "Edit";
</script>

<a
  {href}
  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
>
  <SquarePen size={16} />
  <span>{text}</span>
</a>
