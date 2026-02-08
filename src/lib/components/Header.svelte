<script lang="ts">
  import logo from "$lib/assets/Scout-Spark-Hiking.png";
  import { page } from "$app/stores";

  export let user: {
    id: string;
    email: string;
    name?: string;
    role: "admin" | "moderator" | "user";
  } | null;
  $: currentPath = $page.url.pathname;
</script>

<nav class="bg-white shadow-md sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex">
        <div class="flex-shrink-0 flex items-center">
          <a href="/" class="flex items-center gap-2 group">
            <img
              src={logo}
              alt="Adventure Spark Logo"
              class="w-10 h-10 transition-transform group-hover:rotate-12"
            />
            <div class="hidden sm:block">
              <div class="text-lg font-bold text-slate-900 leading-tight">
                Adventure Spark
              </div>
            </div>
          </a>
        </div>
        <div class="hidden md:ml-8 md:flex md:space-x-1">
          <a
            href="/hikes"
            class="{currentPath.startsWith('/hikes')
              ? 'border-sky-600 text-slate-900'
              : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'} inline-flex items-center px-4 pt-1 border-b-2 text-sm font-semibold transition-colors"
          >
            <svg
              class="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Hikes
          </a>
          <a
            href="/camping"
            class="{currentPath.startsWith('/camping')
              ? 'border-sky-600 text-slate-900'
              : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'} inline-flex items-center px-4 pt-1 border-b-2 text-sm font-semibold transition-colors"
          >
            <svg
              class="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 21h18M4 18h16l-8-14-8 14z"
              />
            </svg>
            Camping Sites
          </a>
        </div>
      </div>
      <div class="flex items-center gap-2">
        {#if user}
          {#if user.role === "admin"}
            <a
              href="/admin"
              class="text-sky-700 hover:text-sky-800 px-3 py-2 rounded-md text-sm font-semibold transition-colors"
            >
              Admin
            </a>
          {/if}
          <a
            href="/favorites"
            class="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Favorites
          </a>
          <a
            href="/submit"
            class="hidden sm:inline-flex text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Submit
          </a>
          <a
            href="/profile"
            class="bg-slate-100 text-slate-900 hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Profile
          </a>
        {:else}
          <a
            href="/login"
            class="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Login
          </a>
          <a
            href="/signup"
            class="bg-sky-600 text-white hover:bg-sky-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md"
          >
            Sign Up
          </a>
        {/if}
      </div>
    </div>
  </div>
</nav>
