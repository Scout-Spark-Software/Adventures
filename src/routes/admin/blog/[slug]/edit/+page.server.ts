import { requireAdmin } from "$lib/auth/middleware";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);

  const [postRes, seriesRes] = await Promise.all([
    event.fetch(`/api/posts/${event.params.slug}`),
    event.fetch("/api/series"),
  ]);

  if (postRes.status === 404) throw error(404, "Post not found");

  const { seriesData, ...post } = await postRes.json();
  const allSeries = await seriesRes.json();

  return { post, allSeries };
};
