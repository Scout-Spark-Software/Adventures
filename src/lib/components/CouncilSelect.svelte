<script lang="ts">
  export let id: string = "";
  export let value: string = "";
  export let name: string = "";
  export let councils: {
    id: string;
    councilNumber: number;
    name: string;
    headquartersCity: string | null;
    headquartersState: string | null;
  }[] = [];
  export let placeholder: string = "All Councils";
  export let selectClass: string = "w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent";

  // Group councils by state, sorted alphabetically; councils sorted by name within each state
  $: councilsByState = (() => {
    const grouped: Record<string, typeof councils> = {};
    for (const council of councils) {
      const state = council.headquartersState || "Other";
      if (!grouped[state]) grouped[state] = [];
      grouped[state].push(council);
    }
    for (const state of Object.keys(grouped)) {
      grouped[state].sort((a, b) => a.name.localeCompare(b.name));
    }
    return Object.entries(grouped).sort(([a], [b]) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    });
  })();
</script>

<select
  {id}
  {name}
  bind:value
  class={selectClass}
  on:change
>
  <option value="">{placeholder}</option>
  {#each councilsByState as [state, stateCouncils] (state)}
    <optgroup label={state}>
      {#each stateCouncils as council (council.id)}
        <option value={council.id}>{council.name}</option>
      {/each}
    </optgroup>
  {/each}
</select>
