import type { PageServerLoad } from "./$types";
import { requireAdmin } from "$lib/auth/middleware";

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);

  const [hikesResponse, campingSitesResponse, backpackingResponse] = await Promise.all([
    event.fetch("/api/hikes?status=approved"),
    event.fetch("/api/camping-sites?status=approved"),
    event.fetch("/api/backpacking?status=approved"),
  ]);

  const hikes = hikesResponse.ok ? await hikesResponse.json() : [];
  const campingSites = campingSitesResponse.ok ? await campingSitesResponse.json() : [];
  const backpackingRoutes = backpackingResponse.ok ? await backpackingResponse.json() : [];

  return {
    hikes: Array.isArray(hikes) ? hikes : [],
    campingSites: Array.isArray(campingSites) ? campingSites : [],
    backpackingRoutes: Array.isArray(backpackingRoutes) ? backpackingRoutes : [],
  };
};
