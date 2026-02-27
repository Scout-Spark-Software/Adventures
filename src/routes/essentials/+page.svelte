<script lang="ts">
  import {
    Droplets,
    CrossIcon,
    Siren,
    Flashlight,
    Sun,
    Cookie,
    PocketKnife,
    CloudRain,
    Sandwich,
    Shirt,
    Map,
    FlameKindling,
    Backpack,
    ArrowRight,
  } from "lucide-svelte";
  import type { ComponentType } from "svelte";

  const sixEssentials: {
    name: string;
    icon: ComponentType;
    description: string;
    tips: string[];
  }[] = [
    {
      name: "Filled Water Bottle",
      icon: Droplets,
      description: "Filled and large enough to last until it can be refilled.",
      tips: [
        "Consider water purification tablets or filters for extended trips",
        "Know where water sources are along your route",
        "Drink regularly, don't wait until you're thirsty",
      ],
    },
    {
      name: "Small First Aid Kit",
      icon: CrossIcon,
      description: "Essential supplies for treating minor injuries and emergencies.",
      tips: [
        "Include adhesive bandages, moleskin, gauze, and antibiotic ointment",
        "Add any personal medications",
        "Know how to use everything in your kit",
        "Check expiration dates regularly",
      ],
    },
    {
      name: "Whistle",
      icon: Siren,
      description: "For emergency use only — three blasts is the universal distress signal.",
      tips: [
        "A whistle carries farther than your voice",
        "Use only in genuine emergencies",
        "Attach to your pack strap for quick access",
        "Three short blasts signals distress",
      ],
    },
    {
      name: "Flashlight",
      icon: Flashlight,
      description: "Headlamp or flashlight for emergency use.",
      tips: [
        "LED lights are energy-efficient and bright",
        "Bring backup batteries in a waterproof bag",
        "A headlamp keeps your hands free",
        "For emergency use only on day hikes",
      ],
    },
    {
      name: "Sun Protection",
      icon: Sun,
      description: "Sunscreen of SPF 30 or greater and a hat.",
      tips: [
        "Use SPF 30+ broad-spectrum sunscreen",
        "Reapply sunscreen every 2 hours",
        "A wide-brimmed hat protects face and neck",
        "UV protection is important even on cloudy days",
      ],
    },
    {
      name: "Trail Mix",
      icon: Cookie,
      description: "High-energy snacks — can be made as a den activity before the hike.",
      tips: [
        "Pack more than you think you'll need",
        "Choose non-perishable, easy-to-eat foods",
        "Nuts, dried fruit, and granola are great options",
        "Consider food allergies in your group",
      ],
    },
  ];

  const tenEssentials: {
    name: string;
    icon: ComponentType;
    description: string;
    tips: string[];
  }[] = [
    {
      name: "Pocketknife",
      icon: PocketKnife,
      description: "A multi-purpose tool for camp tasks, first aid, and repairs.",
      tips: [
        "Keep your blade clean and sharp",
        "Always cut away from yourself",
        "A pocketknife is a privilege — use it responsibly",
        "Know your council's rules on knives at events",
      ],
    },
    {
      name: "Rain Gear",
      icon: CloudRain,
      description: "Waterproof jacket and pants to stay dry in wet conditions.",
      tips: [
        "Pack rain gear even if the forecast is clear",
        "Avoid cotton — it stays wet and cold",
        "Layer with breathable materials",
        "Keep rain gear accessible, not buried in your pack",
      ],
    },
    {
      name: "Trail Food",
      icon: Sandwich,
      description: "Extra food beyond what you plan to eat.",
      tips: [
        "Pack at least one extra day's worth of food",
        "Choose high-calorie, non-perishable items",
        "Don't forget to eat regularly while active",
        "Consider food allergies in your group",
      ],
    },
    {
      name: "Flashlight",
      icon: Flashlight,
      description: "Headlamp or flashlight with extra batteries.",
      tips: [
        "Bring at least one backup light source",
        "Pack extra batteries in a waterproof container",
        "Test your light before each trip",
        "Headlamps are preferred for hands-free operation",
      ],
    },
    {
      name: "Extra Clothing",
      icon: Shirt,
      description: "Extra layers in case of cold, wet, or changing weather.",
      tips: [
        "Pack layers for warmth even in summer",
        "Avoid cotton — choose wool or synthetics",
        "Bring a warm hat and gloves",
        "Weather can change quickly in the outdoors",
      ],
    },
    {
      name: "First-Aid Kit",
      icon: CrossIcon,
      description: "Comprehensive kit for treating injuries and emergencies.",
      tips: [
        "Include bandages, gauze, tape, and antiseptic",
        "Add blister treatment supplies",
        "Bring any personal medications",
        "Take a first aid and CPR course",
      ],
    },
    {
      name: "Sun Protection",
      icon: Sun,
      description: "Sunscreen, sunglasses, and protective clothing.",
      tips: [
        "Use SPF 30+ broad-spectrum sunscreen",
        "Wear UV-protective sunglasses",
        "Consider long sleeves and pants for extended exposure",
        "Protect lips with SPF lip balm",
      ],
    },
    {
      name: "Map and Compass",
      icon: Map,
      description: "Topographic map of the area and a compass to navigate.",
      tips: [
        "Always bring a paper map — don't rely solely on your phone",
        "Know how to use a compass to take bearings",
        "Study the map before you head out",
        "Share your route with someone before you leave",
      ],
    },
    {
      name: "Matches and Fire Starters",
      icon: FlameKindling,
      description: "Waterproof matches, lighter, and fire starter for warmth and signaling.",
      tips: [
        "Keep matches in a waterproof container",
        "Learn to build fires in various conditions",
        "Know and follow local fire regulations",
        "Always fully extinguish fires before leaving",
      ],
    },
    {
      name: "Water Bottle",
      icon: Droplets,
      description: "Water and the means to purify it.",
      tips: [
        "Carry more water than you think you'll need",
        "Bring a water purification method for longer trips",
        "Know water sources along your route",
        "Dehydration affects performance and safety",
      ],
    },
    {
      name: "Backpack",
      icon: Backpack,
      description: "A properly fitted pack to carry all your gear comfortably.",
      tips: [
        "Choose a pack sized for your trip length",
        "Adjust straps so weight rests on your hips",
        "Pack heavy items close to your back",
        "Use a rain cover to keep gear dry",
      ],
    },
  ];
</script>

<svelte:head>
  <title>Scout Essentials - Adventure Spark</title>
  <meta
    name="description"
    content="Learn about the Scout 6 Essentials and 10 Essentials for safe outdoor adventures."
  />
</svelte:head>

<div class="min-h-screen bg-stone-50">
  <!-- Hero — matches site hero style -->
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
          Be Prepared
        </span>
        <h1
          class="font-black tracking-tight leading-[0.95] mb-5"
          style="font-size: clamp(2.5rem, 6vw, 4.5rem); color: #f5f0e8;"
        >
          Scout<br />
          <span
            style="background: linear-gradient(135deg, #86efac 0%, #34d399 40%, #6ee7b7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"
          >
            Essentials
          </span>
        </h1>
        <p class="text-lg max-w-xl leading-relaxed" style="color: rgba(245,240,232,0.65);">
          The right gear can turn a close call into a great story. Know what to carry before you
          head out.
        </p>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <!-- Intro callout -->
    <div
      class="rounded-2xl p-8 mb-16 border border-emerald-100"
      style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5);"
    >
      <div class="flex gap-4 items-start">
        <div
          class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5"
        >
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-stone-900 mb-2">The Scout Motto: Be Prepared</h2>
          <p class="text-stone-600 leading-relaxed">
            Start with the <strong class="text-stone-800">6 Essentials</strong> for day hikes, then
            build up to the <strong class="text-stone-800">10 Essentials</strong> as you take on longer
            wilderness adventures. Carrying the right gear is the difference between a minor inconvenience
            and a serious emergency.
          </p>
        </div>
      </div>
    </div>

    <!-- 6 Essentials -->
    <div class="mb-20">
      <div class="flex items-end justify-between mb-10">
        <div>
          <p class="text-xs font-bold tracking-widest uppercase mb-2 text-emerald-600">Day Trips</p>
          <h2 class="text-3xl font-black text-stone-900">The 6 Essentials</h2>
        </div>
        <span
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"
        >
          Start here
        </span>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each sixEssentials as essential, i (essential.name)}
          <div
            class="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all p-6"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style="background: linear-gradient(135deg, #d1fae5, #a7f3d0);"
              >
                <svelte:component this={essential.icon} class="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p class="text-xs font-bold text-stone-400 mb-0.5">#{i + 1}</p>
                <h3 class="font-bold text-stone-900 leading-tight">{essential.name}</h3>
              </div>
            </div>

            <p class="text-sm text-stone-600 leading-relaxed mb-4">{essential.description}</p>

            <div class="pt-4 border-t border-stone-100">
              <ul class="space-y-2">
                {#each essential.tips as tip (tip)}
                  <li class="text-xs text-stone-500 flex items-start gap-2">
                    <span class="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                    {tip}
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Level up divider -->
    <div class="flex items-center gap-4 mb-20">
      <div class="flex-1 h-px bg-stone-200"></div>
      <div
        class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-bold tracking-widest uppercase"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
        Level Up
      </div>
      <div class="flex-1 h-px bg-stone-200"></div>
    </div>

    <!-- 10 Essentials -->
    <div class="mb-16">
      <div class="flex items-end justify-between mb-10">
        <div>
          <p class="text-xs font-bold tracking-widest uppercase mb-2 text-amber-600">
            Extended Trips
          </p>
          <h2 class="text-3xl font-black text-stone-900">The 10 Essentials</h2>
        </div>
        <span
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700"
        >
          Wilderness ready
        </span>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each tenEssentials as essential, i (essential.name)}
          <div
            class="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all p-6"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style="background: linear-gradient(135deg, #fef3c7, #fde68a);"
              >
                <svelte:component this={essential.icon} class="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p class="text-xs font-bold text-stone-400 mb-0.5">#{i + 1}</p>
                <h3 class="font-bold text-stone-900 leading-tight">{essential.name}</h3>
              </div>
            </div>

            <p class="text-sm text-stone-600 leading-relaxed mb-4">{essential.description}</p>

            <div class="pt-4 border-t border-stone-100">
              <ul class="space-y-2">
                {#each essential.tips as tip (tip)}
                  <li class="text-xs text-stone-500 flex items-start gap-2">
                    <span class="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                    {tip}
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Bottom CTA -->
    <div class="relative overflow-hidden rounded-2xl cta-bg p-10 text-center">
      <div class="absolute inset-0 cta-gradient"></div>
      <div class="absolute inset-0 grain-overlay pointer-events-none"></div>
      <div class="relative">
        <p
          class="text-xs font-bold tracking-widest uppercase mb-4"
          style="color: rgba(245,240,232,0.4);"
        >
          Ready?
        </p>
        <h3 class="text-2xl sm:text-3xl font-black mb-3" style="color: #f5f0e8;">
          Pack your bag. Hit the trail.
        </h3>
        <p class="mb-8 max-w-md mx-auto text-sm" style="color: rgba(245,240,232,0.5);">
          Explore hikes, campsites, and backpacking routes shared by scouts who've been there.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/hikes"
            class="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-stone-950 transition-all hover:scale-105"
            style="background: linear-gradient(135deg, #86efac, #34d399);"
          >
            Explore Trails
            <ArrowRight size={15} class="group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="/camping"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all"
            style="background: rgba(245,240,232,0.07); border: 1px solid rgba(245,240,232,0.18); color: rgba(245,240,232,0.85);"
          >
            Find Campsites
          </a>
          <a
            href="/backpacking"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all"
            style="background: rgba(251,146,60,0.12); border: 1px solid rgba(251,146,60,0.3); color: rgba(251,146,60,0.9);"
          >
            Backpacking Routes
          </a>
        </div>
      </div>
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
  .cta-bg {
    background-color: #0c0f0a;
  }
  .cta-gradient {
    background:
      radial-gradient(ellipse 80% 100% at 80% 50%, rgba(52, 211, 153, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 80% at 10% 50%, rgba(251, 146, 60, 0.1) 0%, transparent 60%),
      linear-gradient(135deg, #0a1a0d, #050a08);
  }
  .grain-overlay {
    opacity: 0.04;
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");
    background-size: 200px 200px;
  }
</style>
