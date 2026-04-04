<script lang="ts">
  import { tick } from "svelte";

  export let tabs: { id: string; label: string; count?: number }[];
  export let activeTab: string;
  export let fullWidth: boolean = false;

  let tabElements: HTMLButtonElement[] = [];
  let indicatorStyle = "";

  function updateIndicator() {
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const el = tabElements[activeIndex];
    if (el) {
      indicatorStyle = `left: ${el.offsetLeft}px; width: ${el.offsetWidth}px;`;
    }
  }

  function selectTab(tabId: string) {
    activeTab = tabId;
    tick().then(updateIndicator);
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

  // Set initial indicator position after mount
  $: if (tabElements.length && activeTab) tick().then(updateIndicator);
</script>

<div
  class="relative flex bg-stone-100 ring-1 ring-stone-200 rounded-xl p-1 {fullWidth ? 'grid' : 'inline-flex'}"
  style={fullWidth ? `grid-template-columns: repeat(${tabs.length}, minmax(0, 1fr))` : ""}
  role="tablist"
  aria-label="Tabs"
>
  <!-- sliding pill indicator -->
  <span
    class="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-all duration-200 ease-in-out pointer-events-none"
    style={indicatorStyle}
  ></span>

  {#each tabs as tab, i (tab.id)}
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
        relative z-10
        {activeTab === tab.id ? 'text-emerald-700 font-semibold' : 'text-stone-500 hover:text-stone-700'}
        whitespace-nowrap py-2 px-4 rounded-lg text-sm transition-colors duration-150 {fullWidth ? 'text-center' : ''}
      "
    >
      {tab.label}
      {#if tab.count !== undefined}
        <span
          class="
            {activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}
            hidden sm:inline ml-2 py-0.5 px-2 rounded-full text-xs font-medium transition-colors
          "
        >
          {tab.count}
        </span>
      {/if}
    </button>
  {/each}
</div>

<div class="mt-6" role="tabpanel" id="panel-{activeTab}" aria-labelledby="tab-{activeTab}">
  <slot />
</div>
