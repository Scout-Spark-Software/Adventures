<script lang="ts">
  import logo from "$lib/assets/Scout-Spark-Hiking.png";

  export let user: {
    id: string;
    email: string;
    name?: string;
    isAdmin?: boolean;
  } | null;
</script>

<footer class="bg-slate-900 text-slate-300 mt-12">
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div>
        <div class="flex items-center gap-2 mb-3">
          <img src={logo} alt="Adventure Spark" class="w-8 h-8" />
          <span class="text-white font-bold">Adventure Spark</span>
        </div>
        <p class="text-sm text-slate-400">
          Navigate your next outdoor adventure with confidence
        </p>
      </div>
      <div>
        <h3 class="text-white font-semibold mb-3">Explore</h3>
        <ul class="space-y-1.5 text-sm">
          <li>
            <a href="/hikes" class="hover:text-sky-400 transition-colors"
              >Hiking Trails</a
            >
          </li>
          <li>
            <a href="/camping" class="hover:text-sky-400 transition-colors"
              >Camping Sites</a
            >
          </li>
          <li>
            <a href="/submit" class="hover:text-sky-400 transition-colors"
              >Submit Adventure</a
            >
          </li>
        </ul>
      </div>
      <div>
        <h3 class="text-white font-semibold mb-3">Account</h3>
        <ul class="space-y-1.5 text-sm">
          {#if user}
            <li>
              <a href="/profile" class="hover:text-sky-400 transition-colors"
                >Profile</a
              >
            </li>
            <li>
              <a href="/favorites" class="hover:text-sky-400 transition-colors"
                >Favorites</a
              >
            </li>
          {:else}
            <li>
              <a href="/login" class="hover:text-sky-400 transition-colors"
                >Login</a
              >
            </li>
            <li>
              <a href="/signup" class="hover:text-sky-400 transition-colors"
                >Sign Up</a
              >
            </li>
          {/if}
        </ul>
      </div>
    </div>
    <div class="border-t border-slate-800 pt-6">
      <p class="text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Adventure Spark. All rights reserved.
      </p>
    </div>
  </div>
</footer>
