<script lang="ts">
  import { tick } from "svelte";

  export let tabs: { id: string; label: string; count?: number }[];
  export let activeTab: string;
  export let fullWidth: boolean = false;

  let tabElements: HTMLButtonElement[] = [];

  function selectTab(tabId: string) {
    activeTab = tabId;
  }

  async function handleKeyDown(event: KeyboardEvent, index: number) {
    let newIndex = index;

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        newIndex = (index + 1) % tabs.length;
        break;
      case "ArrowLeft":
        event.preventDefault();
        newIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        event.preventDefault();
        newIndex = 0;
        break;
      case "End":
        event.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    selectTab(tabs[newIndex].id);
    await tick();
    tabElements[newIndex]?.focus();
  }
</script>

<div class="border-b border-gray-200">
  <div
    class="-mb-px {fullWidth ? 'grid' : 'flex space-x-8'}"
    style={fullWidth ? `grid-template-columns: repeat(${tabs.length}, minmax(0, 1fr))` : ""}
    role="tablist"
    aria-label="Tabs"
  >
    {#each tabs as tab, i}
      <button
        role="tab"
        id="tab-{tab.id}"
        aria-selected={activeTab === tab.id}
        aria-controls={activeTab === tab.id ? "panel-" + tab.id : undefined}
        tabindex={activeTab === tab.id ? 0 : -1}
        bind:this={tabElements[i]}
        on:click={() => selectTab(tab.id)}
        on:keydown={(e) => handleKeyDown(e, i)}
        class="
          {activeTab === tab.id
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
          whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors {fullWidth
          ? 'text-center'
          : ''}
        "
      >
        {tab.label}
        {#if tab.count !== undefined}
          <span
            class="
              {activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900'}
              ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
            "
          >
            {tab.count}
          </span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<div class="mt-6" role="tabpanel" id="panel-{activeTab}" aria-labelledby="tab-{activeTab}">
  <slot />
</div>
