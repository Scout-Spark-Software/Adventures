<script lang="ts">
  export let id: string = "";
  export let type: string = "text";
  export let value: string = "";
  export let placeholder: string = "";
  export let min: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let step: number | undefined = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let fullWidth: boolean = true;
</script>

<input
  {id}
  {type}
  bind:value
  {placeholder}
  {min}
  {max}
  {step}
  aria-label={ariaLabel}
  class="{fullWidth
    ? 'w-full'
    : 'w-1/2'} px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
  on:input
  on:change
/>
