import type { PageServerLoad } from "./$types";
import { requireModerator } from "$lib/auth/middleware";

export const load: PageServerLoad = async (event) => {
  requireModerator(event);
  const queue = await event.fetch("/api/moderation?status=pending").then((r) => r.json());
  return { queue: queue || [] };
};
