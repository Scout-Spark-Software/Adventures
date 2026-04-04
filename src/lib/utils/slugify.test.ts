import { describe, it, expect } from "vitest";
import { toSlug, hasProfanityInSlug } from "./slugify";

describe("toSlug", () => {
  it("lowercases and hyphenates", () => {
    expect(toSlug("Sunset Trail")).toBe("sunset-trail");
  });
  it("strips non-alphanumeric chars", () => {
    expect(toSlug("Mount Rainier (WA)")).toBe("mount-rainier-wa");
  });
  it("collapses multiple hyphens", () => {
    expect(toSlug("A  --  B")).toBe("a-b");
  });
  it("trims leading/trailing hyphens", () => {
    expect(toSlug("  -hello-  ")).toBe("hello");
  });
  it("handles empty string", () => {
    expect(toSlug("")).toBe("");
  });
});

describe("hasProfanityInSlug", () => {
  it("returns false for clean text", () => {
    expect(hasProfanityInSlug("sunset-trail")).toBe(false);
  });
  it("returns true for profane text", () => {
    expect(hasProfanityInSlug("fucking-trail")).toBe(true);
  });
});
