import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { error } from "@sveltejs/kit";
import { workosAuth } from "$lib/server/workos";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const res = await fetch(`/api/posts/${params.slug}`);
  if (res.status === 404) throw error(404, "Post not found");
  if (!res.ok) throw error(res.status, "Failed to load post");

  const { seriesData, ...post } = await res.json();
  const sanitizedContent = sanitizeHtml(String(await marked(post.body)), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "h4"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height"],
      "*": ["id"],
      code: ["class"],
    },
    allowedClasses: {
      code: ["language-*"],
    },
  });

  // Inject IDs into headings and build ToC
  const toc: { id: string; text: string; level: number }[] = [];
  const content = sanitizedContent.replace(/<h([2-4])>(.*?)<\/h\1>/gs, (_, lvl, inner) => {
    const plainText = inner.replace(/<[^>]+>/g, "");
    const id = plainText
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    toc.push({ id, text: plainText, level: Number(lvl) });
    return `<h${lvl} id="${id}">${inner}</h${lvl}>`;
  });

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

  return { post, content, toc, seriesData: seriesData ?? null, authorName };
};
