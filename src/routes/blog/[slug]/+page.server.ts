import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { error } from "@sveltejs/kit";
import { workosAuth } from "$lib/server/workos";
import { headingId } from "$lib/utils/slugify";
import type { PageServerLoad } from "./$types";

interface Block {
  type: string;
  data: Record<string, unknown>;
}

const INLINE_ALLOWLIST: sanitizeHtml.IOptions = {
  allowedTags: ["b", "strong", "i", "em", "u", "s", "del", "a", "code", "mark", "span", "br"],
  allowedAttributes: { a: ["href", "target", "rel"], span: ["class"], code: [] },
};

function sanitizeBlockText(html: string): string {
  return sanitizeHtml(html, INLINE_ALLOWLIST);
}

function sanitizeBlock(block: Block): Block {
  const { type, data } = block;
  if (type === "paragraph" || type === "quote") {
    return { type, data: { ...data, text: sanitizeBlockText(String(data.text ?? "")) } };
  }
  if (type === "header") {
    return { type, data: { ...data, text: sanitizeBlockText(String(data.text ?? "")) } };
  }
  if (type === "list" && Array.isArray(data.items)) {
    const sanitizeItem = (item: unknown): unknown => {
      if (typeof item === "string") return sanitizeBlockText(item);
      if (item && typeof item === "object") {
        const it = item as Record<string, unknown>;
        return {
          ...it,
          content: sanitizeBlockText(String(it.content ?? "")),
          items: Array.isArray(it.items) ? it.items.map(sanitizeItem) : it.items,
        };
      }
      return item;
    };
    return { type, data: { ...data, items: data.items.map(sanitizeItem) } };
  }
  return block;
}

export const load: PageServerLoad = async ({ params, fetch }) => {
  const res = await fetch(`/api/posts/${params.slug}`);
  if (res.status === 404) throw error(404, "Post not found");
  if (!res.ok) throw error(res.status, "Failed to load post");

  const { seriesData, ...post } = await res.json();

  let blocks: Block[] = [];
  let content: string | null = null;
  const toc: { id: string; text: string; level: number }[] = [];

  // Prefer the structured blocks column; fall back to legacy body
  const rawBlocks = post.blocks
    ? (post.blocks as { blocks?: Block[] }).blocks ?? []
    : null;

  if (Array.isArray(rawBlocks) && rawBlocks.length > 0) {
    blocks = rawBlocks.map(sanitizeBlock);
    for (const block of blocks) {
      if (block.type === "header") {
        const text = String(block.data.text ?? "");
        const level = Number(block.data.level) || 2;
        if (level >= 1 && level <= 4) {
          toc.push({ id: headingId(text), text: text.replace(/<[^>]+>/g, ""), level });
        }
      }
    }
  } else if (post.body) {
    try {
      const parsed = JSON.parse(post.body);
      blocks = (parsed.blocks ?? []).map(sanitizeBlock);
      for (const block of blocks) {
        if (block.type === "header") {
          const text = String(block.data.text ?? "");
          const level = Number(block.data.level) || 2;
          if (level >= 1 && level <= 4) {
            toc.push({ id: headingId(text), text: text.replace(/<[^>]+>/g, ""), level });
          }
        }
      }
    } catch {
      // legacy markdown body — fall back to rendered HTML
      const sanitized = sanitizeHtml(String(await marked(post.body)), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "h4"]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ["src", "alt", "title", "width", "height"],
          "*": ["id"],
          code: ["class"],
        },
        allowedClasses: { code: ["language-*"] },
      });

      content = sanitized.replace(/<h([2-4])>(.*?)<\/h\1>/gs, (_, lvl, inner) => {
        const plainText = inner.replace(/<[^>]+>/g, "");
        const id = headingId(plainText);
        toc.push({ id, text: plainText, level: Number(lvl) });
        return `<h${lvl} id="${id}">${inner}</h${lvl}>`;
      });
    }
  }

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

  return { post, blocks, content, toc, seriesData: seriesData ?? null, authorName };
};
