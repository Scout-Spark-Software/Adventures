import { requireAdmin } from "$lib/auth/middleware";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);

  const res = await event.fetch("/api/posts?limit=200&offset=0");
  const { data: posts, total } = await res.json();

  return { posts, total };
};
