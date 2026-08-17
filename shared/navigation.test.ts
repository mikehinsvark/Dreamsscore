import { describe, expect, it } from "vitest";
import { landingSectionIndex, reportSectionIndex } from "./navigation";

describe("section index contracts", () => {
  it("keeps the requested stable landing anchors available", () => {
    expect(landingSectionIndex.map((item) => item.id)).toEqual([
      "overview", "opportunity-map", "six-pillars", "how-it-works", "sample-dashboard",
      "goals-and-scenarios", "resources", "faq", "book-a-review",
    ]);
  });

  it("keeps the existing report navigation tied to meaningful report sections", () => {
    expect(reportSectionIndex.map((item) => item.id)).toEqual([
      "financial-summary", "category-scores", "recommendations", "consultation",
    ]);
  });

  it("keeps directional section navigation within the available index range", async () => {
    const { adjacentSectionIndex } = await import("./navigation");
    expect(adjacentSectionIndex(0, 9, -1)).toBe(0);
    expect(adjacentSectionIndex(4, 9, 1)).toBe(5);
    expect(adjacentSectionIndex(8, 9, 1)).toBe(8);
  });
});
