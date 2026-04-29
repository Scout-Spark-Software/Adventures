<script lang="ts">
  import navLogo from "$lib/assets/Adventure_Spark_Nav_Image.webp";
  import { page } from "$app/stores";
  import {
    Tent,
    ChevronDown,
    Settings,
    Heart,
    Plus,
    User,
    LogOut,
    MountainIcon,
    Backpack,
    BookOpen,
    Menu,
    X,
  } from "lucide-svelte";

  export let user: {
    id: string;
    email: string;
    name?: string;
    role: "admin" | "member";
  } | null;
  $: currentPath = $page.url.pathname;
  $: isHome = currentPath === "/";
  // Pages with a dark full-bleed banner — nav should be glass on these
  $: isDark =
    isHome ||
    currentPath === "/favorites" ||
    currentPath === "/profile" ||
    currentPath === "/essentials" ||
    currentPath === "/login" ||
    currentPath === "/signup" ||
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    currentPath.startsWith("/admin");

  let scrolled = false;
  function onScroll() {
    scrolled = window.scrollY > 20;
  }

  let userMenuOpen = false;
  let userMenuEl: HTMLDivElement;
  let mobileMenuOpen = false;

  function toggleUserMenu() {
    userMenuOpen = !userMenuOpen;
  }

  function closeUserMenu() {
    userMenuOpen = false;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (userMenuEl && !userMenuEl.contains(event.target as Node)) {
      userMenuOpen = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      userMenuOpen = false;
      mobileMenuOpen = false;
    }
  }

  const navLinks = [
    { href: "/hikes", label: "Hikes", icon: MountainIcon, activeColor: "emerald" },
    { href: "/camping", label: "Camping Sites", icon: Tent, activeColor: "blue" },
    { href: "/backpacking", label: "Backpacking", icon: Backpack, activeColor: "amber" },
    { href: "/blog", label: "Blog", icon: BookOpen, activeColor: "indigo" },
  ];

  const activeColors: Record<
    string,
    { desktopLight: string; desktopDark: string; mobileLight: string; mobileDark: string }
  > = {
    emerald: {
      desktopLight: "border-emerald-500 text-emerald-600",
      desktopDark: "border-emerald-400 text-emerald-300",
      mobileLight: "bg-emerald-50 text-emerald-700",
      mobileDark: "bg-emerald-500/15 text-emerald-300",
    },
    blue: {
      desktopLight: "border-blue-500 text-blue-600",
      desktopDark: "border-blue-400 text-blue-300",
      mobileLight: "bg-blue-50 text-blue-700",
      mobileDark: "bg-blue-500/15 text-blue-300",
    },
    amber: {
      desktopLight: "border-amber-500 text-amber-600",
      desktopDark: "border-amber-400 text-amber-300",
      mobileLight: "bg-amber-50 text-amber-700",
      mobileDark: "bg-amber-500/15 text-amber-300",
    },
    indigo: {
      desktopLight: "border-indigo-500 text-indigo-600",
      desktopDark: "border-indigo-400 text-indigo-300",
      mobileLight: "bg-indigo-50 text-indigo-700",
      mobileDark: "bg-indigo-500/15 text-indigo-300",
    },
  };
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} on:scroll={onScroll} />

<nav
  class="sticky top-0 z-50 border-b transition-all duration-300
  {isDark
    ? scrolled
      ? 'bg-stone-950/90 border-white/10 backdrop-blur-md shadow-lg'
      : 'bg-transparent border-transparent'
    : 'bg-white/95 border-slate-200/80 backdrop-blur-md shadow-sm'}"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <!-- Left: logo + desktop nav links -->
      <div class="flex">
        <div class="flex-shrink-0 flex items-center">
          <a href="/" class="flex items-center gap-2 group">
            <img src={navLogo} alt="Adventure Spark Logo" class="w-18 h-16" />
            <div class="hidden md:block">
              <div
                class="text-lg font-bold leading-tight {isDark
                  ? 'text-stone-100'
                  : 'text-slate-900'}"
              >
                Adventure Spark
              </div>
            </div>
          </a>
        </div>
        <!-- Desktop nav links (md+) -->
        <div class="hidden md:ml-8 md:flex md:space-x-1">
          {#each navLinks as link}
            {@const isActive = currentPath.startsWith(link.href)}
            {@const colors = activeColors[link.activeColor]}
            <a
              href={link.href}
              class="{isActive
                ? isDark
                  ? colors.desktopDark
                  : colors.desktopLight
                : isDark
                  ? 'border-transparent text-stone-200 hover:border-stone-400 hover:text-white'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'} inline-flex items-center px-4 pt-1 border-b-2 text-sm font-semibold transition-colors"
            >
              <svelte:component this={link.icon} size={16} class="mr-1.5" />
              {link.label}
            </a>
          {/each}
        </div>
      </div>

      <!-- Right: user menu + hamburger -->
      <div class="flex items-center gap-2">
        {#if user}
          <div class="relative" bind:this={userMenuEl}>
            <button
              on:click={toggleUserMenu}
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors {isDark
                ? 'bg-white/10 hover:bg-white/20 text-stone-100'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div
                class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold"
              >
                {(user.name?.[0] ?? user.email[0]).toUpperCase()}
              </div>
              <span class="hidden sm:inline">{user.name ?? user.email.split("@")[0]}</span>
              <ChevronDown
                size={16}
                class="{isDark
                  ? 'text-stone-400'
                  : 'text-slate-500'} transition-transform {userMenuOpen ? 'rotate-180' : ''}"
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
            class="{isDark
              ? 'text-stone-300 hover:text-stone-100'
              : 'text-slate-600 hover:text-slate-900'} px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Login
          </a>
          <a
            href="/signup"
            class="{isDark
              ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'} px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-sm"
          >
            Sign Up
          </a>
        {/if}

        <!-- Hamburger button (mobile only, below md) -->
        <button
          class="md:hidden p-2 rounded-lg transition-colors {isDark
            ? 'text-stone-200 hover:bg-white/10'
            : 'text-slate-600 hover:bg-slate-100'}"
          on:click|stopPropagation={() => (mobileMenuOpen = !mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {#if mobileMenuOpen}
            <X size={22} />
          {:else}
            <Menu size={22} />
          {/if}
        </button>
      </div>
    </div>
  </div>
</nav>

<!-- Mobile menu drawer -->
{#if mobileMenuOpen}
  <!-- Backdrop -->
  <div
    class="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
    on:click={closeMobileMenu}
    role="button"
    tabindex="-1"
    aria-label="Close navigation menu"
    on:keydown={(e) => e.key === "Escape" && closeMobileMenu()}
  ></div>

  <!-- Drawer panel -->
  <div
    class="md:hidden fixed top-16 left-0 right-0 z-40 shadow-xl border-b
    {isDark ? 'bg-stone-950/97 border-white/10' : 'bg-white border-slate-200'}"
  >
    <div class="max-w-7xl mx-auto px-4 py-3 space-y-1">
      {#each navLinks as link}
        {@const isActive = currentPath.startsWith(link.href)}
        {@const colors = activeColors[link.activeColor]}
        <a
          href={link.href}
          on:click={closeMobileMenu}
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors
          {isActive
            ? isDark
              ? colors.mobileDark
              : colors.mobileLight
            : isDark
              ? 'text-stone-300 hover:bg-white/5 hover:text-white'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
        >
          <svelte:component this={link.icon} size={18} />
          {link.label}
        </a>
      {/each}
    </div>
  </div>
{/if}
