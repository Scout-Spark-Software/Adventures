import { test, expect } from "./fixtures/base-test";

// GET /api/files sits in the "image" tier (ROUTE_TIERS) and 400s immediately
// on missing query params, without touching the database or R2 -- the
// cheapest possible way to exercise the tier's limit without side effects
// or needing authentication/a valid entity id.
const IMAGE_TIER_LIMIT = 20;
const IMAGE_TIER_WINDOW_SECONDS = 60;

test.describe("Anonymous — rate limiting on the image tier", () => {
  // Requires U1's RATE_LIMIT_KV binding to actually be provisioned and
  // present in the environment under test (see the plan's U1/U5 execution
  // notes) -- without it, checkRateLimit fails open and every request
  // below returns 400, never 429, which would make this test pass for the
  // wrong reason.
  test("enforces the limit, returns 429 at the boundary, and recovers after the window", async ({
    request,
  }) => {
    test.setTimeout(90_000);

    // Phase 1: happy path -- requests under the threshold all reach the
    // route handler (400, since no entity_type/entity_id were supplied --
    // never 429).
    for (let i = 0; i < IMAGE_TIER_LIMIT - 1; i++) {
      const response = await request.get("/api/files");
      expect(response.status()).not.toBe(429);
    }

    // Phase 2: boundary -- the Nth request (at the configured limit) still
    // succeeds; the N+1th is rate limited.
    const atLimit = await request.get("/api/files");
    expect(atLimit.status()).not.toBe(429);

    const overLimit = await request.get("/api/files");
    expect(overLimit.status()).toBe(429);
    expect(overLimit.headers()["retry-after"]).toBe(String(IMAGE_TIER_WINDOW_SECONDS));

    // Phase 3: recovery -- once the window elapses, a subsequent request
    // succeeds again.
    await new Promise((resolve) => setTimeout(resolve, IMAGE_TIER_WINDOW_SECONDS * 1000));

    const recovered = await request.get("/api/files");
    expect(recovered.status()).not.toBe(429);
  });
});
