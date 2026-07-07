import { describe, expect, it, vi } from "vitest";
import type { RequestEvent } from "@sveltejs/kit";
import { securityHandle, rateLimitHandle } from "./hooks.server";
import { SECURITY_HEADERS } from "$lib/security";
import { TIER_PERIOD_SECONDS } from "$lib/server/rate-limit";

function createFakeBinding(limit: number) {
  const counts = new Map<string, number>();
  return {
    async limit({ key }: { key: string }): Promise<{ success: boolean }> {
      const count = (counts.get(key) ?? 0) + 1;
      counts.set(key, count);
      return { success: count <= limit };
    },
  };
}

function createEvent(opts: {
  routeId: string | null;
  method?: string;
  userId?: string | null;
  binding?: ReturnType<typeof createFakeBinding>;
  bindingName?: string;
}): RequestEvent {
  return {
    route: { id: opts.routeId },
    request: { method: opts.method ?? "GET" },
    locals: { userId: opts.userId ?? null, user: null },
    getClientAddress: () => "203.0.113.5",
    platform:
      opts.binding && opts.bindingName ? { env: { [opts.bindingName]: opts.binding } } : undefined,
  } as unknown as RequestEvent;
}

describe("rateLimitHandle", () => {
  it("passes a request under the tier limit through to the route handler unchanged", async () => {
    const event = createEvent({
      routeId: "/api/hikes",
      method: "GET",
      binding: createFakeBinding(120),
      bindingName: "RATE_LIMITER_READ",
    });
    const resolve = vi.fn(async () => new Response("ok", { status: 200 }));

    const response = await rateLimitHandle({ event, resolve });

    expect(resolve).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
  });

  it("returns 429 with Retry-After once the image tier limit is exceeded, without invoking the route handler", async () => {
    const binding = createFakeBinding(20);
    const resolve = vi.fn(async () => new Response("uploaded", { status: 201 }));

    for (let i = 0; i < 20; i++) {
      const event = createEvent({
        routeId: "/api/upload",
        method: "POST",
        userId: "user-1",
        binding,
        bindingName: "RATE_LIMITER_IMAGE",
      });
      const response = await rateLimitHandle({ event, resolve });
      expect(response.status).toBe(201);
    }

    resolve.mockClear();
    const blockedEvent = createEvent({
      routeId: "/api/upload",
      method: "POST",
      userId: "user-1",
      binding,
      bindingName: "RATE_LIMITER_IMAGE",
    });
    const blockedResponse = await rateLimitHandle({ event: blockedEvent, resolve });

    expect(resolve).not.toHaveBeenCalled();
    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.headers.get("Retry-After")).toBe(String(TIER_PERIOD_SECONDS.image));
  });

  it("never rate-limits /api/cron/publish-posts regardless of request volume", async () => {
    const resolve = vi.fn(async () => new Response("ok", { status: 200 }));

    for (let i = 0; i < 50; i++) {
      const event = createEvent({ routeId: "/api/cron/publish-posts", method: "POST" });
      const response = await rateLimitHandle({ event, resolve });
      expect(response.status).toBe(200);
    }
    expect(resolve).toHaveBeenCalledTimes(50);
  });

  it("never rate-limits a non-API route", async () => {
    const resolve = vi.fn(async () => new Response("page", { status: 200 }));
    const event = createEvent({ routeId: "/hikes", method: "GET" });

    const response = await rateLimitHandle({ event, resolve });

    expect(resolve).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  it("gives two different users independent limits on /api/upload", async () => {
    const binding = createFakeBinding(20);
    const resolve = vi.fn(async () => new Response("uploaded", { status: 201 }));

    for (let i = 0; i < 20; i++) {
      const eventA = createEvent({
        routeId: "/api/upload",
        method: "POST",
        userId: "user-a",
        binding,
        bindingName: "RATE_LIMITER_IMAGE",
      });
      expect((await rateLimitHandle({ event: eventA, resolve })).status).toBe(201);
    }
    const blockedA = createEvent({
      routeId: "/api/upload",
      method: "POST",
      userId: "user-a",
      binding,
      bindingName: "RATE_LIMITER_IMAGE",
    });
    expect((await rateLimitHandle({ event: blockedA, resolve })).status).toBe(429);

    const eventB = createEvent({
      routeId: "/api/upload",
      method: "POST",
      userId: "user-b",
      binding,
      bindingName: "RATE_LIMITER_IMAGE",
    });
    expect((await rateLimitHandle({ event: eventB, resolve })).status).toBe(201);
  });
});

describe("securityHandle + rateLimitHandle sequencing", () => {
  // SvelteKit's sequence() requires its internal AsyncLocalStorage-based
  // request store, which only exists inside a real request lifecycle
  // (not a bare unit test) -- true end-to-end composition is covered by
  // the e2e suite. Here we prove the property KTD3 (rate-limit plan)
  // depends on directly: securityHandle unconditionally mutates whatever
  // `resolve` hands it, including a 429 -- which is exactly what happens
  // when rateLimitHandle (nested inside it via sequence) short-circuits.
  it("still applies SECURITY_HEADERS and no-store Cache-Control to a 429-shaped response", async () => {
    const binding = createFakeBinding(20);
    const blockedEvent = createEvent({
      routeId: "/api/upload",
      method: "POST",
      userId: "user-1",
      binding,
      bindingName: "RATE_LIMITER_IMAGE",
    });

    const resolveThatReturns429 = async () => {
      const blocked = await rateLimitHandle({
        event: blockedEvent,
        resolve: async () => new Response("uploaded", { status: 201 }),
      });
      return blocked;
    };

    for (let i = 0; i < 20; i++) {
      await rateLimitHandle({
        event: createEvent({
          routeId: "/api/upload",
          method: "POST",
          userId: "user-1",
          binding,
          bindingName: "RATE_LIMITER_IMAGE",
        }),
        resolve: async () => new Response("uploaded", { status: 201 }),
      });
    }

    const response = await securityHandle({
      event: blockedEvent,
      resolve: resolveThatReturns429,
    });

    expect(response.status).toBe(429);
    for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
      expect(response.headers.get(header)).toBe(value);
    }
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
