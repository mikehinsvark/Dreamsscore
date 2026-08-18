import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const guideSource = readFileSync(new URL("../client/src/components/SiteChrome.tsx", import.meta.url), "utf8");
const voiceStyleSource = readFileSync(new URL("../client/src/components/RobertVoice.css", import.meta.url), "utf8");

describe("Robert voice guidance", () => {
  it("provides an accessible ElevenLabs-backed listen and stop control", () => {
    expect(guideSource).toContain("trpc.voice.getRobertNarration.useMutation()");
    expect(guideSource).toContain("narration.mutate({ guide: matchedCopy.id }");
    expect(guideSource).toContain('"Listen to Robert"');
    expect(guideSource).toContain('"Stop listening"');
    expect(guideSource).toContain('aria-pressed={isSpeaking}');
  });

  it("uses professional audio playback with pending and error states", () => {
    expect(guideSource).toContain("Preparing Robert’s professional voice.");
    expect(guideSource).toContain("Robert’s professional voice is temporarily unavailable. Please try again.");
    expect(guideSource).toContain("URL.revokeObjectURL");
    expect(voiceStyleSource).toContain(".robert-listen-button.is-speaking");
    expect(voiceStyleSource).toContain(".robert-listen-spinner");
    expect(voiceStyleSource).toContain(".robert-voice-status");
  });
});
