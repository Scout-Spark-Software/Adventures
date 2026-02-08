<script lang="ts">
  const sixEssentials = [
    {
      name: "Water",
      icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      description:
        "At least 1 liter per person. Bring more in hot weather or for longer trips.",
      tips: [
        "Consider water purification tablets or filters for extended trips",
        "Know where water sources are along your route",
        "Drink regularly, don't wait until you're thirsty",
      ],
    },
    {
      name: "First Aid Kit",
      icon: "M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z",
      description:
        "Essential supplies for treating minor injuries and emergencies.",
      tips: [
        "Include bandages, gauze, medical tape, and antiseptic wipes",
        "Add any personal medications",
        "Know how to use everything in your kit",
        "Check expiration dates regularly",
      ],
    },
    {
      name: "Flashlight",
      icon: "M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z",
      description: "Headlamp or flashlight with extra batteries.",
      tips: [
        "LED lights are energy-efficient and bright",
        "Bring backup batteries in a waterproof bag",
        "A headlamp keeps your hands free",
        "Red light mode preserves night vision",
      ],
    },
    {
      name: "Trail Food",
      icon: "M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z",
      description:
        "High-energy snacks and meals appropriate for your trip length.",
      tips: [
        "Pack more than you think you'll need",
        "Choose non-perishable, easy-to-eat foods",
        "Trail mix, energy bars, jerky, and dried fruit work well",
        "Consider food allergies in your group",
      ],
    },
    {
      name: "Rain Gear",
      icon: "M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 11c-.55 0-1-.45-1-1V8c0-2.21-1.79-4-4-4-.47 0-.91.1-1.33.24C14.24 5.28 13.18 6 12 6s-2.24-.72-2.67-1.76C8.91 4.1 8.47 4 8 4 5.79 4 4 5.79 4 8v4c0 .55-.45 1-1 1s-1-.45-1-1V8c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7.44-.44.96-.7 1.2-.7.24 0 .76.26 1.2.7.83-.45 1.79-.7 2.8-.7 3.31 0 6 2.69 6 6v4c0 .55-.45 1-1 1zm-5 8c0 .55-.45 1-1 1h-2v-3h-2v3H9c-.55 0-1-.45-1-1v-5c0-2.21 1.79-4 4-4s4 1.79 4 4v5z",
      description: "Waterproof jacket and pants to stay dry in wet conditions.",
      tips: [
        "Pack rain gear even if the forecast is clear",
        "Avoid cotton - it stays wet and cold",
        "Layer with breathable materials",
        "Keep rain gear accessible, not buried in your pack",
      ],
    },
    {
      name: "Sun Protection",
      icon: "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z",
      description: "Sunscreen, sunglasses, and hat to protect from UV rays.",
      tips: [
        "Use SPF 30+ broad-spectrum sunscreen",
        "Reapply sunscreen every 2 hours",
        "A wide-brimmed hat protects face and neck",
        "UV protection is important even on cloudy days",
      ],
    },
  ];

  const tenEssentials = [
    {
      name: "Navigation",
      icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      description: "Map, compass, GPS device, and the knowledge to use them.",
      tips: [
        "Always bring a paper map and compass as backup",
        "Download offline maps to your phone",
        "Know how to read topographic maps",
        "Share your route with someone before you leave",
      ],
    },
    {
      name: "Sun Protection",
      icon: "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z",
      description: "Sunscreen, sunglasses, and protective clothing.",
      tips: [
        "Use SPF 30+ broad-spectrum sunscreen",
        "Wear UV-protective sunglasses",
        "Consider long sleeves and pants for extended exposure",
        "Protect lips with SPF lip balm",
      ],
    },
    {
      name: "Insulation",
      icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
      description: "Extra layers to keep warm in changing conditions.",
      tips: [
        "Pack layers for warmth even in summer",
        "Avoid cotton - choose wool or synthetics",
        "Bring a warm hat and gloves",
        "Weather can change quickly in the outdoors",
      ],
    },
    {
      name: "Illumination",
      icon: "M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z",
      description: "Headlamp or flashlight with extra batteries.",
      tips: [
        "Bring at least one backup light source",
        "Pack extra batteries in waterproof container",
        "Test your light before each trip",
        "Headlamps are preferred for hands-free operation",
      ],
    },
    {
      name: "First Aid Supplies",
      icon: "M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z",
      description: "Comprehensive kit for treating injuries and emergencies.",
      tips: [
        "Include bandages, gauze, tape, and antiseptic",
        "Add blister treatment supplies",
        "Bring any personal medications",
        "Take a first aid and CPR course",
      ],
    },
    {
      name: "Fire",
      icon: "M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z",
      description: "Waterproof matches, lighter, and fire starter.",
      tips: [
        "Keep matches in waterproof container",
        "Learn to build fires in various conditions",
        "Know and follow local fire regulations",
        "Always fully extinguish fires before leaving",
      ],
    },
    {
      name: "Repair Kit and Tools",
      icon: "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z",
      description: "Multi-tool, duct tape, and gear repair supplies.",
      tips: [
        "Duct tape can fix almost anything temporarily",
        "Include zip ties and safety pins",
        "Know basic repair techniques",
        "A multi-tool is invaluable in the backcountry",
      ],
    },
    {
      name: "Nutrition",
      icon: "M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z",
      description: "Extra food beyond what you plan to eat.",
      tips: [
        "Pack at least one extra day's worth of food",
        "Choose high-calorie, non-perishable items",
        "Don't forget to eat regularly while active",
        "Store food properly to protect from wildlife",
      ],
    },
    {
      name: "Hydration",
      icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      description: "Water and the means to purify it.",
      tips: [
        "Carry more water than you think you'll need",
        "Bring water purification method for longer trips",
        "Know water sources along your route",
        "Dehydration affects performance and safety",
      ],
    },
    {
      name: "Emergency Shelter",
      icon: "M12 3L2 12h3v8h14v-8h3L12 3zm0 2.69l6 5.4V18h-2v-6H8v6H6v-6.91l6-5.4zM10 18v-4h4v4h-4z",
      description: "Tent, tarp, bivy, or emergency blanket.",
      tips: [
        "Even on day hikes, carry emergency shelter",
        "Space blankets are lightweight and compact",
        "Know how to build an emergency shelter",
        "Protection from elements can be life-saving",
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
        Essential gear every scout should carry for safe and prepared outdoor
        adventures
      </p>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Introduction -->
    <div class="mb-12 bg-white rounded-lg shadow-md p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Be Prepared</h2>
      <p class="text-gray-700 mb-4">
        The Scout motto "Be Prepared" means being ready for any situation.
        Carrying the right gear can make the difference between a minor
        inconvenience and a serious emergency.
      </p>
      <p class="text-gray-700">
        There are two essential gear lists every scout should know: the <strong
          >6 Essentials</strong
        >
        for day trips and the <strong>10 Essentials</strong> for longer adventures.
        Start with the 6 Essentials and work your way up to the 10 Essentials as you
        gain experience.
      </p>
    </div>

    <!-- 6 Essentials Section -->
    <div class="mb-16">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">The 6 Essentials</h2>
        <p class="text-lg text-gray-600">
          Perfect for day hikes and shorter outdoor activities
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each sixEssentials as essential}
          <div
            class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6"
          >
            <div class="flex items-start gap-4 mb-4">
              <div
                class="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d={essential.icon} />
                </svg>
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
                {#each essential.tips as tip}
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
        {#each tenEssentials as essential}
          <div
            class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6"
          >
            <div class="flex items-start gap-4 mb-4">
              <div
                class="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d={essential.icon} />
                </svg>
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
                {#each essential.tips as tip}
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
        Now that you know what to pack, explore trails and campsites shared by
        fellow scouts
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/hikes"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
