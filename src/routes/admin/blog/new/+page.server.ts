import { requireAdmin } from "$lib/auth/middleware";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);

  const res = await event.fetch("/api/series");
  const allSeries = await res.json();

  return { allSeries };
};
