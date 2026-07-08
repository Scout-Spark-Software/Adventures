import type { RequestEvent } from "@sveltejs/kit";

/**
 * Shape of Cloudflare's native Rate Limiting binding (`env.RATE_LIMITER_*`).
 * Declared locally rather than relying on the ambient `RateLimit` global
 * `wrangler types` emits in worker-configuration.d.ts -- that generated
 * file also emits a `GlobalProps.mainModule` clause that `typeof import()`s
 * the built worker bundle, which drags .svelte-kit build output into the
 * TypeScript program if the file is added to tsconfig's `include`. A
 * minimal local interface avoids that entirely.
 */
interface RateLimiterBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export type Tier = "image" | "write" | "read" | "privileged" | "exempt";

type ConfiguredTier = Exclude<Tier, "exempt">;

/**
 * Identity resolution per tier (ip vs. user) -- the native Rate Limiting
 * binding has no concept of this, so it stays a small code-side map.
 * `limit`/`period` themselves live entirely in wrangler.jsonc's `ratelimits`
 * config now (see TIER_BINDING_NAME below for how a tier maps to its binding).
 */
export const TIER_KEY_BY: Record<ConfiguredTier, "ip" | "user"> = {
  image: "user",
  write: "user",
  read: "ip",
  privileged: "user",
};

/**
 * Mirrors wrangler.jsonc's `ratelimits[].simple.period` values (currently
 * 60 for every tier) -- used only to set the `Retry-After` header in
 * hooks.server.ts, since the native binding's `.limit()` response carries
 * no period/retry-after value of its own.
 */
export const TIER_PERIOD_SECONDS: Record<ConfiguredTier, number> = {
  image: 60,
  write: 60,
  read: 60,
  privileged: 60,
};

/**
 * One binding per tier (limit/period are fixed per-binding at deploy time
 * on the native Rate Limiting binding, not parameterized at runtime), so
 * resolving a tier to its binding requires a fixed name -> property lookup,
 * not dynamic tier-string indexing.
 */
const TIER_BINDING_NAME: Record<ConfiguredTier, string> = {
  image: "RATE_LIMITER_IMAGE",
  write: "RATE_LIMITER_WRITE",
  read: "RATE_LIMITER_READ",
  privileged: "RATE_LIMITER_PRIVILEGED",
};

/**
 * The strictest tier among the non-image tiers, used as the fallback
 * for any route/method that isn't explicitly classified below -- an
 * unclassified route fails safe (tightly limited) rather than silently
 * having no limit at all (R4).
 */
const DEFAULT_TIER: Tier = "write";

/**
 * Route-tier table, keyed two ways (see KTD4 in the plan):
 *  - "METHOD /route/id" for routes whose file exports multiple HTTP
 *    methods that need different tiers (e.g. GET is public-read,
 *    POST is an authenticated write, on the same +server.ts file).
 *  - "/route/id" alone for routes where every exported method shares
 *    one tier (e.g. /api/upload is POST-only; /api/files is entirely
 *    file/image related across all its methods).
 *
 * resolveTier() checks the method-specific key first, then falls back
 * to the whole-route key, then to DEFAULT_TIER.
 */
export const ROUTE_TIERS: Record<string, Tier> = {
  // --- image tier: whole route, every method is file/image related ---
  "/api/upload": "image",
  "/api/posts/cover": "image",
  "/api/files": "image",
  "/api/files/[id]": "image",
  "/api/files/[id]/flag": "image",
  "/api/admin/image-flags": "image",

  // --- exempt: secret-gated or dev-only, no user/IP-based limiting ---
  "/api/cron/publish-posts": "exempt",
  "/api/auth/test-session": "exempt",

  // --- read tier: whole route, entirely public GET ---
  "/api/councils": "read",
  "/api/stats": "read",

  // --- write tier: whole route, entirely authenticated ---
  "/api/favorites": "write",
  "/api/favorites/[id]": "write",
  "/api/notes": "write",
  "/api/notes/[id]": "write",
  "/api/profile": "write",
  // GET but always authenticated (returns the caller's own rating) --
  // there is no dedicated "authenticated read" tier, so this fits the
  // user-keyed "write" bucket better than the IP-keyed "read" bucket.
  "/api/ratings/my-rating": "write",
  "/api/alterations/[id]": "write",

  // --- privileged tier: whole route, admin/moderator-only ---
  "/api/moderation": "privileged",
  "/api/users/[id]/role": "privileged",
  "/api/hikes/[id]/featured": "privileged",
  "/api/camping-sites/[id]/featured": "privileged",
  "/api/backpacking/[id]/featured": "privileged",

  // --- method-specific: public GET + authenticated write, same file ---
  "GET /api/hikes": "read",
  "POST /api/hikes": "write",
  "GET /api/hikes/[id]": "read",
  "PUT /api/hikes/[id]": "write",
  "DELETE /api/hikes/[id]": "write",

  "GET /api/camping-sites": "read",
  "POST /api/camping-sites": "write",
  "GET /api/camping-sites/[id]": "read",
  "PUT /api/camping-sites/[id]": "write",
  "DELETE /api/camping-sites/[id]": "write",

  "GET /api/backpacking": "read",
  "POST /api/backpacking": "write",
  "GET /api/backpacking/[id]": "read",
  "PUT /api/backpacking/[id]": "write",
  "DELETE /api/backpacking/[id]": "write",

  "GET /api/ratings": "read",
  "POST /api/ratings": "write",
  "DELETE /api/ratings": "write",

  "GET /api/alterations": "read",
  "POST /api/alterations": "write",

  // --- method-specific: public GET + admin-only write, same file ---
  "GET /api/posts": "read",
  "POST /api/posts": "privileged",
  "GET /api/posts/[slug]": "read",
  "PUT /api/posts/[slug]": "privileged",
  "DELETE /api/posts/[slug]": "privileged",

  "GET /api/series": "read",
  "POST /api/series": "privileged",
  "GET /api/series/[slug]": "read",
  "PUT /api/series/[slug]": "privileged",
  "DELETE /api/series/[slug]": "privileged",

  "GET /api/amenity-types": "read",
  "POST /api/amenity-types": "privileged",
  "GET /api/amenity-types/[id]": "read",
  "PUT /api/amenity-types/[id]": "privileged",
  "DELETE /api/amenity-types/[id]": "privileged",

  "GET /api/facility-types": "read",
  "POST /api/facility-types": "privileged",
  "GET /api/facility-types/[id]": "read",
  "PUT /api/facility-types/[id]": "privileged",
  "DELETE /api/facility-types/[id]": "privileged",

  "GET /api/feature-types": "read",
  "POST /api/feature-types": "privileged",
  "GET /api/feature-types/[id]": "read",
  "PUT /api/feature-types/[id]": "privileged",
  "DELETE /api/feature-types/[id]": "privileged",

  "GET /api/trail-types": "read",
  "POST /api/trail-types": "privileged",
};

export function resolveTier(routeId: string | null, method: string): Tier {
  if (!routeId) return DEFAULT_TIER;
  const methodKey = `${method} ${routeId}`;
  if (ROUTE_TIERS[methodKey]) return ROUTE_TIERS[methodKey];
  if (ROUTE_TIERS[routeId]) return ROUTE_TIERS[routeId];
  return DEFAULT_TIER;
}

interface RateLimitResult {
  allowed: boolean;
}

function resolveIdentity(event: RequestEvent, keyBy: "ip" | "user"): string {
  if (keyBy === "user") {
    return event.locals.userId ?? event.getClientAddress();
  }
  return event.getClientAddress();
}

/**
 * Checks the rate-limit counter for the given tier via the native Rate
 * Limiting binding. Fails open -- returns { allowed: true } -- whenever
 * the tier's binding is unavailable (local dev, unit tests) or the
 * `.limit()` call throws, logging a `rate_limit_fail_open` warning so an
 * extended outage is observable rather than silent. Rate limiting is
 * additive risk reduction, not a new single point of failure for the
 * whole API.
 */
export async function checkRateLimit(event: RequestEvent, tier: Tier): Promise<RateLimitResult> {
  if (tier === "exempt") {
    return { allowed: true };
  }

  const bindingName = TIER_BINDING_NAME[tier];
  const env = event.platform?.env as Record<string, RateLimiterBinding | undefined> | undefined;
  const binding = env?.[bindingName];

  if (!binding) {
    console.warn("rate_limit_fail_open", { tier, reason: `${bindingName} binding unavailable` });
    return { allowed: true };
  }

  const identity = resolveIdentity(event, TIER_KEY_BY[tier]);
  const key = `${tier}:${identity}`;

  try {
    const result = await binding.limit({ key });
    return { allowed: result.success };
  } catch (error) {
    console.warn("rate_limit_fail_open", { tier, reason: `${bindingName} call threw`, error });
    return { allowed: true };
  }
}
