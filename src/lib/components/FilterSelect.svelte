<script lang="ts">
  export let id: string = "";
  export let value: string = "";
</script>

<select
  {id}
  bind:value
  class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
  on:change
>
  <slot />
</select>
