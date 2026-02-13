<script lang="ts">
  import logo from "$lib/assets/adventures-logo.png";
  import { page } from "$app/stores";

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
              <svg
                class="w-4 h-4 text-slate-500 transition-transform {userMenuOpen
                  ? 'rotate-180'
                  : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
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
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Admin
                  </a>
                  <div class="border-t border-slate-100 my-1"></div>
                {/if}
                <a
                  href="/favorites"
                  on:click={closeUserMenu}
                  class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Favorites
                </a>
                <a
                  href="/submit"
                  on:click={closeUserMenu}
                  class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Submit
                </a>
                <a
                  href="/profile"
                  on:click={closeUserMenu}
                  class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <svg
                    class="w-4 h-4"
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
                  Profile
                </a>
                <div class="border-t border-slate-100 my-1"></div>
                <form method="POST" action="/logout">
                  <button
                    type="submit"
                    class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
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
