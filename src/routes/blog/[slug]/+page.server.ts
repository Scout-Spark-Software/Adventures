import { marked } from "marked";
import { error } from "@sveltejs/kit";
import { workosAuth } from "$lib/server/workos";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const res = await fetch(`/api/posts/${params.slug}`);
  if (res.status === 404) throw error(404, "Post not found");
  if (!res.ok) throw error(res.status, "Failed to load post");

  const { seriesData, ...post } = await res.json();
  const content = await marked(post.body);

  let authorName: string | null = null;
  try {
    const user = await workosAuth.getUser(post.authorId);
    const first = user.firstName ?? "";
    const last = user.lastName ?? "";
    if (first || last) {
      authorName = last ? `${first} ${last.charAt(0).toUpperCase()}.` : first;
    }
  } catch {
    // WorkOS lookup failed — omit gracefully
  }

  return { post, content, seriesData: seriesData ?? null, authorName };
};
