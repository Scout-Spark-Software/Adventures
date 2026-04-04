import { checkProfanity } from "./profanity-filter";

/**
 * Convert a name to a URL-safe slug.
 * e.g. "Sunset Trail (WA)" → "sunset-trail-wa"
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Returns true if the slug (or the name it was derived from) contains profanity.
 */
export function hasProfanityInSlug(slug: string): boolean {
  // Replace hyphens with spaces so the profanity matcher reads words correctly
  const readable = slug.replace(/-/g, " ");
  return checkProfanity(readable).hasProfanity;
}
