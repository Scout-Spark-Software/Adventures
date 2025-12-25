<script lang="ts">
  import Card from '../Card.svelte';

  export let description: string | undefined;
</script>

{#if description}
  <Card>
    <h2 slot="header" class="text-xl font-bold text-gray-900">
      About This Trail
    </h2>
    <div class="prose max-w-none">
      <p class="text-gray-700 leading-relaxed">
        {description}
      </p>
    </div>
  </Card>
{/if}
