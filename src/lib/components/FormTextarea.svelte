<script lang="ts">
  export let id: string = "";
  export let name: string = "";
  export let value: string = "";
  export let placeholder: string = "";
  export let required: boolean = false;
  export let rows: number = 3;
  export let maxlength: number | undefined = undefined;
  export let error: unknown = false;
</script>

<textarea
  {id}
  {name}
  bind:value
  {placeholder}
  {required}
  {rows}
  {maxlength}
  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
  class:border-red-500={!!error}
  on:input
  on:change
></textarea>
