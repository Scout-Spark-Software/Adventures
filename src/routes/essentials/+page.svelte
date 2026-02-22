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
  } from 'lucide-svelte';
  import type { ComponentType } from 'svelte';

  const sixEssentials: { name: string; icon: ComponentType; description: string; tips: string[] }[] = [
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

  const tenEssentials: { name: string; icon: ComponentType; description: string; tips: string[] }[] = [
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

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
  <!-- Hero Section -->
  <div class="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-4xl font-bold mb-4">Scout Essentials</h1>
      <p class="text-xl text-emerald-100 max-w-3xl">
        Essential gear every scout should carry for safe and prepared outdoor adventures
      </p>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Introduction -->
    <div class="mb-12 bg-white rounded-lg shadow-md p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Be Prepared</h2>
      <p class="text-gray-700 mb-4">
        The Scout motto "Be Prepared" means being ready for any situation. Carrying the right gear
        can make the difference between a minor inconvenience and a serious emergency.
      </p>
      <p class="text-gray-700">
        There are two essential gear lists every scout should know: the <strong>6 Essentials</strong
        >
        for day trips and the <strong>10 Essentials</strong> for longer adventures. Start with the 6 Essentials
        and work your way up to the 10 Essentials as you gain experience.
      </p>
    </div>

    <!-- 6 Essentials Section -->
    <div class="mb-16">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">The 6 Essentials</h2>
        <p class="text-lg text-gray-600">Perfect for day hikes and shorter outdoor activities</p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each sixEssentials as essential (essential.name)}
          <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
            <div class="flex items-start gap-4 mb-4">
              <div
                class="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center"
              >
                <svelte:component this={essential.icon} class="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">
                  {essential.name}
                </h3>
              </div>
            </div>

            <p class="text-gray-700 mb-4">{essential.description}</p>

            <div class="border-t border-gray-200 pt-4">
              <p class="text-sm font-medium text-gray-900 mb-2">Tips:</p>
              <ul class="space-y-2">
                {#each essential.tips as tip (tip)}
                  <li class="text-sm text-gray-600 flex items-start gap-2">
                    <svg
                      class="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{tip}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- 10 Essentials Section -->
    <div class="mb-12">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">The 10 Essentials</h2>
        <p class="text-lg text-gray-600">
          Complete gear list for extended trips and wilderness adventures
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each tenEssentials as essential (essential.name)}
          <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
            <div class="flex items-start gap-4 mb-4">
              <div
                class="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
              >
                <svelte:component this={essential.icon} class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">
                  {essential.name}
                </h3>
              </div>
            </div>

            <p class="text-gray-700 mb-4">{essential.description}</p>

            <div class="border-t border-gray-200 pt-4">
              <p class="text-sm font-medium text-gray-900 mb-2">Tips:</p>
              <ul class="space-y-2">
                {#each essential.tips as tip (tip)}
                  <li class="text-sm text-gray-600 flex items-start gap-2">
                    <svg
                      class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{tip}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Bottom CTA -->
    <div
      class="bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg shadow-xl p-8 text-white text-center"
    >
      <h3 class="text-2xl font-bold mb-4">Ready for Your Next Adventure?</h3>
      <p class="text-emerald-100 mb-6 max-w-2xl mx-auto">
        Now that you know what to pack, explore trails and campsites shared by fellow scouts
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/hikes"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          Explore Trails
        </a>
        <a
          href="/camping"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Find Campsites
        </a>
      </div>
    </div>
  </div>
</div>
