import { test, expect } from "./fixtures/base-test";

// GET /api/files sits in the "image" tier (ROUTE_TIERS) and 400s immediately
// on missing query params, without touching the database or R2 -- the
// cheapest possible way to exercise the tier's limit without side effects
// or needing authentication/a valid entity id.
const IMAGE_TIER_LIMIT = 20;
const IMAGE_TIER_WINDOW_SECONDS = 60;

// Cloudflare's native Rate Limiting binding (env.RATE_LIMITER_IMAGE) is
// eventually consistent, not an exact counter: requests get load-balanced
// across multiple backing machines at the edge, each keeping its own local
// count, so there's no guaranteed exact boundary where request N+1 is the
// first 429. Empirically this took ~76 requests to trip a 20/60s limit on
// preview and ~64 on production during manual verification -- so this test
// sends generous headroom and asserts a 429 shows up *eventually*, not at
// a precise request count.
const REQUEST_BUDGET = IMAGE_TIER_LIMIT * 5;

test.describe("Anonymous — rate limiting on the image tier", () => {
  // Requires the RATE_LIMITER_IMAGE binding to actually be provisioned and
  // present in the environment under test -- without it (e.g. local `npm
  // run dev`, which has no Cloudflare bindings), checkRateLimit fails open
  // and every request below returns 400, never 429, so the budget is
  // exhausted and the assertion below fails with a clear message instead
  // of silently passing for the wrong reason.
  test("eventually enforces the limit and recovers after the window", async ({ request }) => {
    test.setTimeout(150_000);

    let limitedResponse: Awaited<ReturnType<typeof request.get>> | null = null;
    for (let i = 0; i < REQUEST_BUDGET; i++) {
      const response = await request.get("/api/files");
      if (response.status() === 429) {
        limitedResponse = response;
        break;
      }
      // Requests under the limit reach the route handler -- 400, since no
      // entity_type/entity_id were supplied -- never anything else.
      expect(response.status()).toBe(400);
    }

    expect(limitedResponse, `expected a 429 within ${REQUEST_BUDGET} requests`).not.toBeNull();
    expect(limitedResponse!.headers()["retry-after"]).toBe(String(IMAGE_TIER_WINDOW_SECONDS));

    // Recovery -- once the window elapses, requests succeed again. Retry a
    // few times since the machine serving this request post-wait isn't
    // guaranteed to be the one that was limited.
    await new Promise((resolve) => setTimeout(resolve, IMAGE_TIER_WINDOW_SECONDS * 1000));

    let recovered = false;
    for (let i = 0; i < 5; i++) {
      const response = await request.get("/api/files");
      if (response.status() !== 429) {
        recovered = true;
        break;
      }
    }
    expect(recovered, "expected requests to succeed again after the rate-limit window").toBe(true);
  });
});
