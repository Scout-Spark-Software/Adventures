<script lang="ts">
  import { fly } from "svelte/transition";
  import { Share2, Copy, Check, Mail } from "lucide-svelte";

  export let title: string = "";
  export let description: string = "";

  let open = false;
  let copied = false;
  let copyTimer: ReturnType<typeof setTimeout> | null = null;
  let container: HTMLElement;

  function getShareUrl(): string {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  // Mobile: native share sheet, or dropdown fallback
  function handleMobileClick() {
    const url = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title, text: description, url }).catch(() => {});
    } else {
      open = !open;
    }
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      copied = true;
      if (copyTimer) clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        copied = false;
        copyTimer = null;
      }, 2000);
    } catch {
      // clipboard API unavailable
    }
    open = false;
  }

  function openWindow(href: string) {
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=450");
    open = false;
  }

  function shareX() {
    const url = getShareUrl();
    const text = description ? `${title} — ${description}` : title;
    openWindow(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    );
  }

  function shareFacebook() {
    openWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`
    );
  }

  function shareWhatsApp() {
    const url = getShareUrl();
    const text = description ? `${title} — ${description}` : title;
    openWindow(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
  }

  function shareEmail() {
    const url = getShareUrl();
    const body = description ? `${description}\n\n${url}` : url;
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") open = false;
  }

  function handleWindowClick(e: MouseEvent) {
    if (open && container && !container.contains(e.target as Node)) {
      open = false;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} on:click={handleWindowClick} />

<div bind:this={container} class="relative">
  <!-- ── Mobile: compact icon button ── -->
  <div class="sm:hidden">
    <button
      type="button"
      on:click={handleMobileClick}
      aria-label="Share"
      class="inline-flex items-center justify-center w-10 h-10 rounded-2xl text-gray-600 hover:bg-gray-200/80 transition-colors"
    >
      {#if copied}
        <Check size={20} class="text-green-500" />
      {:else}
        <Share2 size={20} />
      {/if}
    </button>

    {#if open}
      <!-- Mobile fallback dropdown (when native share unavailable) -->
      <div
        class="absolute right-0 top-full mt-2 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 w-52 overflow-hidden"
        role="menu"
        aria-label="Share options"
      >
        <button type="button" on:click={copyUrl} class="share-option" role="menuitem">
          <Copy size={16} />
          Copy link
        </button>
        <div class="my-1 border-t border-gray-100" role="separator"></div>
        <button type="button" on:click={shareX} class="share-option" role="menuitem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.257 5.632L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
          </svg>
          Share on X
        </button>
        <button type="button" on:click={shareFacebook} class="share-option" role="menuitem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Share on Facebook
        </button>
        <button type="button" on:click={shareWhatsApp} class="share-option" role="menuitem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Share via WhatsApp
        </button>
        <button type="button" on:click={shareEmail} class="share-option" role="menuitem">
          <Mail size={16} />
          Share via Email
        </button>
      </div>
    {/if}
  </div>

  <!-- ── Desktop: pill button + slide-out social icons ── -->
  <div class="hidden sm:flex items-center gap-2">
    {#if open}
      <!--
        Icons ordered left-to-right in DOM.
        X (rightmost, index 4) has delay 0 so it appears first.
        Copy (leftmost, index 0) has delay 180 so it appears last.
        On exit the order reverses.
      -->
      <button
        type="button"
        on:click={copyUrl}
        class="social-icon-btn"
        title="Copy link"
        aria-label="Copy link"
        in:fly={{ x: 16, duration: 220, delay: 180 }}
        out:fly={{ x: 16, duration: 160, delay: 0 }}
      >
        {#if copied}
          <Check size={15} class="text-green-500" />
        {:else}
          <Copy size={15} style="color: #6366f1" />
        {/if}
      </button>

      <button
        type="button"
        on:click={shareEmail}
        class="social-icon-btn"
        title="Share via Email"
        aria-label="Share via Email"
        in:fly={{ x: 16, duration: 220, delay: 135 }}
        out:fly={{ x: 16, duration: 160, delay: 35 }}
      >
        <Mail size={15} class="text-gray-500" />
      </button>

      <button
        type="button"
        on:click={shareWhatsApp}
        class="social-icon-btn"
        title="Share via WhatsApp"
        aria-label="Share via WhatsApp"
        in:fly={{ x: 16, duration: 220, delay: 90 }}
        out:fly={{ x: 16, duration: 160, delay: 70 }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </button>

      <button
        type="button"
        on:click={shareFacebook}
        class="social-icon-btn"
        title="Share on Facebook"
        aria-label="Share on Facebook"
        in:fly={{ x: 16, duration: 220, delay: 45 }}
        out:fly={{ x: 16, duration: 160, delay: 105 }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>

      <button
        type="button"
        on:click={shareX}
        class="social-icon-btn"
        title="Share on X"
        aria-label="Share on X"
        in:fly={{ x: 16, duration: 220, delay: 0 }}
        out:fly={{ x: 16, duration: 160, delay: 140 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.257 5.632L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
        </svg>
      </button>
    {/if}

    <button
      type="button"
      on:click={() => (open = !open)}
      aria-expanded={open}
      aria-label="Share"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl border transition-colors
        {open
        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm'}"
    >
      <Share2 size={15} />
      Share
    </button>
  </div>
</div>

<style>
  .social-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.125rem;
    height: 2.125rem;
    border-radius: 9999px;
    background: white;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
    transition: transform 0.15s, box-shadow 0.15s;
    flex-shrink: 0;
  }
  .social-icon-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 8px rgb(0 0 0 / 0.12);
  }
  .share-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: #374151;
    text-align: left;
    transition: background-color 0.15s;
  }
  .share-option:hover {
    background-color: #f9fafb;
  }
</style>
