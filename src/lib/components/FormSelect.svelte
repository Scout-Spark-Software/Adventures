<script lang="ts">
  export let id: string = "";
  export let name: string = "";
  export let value: string = "";
  export let required: boolean = false;
  export let error: unknown = false;
</script>

<select
  {id}
  {name}
  bind:value
  {required}
  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
  class:border-red-500={!!error}
  on:change
>
  <slot />
</select>
