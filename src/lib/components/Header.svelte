<script lang="ts">
  import logo from "$lib/assets/adventures-logo.png";
  import { page } from "$app/stores";
  import {
    Compass,
    Tent,
    ChevronDown,
    Settings,
    Heart,
    Plus,
    User,
    LogOut,
    MountainIcon,
  } from "lucide-svelte";

  export let user: {
    id: string;
    email: string;
    name?: string;
    role: "admin" | "moderator" | "user";
  } | null;
  $: currentPath = $page.url.pathname;

  let userMenuOpen = false;
  let userMenuEl: HTMLDivElement;

  function toggleUserMenu() {
    userMenuOpen = !userMenuOpen;
  }

  function closeUserMenu() {
    userMenuOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (userMenuEl && !userMenuEl.contains(event.target as Node)) {
      userMenuOpen = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      userMenuOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

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
            <MountainIcon size={16} class="mr-1.5" />
            Hikes
          </a>
          <a
            href="/camping"
            class="{currentPath.startsWith('/camping')
              ? 'border-sky-600 text-slate-900'
              : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'} inline-flex items-center px-4 pt-1 border-b-2 text-sm font-semibold transition-colors"
          >
            <Tent size={16} class="mr-1.5" />
            Camping Sites
          </a>
        </div>
      </div>
      <div class="flex items-center gap-2">
        {#if user}
          <div class="relative" bind:this={userMenuEl}>
            <button
              on:click={toggleUserMenu}
              class="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div
                class="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-semibold"
              >
                {(user.name?.[0] ?? user.email[0]).toUpperCase()}
              </div>
              <span class="hidden sm:inline text-slate-900"
                >{user.name ?? user.email.split("@")[0]}</span
              >
              <ChevronDown
                size={16}
                class="text-slate-500 transition-transform {userMenuOpen
                  ? 'rotate-180'
                  : ''}"
              />
            </button>
            {#if userMenuOpen}
              <div
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black/5 py-1 z-50"
              >
                {#if user.role === "admin"}
                  <a
                    href="/admin"
                    on:click={closeUserMenu}
                    class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-slate-50"
                  >
                    <Settings size={16} />
                    Admin
                  </a>
                  <div class="border-t border-slate-100 my-1"></div>
                {/if}
                <a
                  href="/favorites"
                  on:click={closeUserMenu}
                  class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Heart size={16} />
                  Favorites
                </a>
                <a
                  href="/submit"
                  on:click={closeUserMenu}
                  class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Plus size={16} />
                  Submit
                </a>
                <a
                  href="/profile"
                  on:click={closeUserMenu}
                  class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <User size={16} />
                  Profile
                </a>
                <div class="border-t border-slate-100 my-1"></div>
                <form method="POST" action="/logout">
                  <button
                    type="submit"
                    class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </form>
              </div>
            {/if}
          </div>
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
