<script lang="ts">
  import Card from "../Card.svelte";
  import Badge from "../Badge.svelte";
  import { Check } from "lucide-svelte";

  export let features: string[] | undefined;
</script>

{#if features && Array.isArray(features) && features.length > 0}
  <Card>
    <h2 slot="header" class="text-xl font-bold text-gray-900">Features</h2>
    <div class="flex flex-wrap gap-2">
      {#each features as feature}
        <Badge variant="primary" size="md">
          <span slot="icon"><Check size={16} /></span>
          {feature}
        </Badge>
      {/each}
    </div>
  </Card>
{/if}
