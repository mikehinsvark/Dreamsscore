import { describe, expect, it } from "vitest";
import { resolveOptionalDestination } from "./destinations";

describe("resolveOptionalDestination", () => {
  it("keeps the on-page booking fallback when an optional URL is absent or unsafe", () => {
    expect(resolveOptionalDestination(undefined)).toBe("#booking");
    expect(resolveOptionalDestination(" ")).toBe("#booking");
    expect(resolveOptionalDestination("javascript:alert(1)")).toBe("#booking");
  });

  it("uses a configured HTTP(S) destination when one is provided", () => {
    expect(resolveOptionalDestination("https://example.com/book")).toBe("https://example.com/book");
  });
});
