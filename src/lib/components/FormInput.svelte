<script lang="ts">
  export let id: string = "";
  export let name: string = "";
  export let value: string | number | null = "";
  export let type: string = "text";
  export let placeholder: string = "";
  export let required: boolean = false;
  export let step: string | undefined = undefined;
  export let min: string | undefined = undefined;
  export let max: string | undefined = undefined;
  export let maxlength: number | undefined = undefined;
  export let error: unknown = false;
</script>

<input
  {id}
  {name}
  {type}
  bind:value
  {placeholder}
  {required}
  {step}
  {min}
  {max}
  {maxlength}
  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
  class:border-red-500={!!error}
  on:input
  on:change
/>
