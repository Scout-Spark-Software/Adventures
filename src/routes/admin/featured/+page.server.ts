import type { PageServerLoad } from "./$types";
import { requireAdmin } from "$lib/auth/middleware";

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);

  const [hikesResponse, campingSitesResponse, backpackingResponse] = await Promise.all([
    (await event.fetch("/api/hikes?status=approved")).json().then((r) => r.data),
    (await event.fetch("/api/camping-sites?status=approved")).json().then((r) => r.data),
    (await event.fetch("/api/backpacking?status=approved")).json().then((r) => r.data),
  ]);

  return {
    hikes: Array.isArray(hikesResponse) ? hikesResponse : [],
    campingSites: Array.isArray(campingSitesResponse) ? campingSitesResponse : [],
    backpackingRoutes: Array.isArray(backpackingResponse) ? backpackingResponse : [],
  };
};
