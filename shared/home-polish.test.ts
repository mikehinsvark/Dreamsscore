import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const polishSource = readFileSync(new URL("../client/src/components/InteractionPolish.css", import.meta.url), "utf8");

describe("home visual polish", () => {
  it("keeps an accessible click-to-play hero poster backed by the local cover", () => {
    expect(homeSource).toContain('poster="/media/dreams-score-business-video-cover.webp"');
    expect(homeSource).toContain('aria-label="Play the one-minute DREAMS Score opportunity film"');
    expect(homeSource).toContain("heroFilmRef.current?.play()");
  });

  it("keeps dedicated process, AI Visibility, and six-pillar hover hooks", () => {
    expect(polishSource).toContain(".ai-promo-card:hover");
    expect(polishSource).toContain(".process-grid article:hover");
    ["d", "r", "e", "a", "m", "s"].forEach(code => {
      expect(polishSource).toContain(`.category-${code} { --card-accent:`);
    });
  });
});
