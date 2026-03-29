<script lang="ts">
  import privacyHtml from "./privacy.html?raw";
</script>

<svelte:head>
  <title>Privacy Policy - Adventure Spark</title>
  <meta
    name="description"
    content="Privacy Policy for Adventure Spark, the scouts hiking and camping platform."
  />
</svelte:head>

<div class="min-h-screen bg-stone-50">
  <!-- Hero -->
  <div class="relative overflow-hidden hero-bg -mt-16">
    <div class="absolute inset-0 hero-gradient"></div>
    <div
      class="absolute -top-20 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle at 70% 30%, rgba(251,191,36,0.15) 0%, transparent 60%);"
    ></div>
    <div
      class="absolute bottom-0 -left-10 w-[500px] h-[400px] pointer-events-none"
      style="background: radial-gradient(ellipse at 20% 90%, rgba(52,211,153,0.18) 0%, transparent 65%);"
    ></div>

    <div class="absolute bottom-0 left-0 right-0 pointer-events-none">
      <svg class="absolute bottom-0 w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path
          d="M0,200 L0,140 L180,80 L360,120 L540,60 L720,100 L900,50 L1080,90 L1260,70 L1440,110 L1440,200 Z"
          fill="rgba(6,78,59,0.4)"
        />
      </svg>
      <svg class="absolute bottom-0 w-full" viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path
          d="M0,140 L0,100 L220,60 L420,90 L620,40 L820,75 L1020,45 L1220,80 L1440,55 L1440,140 Z"
          fill="rgba(2,44,34,0.65)"
        />
      </svg>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20">
      <div class="max-w-2xl">
        <span
          class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border mb-8"
          style="background: rgba(251,146,60,0.1); border-color: rgba(251,146,60,0.3); color: rgb(251,146,60);"
        >
          Legal
        </span>
        <h1
          class="font-black tracking-tight leading-[0.95] mb-5"
          style="font-size: clamp(2.5rem, 6vw, 4.5rem); color: #f5f0e8;"
        >
          Privacy<br />
          <span
            style="background: linear-gradient(135deg, #86efac 0%, #34d399 40%, #6ee7b7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"
          >
            Policy
          </span>
        </h1>
        <p class="text-lg max-w-xl leading-relaxed" style="color: rgba(245,240,232,0.65);">
          How we collect, use, and protect your information.
        </p>
      </div>
    </div>
  </div>

  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="space-y-10">
      <!-- Termly privacy policy legal content -->
      <div class="termly-policy">
        {@html privacyHtml}
      </div>

      <div class="h-px bg-stone-200"></div>
    </div>
  </div>
</div>

<style>
  .hero-bg {
    background-color: #0c0f0a;
  }
  .hero-gradient {
    background:
      radial-gradient(ellipse 80% 60% at 75% 20%, #1c2a14 0%, transparent 60%),
      radial-gradient(ellipse 100% 80% at 20% 60%, #0d2a1f 0%, transparent 65%),
      linear-gradient(170deg, #0a1a0d 0%, #081510 40%, #050a08 100%);
  }

  /* Use site font instead of Termly's Arial */
  .termly-policy :global([data-custom-class="body_text"]),
  .termly-policy :global([data-custom-class="body_text"] *),
  .termly-policy :global([data-custom-class="heading_1"]),
  .termly-policy :global([data-custom-class="heading_1"] *),
  .termly-policy :global([data-custom-class="heading_2"]),
  .termly-policy :global([data-custom-class="heading_2"] *),
  .termly-policy :global([data-custom-class="link"]),
  .termly-policy :global([data-custom-class="link"] *) {
    font-family: inherit !important;
  }

  /* Hide the Termly logo/badge */
  .termly-policy :global(span[style*="11.125rem"]) {
    display: none !important;
  }
</style>
