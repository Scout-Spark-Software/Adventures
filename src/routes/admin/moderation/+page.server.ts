import type { PageServerLoad } from "./$types";
import { requireModerator } from "$lib/auth/middleware";

export const load: PageServerLoad = async (event) => {
  requireModerator(event);
  const res = await event.fetch("/api/moderation?status=pending");
  const queue = res.ok ? await res.json() : [];
  return { queue };
};
