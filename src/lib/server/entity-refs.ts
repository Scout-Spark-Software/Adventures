import { error } from "@sveltejs/kit";

type EntityRefs = {
  hikeId?: unknown;
  campingSiteId?: unknown;
  backpackingId?: unknown;
};

// Hikes, camping sites, and backpacking trips are referenced polymorphically
// (favorites, ratings, notes, alterations, trip completions) via three
// nullable FKs where exactly one must be set. Shared here so the two-branch
// check (missing vs. more-than-one) isn't reimplemented at every call site.
export function requireExactlyOneEntityRef(
  { hikeId, campingSiteId, backpackingId }: EntityRefs,
  messages: { missing: string; tooMany: string }
): void {
  const count = [hikeId, campingSiteId, backpackingId].filter(Boolean).length;
  if (count === 0) {
    throw error(400, messages.missing);
  }
  if (count > 1) {
    throw error(400, messages.tooMany);
  }
}
