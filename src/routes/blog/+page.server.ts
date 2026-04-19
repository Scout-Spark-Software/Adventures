import { isPrivilegedUser } from "$lib/auth/helpers";
import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
  const isAdmin = isPrivilegedUser(locals.user);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const offset = (page - 1) * PAGE_SIZE;

  const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
  if (isAdmin) params.set("include_drafts", "true");

  const res = await fetch(`/api/posts?${params}`);
  const { data: posts, total } = await res.json();

  return { posts, total, page, pageSize: PAGE_SIZE, isAdmin };
};
