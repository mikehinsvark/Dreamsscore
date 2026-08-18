import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const guideSource = readFileSync(new URL("../client/src/components/SiteChrome.tsx", import.meta.url), "utf8");
const voiceStyleSource = readFileSync(new URL("../client/src/components/RobertVoice.css", import.meta.url), "utf8");

describe("Robert voice guidance", () => {
  it("provides an accessible browser-native listen and stop control", () => {
    expect(guideSource).toContain('"speechSynthesis" in window');
    expect(guideSource).toContain("new SpeechSynthesisUtterance(matchedCopy.note)");
    expect(guideSource).toContain('"Listen to Robert"');
    expect(guideSource).toContain('"Stop listening"');
    expect(guideSource).toContain('aria-pressed={isSpeaking}');
  });

  it("cancels playback on teardown and offers visible listening states", () => {
    expect(guideSource).toContain("window.speechSynthesis?.cancel()");
    expect(guideSource).toContain("Voice playback is not available in this browser.");
    expect(voiceStyleSource).toContain(".robert-listen-button.is-speaking");
    expect(voiceStyleSource).toContain(".robert-voice-status");
  });
});
