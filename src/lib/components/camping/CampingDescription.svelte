<script lang="ts">
  import Card from '../Card.svelte';

  export let description: string | undefined;
</script>

{#if description}
  <Card>
    <div class="prose max-w-none">
      <p class="text-gray-700 leading-relaxed">
        {description}
      </p>
    </div>
  </Card>
{/if}
