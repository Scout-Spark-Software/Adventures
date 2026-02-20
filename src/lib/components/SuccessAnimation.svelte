<script lang="ts">
  import { scale, fly } from "svelte/transition";
  import { elasticOut } from "svelte/easing";
  import { onMount } from "svelte";

  export let message: string = "Success!";

  let confettiPieces: Array<{
    x: number;
    y: number;
    rotation: number;
    color: string;
    delay: number;
    size: number;
  }> = [];

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B739",
    "#52C77A",
  ];

  onMount(() => {
    // Generate random confetti pieces
    for (let i = 0; i < 50; i++) {
      confettiPieces.push({
        x: Math.random() * 100,
        y: -20 - Math.random() * 20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 200,
        size: 8 + Math.random() * 8,
      });
    }
    confettiPieces = confettiPieces;
  });
</script>

<div
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden"
>
  <!-- Confetti -->
  {#each confettiPieces as piece, i (i)}
    <div
      class="confetti"
      style="
        left: {piece.x}%;
        --delay: {piece.delay}ms;
        --rotation: {piece.rotation}deg;
        background-color: {piece.color};
        width: {piece.size}px;
        height: {piece.size}px;
      "
    ></div>
  {/each}

  <!-- Success Card -->
  <div
    in:scale={{ duration: 600, easing: elasticOut, start: 0.5 }}
    class="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4 relative z-10"
  >
    <div class="flex flex-col items-center">
      <!-- Animated Check Circle -->
      <div class="relative mb-4">
        <div
          class="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center checkmark-circle"
        >
          <svg
            class="w-12 h-12 text-white checkmark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <!-- Ripple effect -->
        <div class="ripple"></div>
        <div class="ripple ripple-2"></div>
      </div>

      <h3
        class="text-3xl font-bold text-gray-900 mb-3 success-text"
        in:fly={{ y: 20, duration: 400, delay: 300 }}
      >
        Success!
      </h3>
      <p
        class="text-gray-600 text-center mb-6 text-lg"
        in:fly={{ y: 20, duration: 400, delay: 400 }}
      >
        {message}
      </p>
      <div
        class="flex items-center text-sm text-gray-500"
        in:fly={{ y: 20, duration: 400, delay: 500 }}
      >
        <svg class="animate-spin h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>Redirecting to your submission...</span>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes fall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }

  @keyframes checkmarkPop {
    0% {
      transform: scale(0) rotate(-45deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.2) rotate(5deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes rippleEffect {
    0% {
      transform: scale(0.8);
      opacity: 0.8;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  @keyframes textGlow {
    0%,
    100% {
      text-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
    }
    50% {
      text-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
    }
  }

  .confetti {
    position: absolute;
    border-radius: 2px;
    animation: fall 3s ease-in forwards;
    animation-delay: var(--delay);
    transform: rotate(var(--rotation));
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .checkmark-circle {
    animation: pulse 2s ease-in-out infinite;
    box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
  }

  .checkmark {
    animation: checkmarkPop 0.6s ease-out 0.2s both;
  }

  .success-text {
    animation: textGlow 2s ease-in-out infinite;
  }

  .ripple {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 3px solid rgba(34, 197, 94, 0.6);
    animation: rippleEffect 1.5s ease-out infinite;
  }

  .ripple-2 {
    animation-delay: 0.75s;
  }
</style>
