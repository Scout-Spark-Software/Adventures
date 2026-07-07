import { describe, expect, it } from "vitest";
import type { RequestEvent } from "@sveltejs/kit";
import { ROUTE_TIERS, checkRateLimit, resolveTier, type Tier } from "./rate-limit";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

function routeIdFromGlobKey(key: string): string {
  return key.replace(/^\/src\/routes/, "").replace(/\/\+server\.ts$/, "");
}

interface FakeBindingOptions {
  throwOnLimit?: boolean;
  denyAfter?: number;
}

function createFakeBinding(options: FakeBindingOptions = {}) {
  const counts = new Map<string, number>();
  return {
    async limit({ key }: { key: string }): Promise<{ success: boolean }> {
      if (options.throwOnLimit) throw new Error("binding limit() failed");
      const count = (counts.get(key) ?? 0) + 1;
      counts.set(key, count);
      if (options.denyAfter !== undefined && count > options.denyAfter) {
        return { success: false };
      }
      return { success: true };
    },
  };
}

const BINDING_NAMES = {
  image: "RATE_LIMITER_IMAGE",
  write: "RATE_LIMITER_WRITE",
  read: "RATE_LIMITER_READ",
  privileged: "RATE_LIMITER_PRIVILEGED",
} as const;

function createEvent(overrides: {
  routeId?: string | null;
  userId?: string | null;
  clientAddress?: string;
  tier?: Exclude<Tier, "exempt">;
  binding?: ReturnType<typeof createFakeBinding> | undefined;
}): RequestEvent {
  const env =
    overrides.binding && overrides.tier
      ? { [BINDING_NAMES[overrides.tier]]: overrides.binding }
      : undefined;
  return {
    route: { id: overrides.routeId ?? null },
    locals: { userId: overrides.userId ?? null, user: null },
    getClientAddress: () => overrides.clientAddress ?? "203.0.113.1",
    platform: env ? { env } : undefined,
  } as unknown as RequestEvent;
}

describe("resolveTier", () => {
  it("resolves method-specific entries distinctly from other methods on the same route", () => {
    expect(resolveTier("/api/hikes", "GET")).toBe("read");
    expect(resolveTier("/api/hikes", "POST")).toBe("write");
  });

  it("resolves whole-route entries regardless of method", () => {
    expect(resolveTier("/api/upload", "POST")).toBe("image");
    expect(resolveTier("/api/files", "GET")).toBe("image");
  });

  it("resolves /api/files GET to the image tier unambiguously", () => {
    expect(resolveTier("/api/files", "GET")).toBe("image");
  });

  it("falls back to the strictest non-image default tier for an unmapped route/method", () => {
    expect(resolveTier("/api/some-future-route", "GET")).toBe("write");
    expect(resolveTier(null, "GET")).toBe("write");
  });
});

describe("checkRateLimit", () => {
  it("returns allowed: true when the binding reports success", async () => {
    const binding = createFakeBinding();
    const event = createEvent({ userId: "user-1", tier: "write", binding });
    const result = await checkRateLimit(event, "write");
    expect(result.allowed).toBe(true);
  });

  it("returns allowed: false when the binding reports success: false", async () => {
    const binding = createFakeBinding({ denyAfter: 0 });
    const event = createEvent({ userId: "user-1", tier: "image", binding });
    const result = await checkRateLimit(event, "image");
    expect(result.allowed).toBe(false);
  });

  it("keys user-based tiers by locals.userId, giving different users independent counters", async () => {
    const binding = createFakeBinding({ denyAfter: 1 });
    const eventA = createEvent({ userId: "user-a", tier: "image", binding });
    const eventB = createEvent({ userId: "user-b", tier: "image", binding });

    expect((await checkRateLimit(eventA, "image")).allowed).toBe(true);
    expect((await checkRateLimit(eventA, "image")).allowed).toBe(false);
    expect((await checkRateLimit(eventB, "image")).allowed).toBe(true);
  });

  it("keys read-tier requests by IP when locals.userId is absent", async () => {
    const binding = createFakeBinding();
    const event = createEvent({
      userId: null,
      clientAddress: "198.51.100.9",
      tier: "read",
      binding,
    });
    const result = await checkRateLimit(event, "read");
    expect(result.allowed).toBe(true);
  });

  it("falls back to IP-based keying for a user tier when locals.userId is absent", async () => {
    const binding = createFakeBinding();
    const event = createEvent({
      userId: null,
      clientAddress: "198.51.100.9",
      tier: "write",
      binding,
    });
    const result = await checkRateLimit(event, "write");
    expect(result.allowed).toBe(true);
  });

  it("exempt tier always allows", async () => {
    const event = createEvent({ userId: "user-1" });
    const result = await checkRateLimit(event, "exempt");
    expect(result.allowed).toBe(true);
  });

  it("fails open when the resolved tier's binding is unavailable", async () => {
    const event = createEvent({ userId: "user-1", binding: undefined });
    const result = await checkRateLimit(event, "image");
    expect(result.allowed).toBe(true);
  });

  it("fails open when the binding's limit() call throws", async () => {
    const binding = createFakeBinding({ throwOnLimit: true });
    const event = createEvent({ userId: "user-1", tier: "image", binding });
    const result = await checkRateLimit(event, "image");
    expect(result.allowed).toBe(true);
  });
});

describe("ROUTE_TIERS completeness", () => {
  it("assigns every actual (route, method) pair under src/routes/api an explicit tier", () => {
    const modules = import.meta.glob("/src/routes/api/**/+server.ts", { eager: true }) as Record<
      string,
      Record<string, unknown>
    >;

    const unclassified: string[] = [];

    for (const [globKey, module] of Object.entries(modules)) {
      const routeId = routeIdFromGlobKey(globKey);
      for (const method of HTTP_METHODS) {
        if (typeof module[method] !== "function") continue;

        const methodKey = `${method} ${routeId}`;
        const hasExplicitTier =
          Object.prototype.hasOwnProperty.call(ROUTE_TIERS, methodKey) ||
          Object.prototype.hasOwnProperty.call(ROUTE_TIERS, routeId);

        if (!hasExplicitTier) {
          unclassified.push(methodKey);
        }
      }
    }

    expect(unclassified).toEqual([]);
  });

  it("keeps every ROUTE_TIERS value a known tier", () => {
    const validTiers: Tier[] = ["image", "write", "read", "privileged", "exempt"];
    for (const tier of Object.values(ROUTE_TIERS)) {
      expect(validTiers).toContain(tier);
    }
  });
});
