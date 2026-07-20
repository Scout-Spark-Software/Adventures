import { describe, expect, it } from "vitest";
import { isHttpError } from "@sveltejs/kit";
import { requireExactlyOneEntityRef } from "./entity-refs";

const MESSAGES = {
  missing: "one of hikeId, campingSiteId, backpackingId is required",
  tooMany: "only one of hikeId, campingSiteId, backpackingId may be set",
};

describe("requireExactlyOneEntityRef", () => {
  it("throws the missing message when no refs are set", () => {
    try {
      requireExactlyOneEntityRef({}, MESSAGES);
      expect.unreachable("expected requireExactlyOneEntityRef to throw");
    } catch (e) {
      if (!isHttpError(e)) throw e;
      expect(e.status).toBe(400);
      expect(e.body.message).toBe(MESSAGES.missing);
    }
  });

  it("throws the tooMany message when two refs are set", () => {
    try {
      requireExactlyOneEntityRef({ hikeId: "hike-1", campingSiteId: "camp-1" }, MESSAGES);
      expect.unreachable("expected requireExactlyOneEntityRef to throw");
    } catch (e) {
      if (!isHttpError(e)) throw e;
      expect(e.status).toBe(400);
      expect(e.body.message).toBe(MESSAGES.tooMany);
    }
  });

  it("throws the tooMany message when all three refs are set", () => {
    try {
      requireExactlyOneEntityRef(
        { hikeId: "hike-1", campingSiteId: "camp-1", backpackingId: "trip-1" },
        MESSAGES
      );
      expect.unreachable("expected requireExactlyOneEntityRef to throw");
    } catch (e) {
      if (!isHttpError(e)) throw e;
      expect(e.status).toBe(400);
      expect(e.body.message).toBe(MESSAGES.tooMany);
    }
  });

  it("does not throw when only hikeId is set", () => {
    expect(() => requireExactlyOneEntityRef({ hikeId: "hike-1" }, MESSAGES)).not.toThrow();
  });

  it("does not throw when only campingSiteId is set", () => {
    expect(() => requireExactlyOneEntityRef({ campingSiteId: "camp-1" }, MESSAGES)).not.toThrow();
  });

  it("does not throw when only backpackingId is set", () => {
    expect(() => requireExactlyOneEntityRef({ backpackingId: "trip-1" }, MESSAGES)).not.toThrow();
  });

  it("treats an empty string as not-set, so it does not count toward the total", () => {
    expect(() =>
      requireExactlyOneEntityRef({ hikeId: "", campingSiteId: "camp-1" }, MESSAGES)
    ).not.toThrow();
  });

  it("treats an all-empty-string input as missing, not exactly-one", () => {
    try {
      requireExactlyOneEntityRef({ hikeId: "", campingSiteId: "", backpackingId: "" }, MESSAGES);
      expect.unreachable("expected requireExactlyOneEntityRef to throw");
    } catch (e) {
      if (!isHttpError(e)) throw e;
      expect(e.status).toBe(400);
      expect(e.body.message).toBe(MESSAGES.missing);
    }
  });
});
