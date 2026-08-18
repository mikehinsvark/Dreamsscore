import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const source = readFileSync(new URL("../client/src/pages/Assessment.tsx", import.meta.url), "utf8");
const guideSource = readFileSync(new URL("../client/src/components/SiteChrome.tsx", import.meta.url), "utf8");
describe("assessment interaction stability", () => {
  it("uses a stable context-backed field component so input focus survives state updates", () => { expect(source).toContain("const AssessmentFieldContext = createContext"); expect(source).toContain("function TextField(props: FieldProps)"); expect(source).not.toContain("const TextField ="); expect(source).toContain("<AssessmentFieldContext.Provider"); });
  it("preserves numeric draft strings while accepting multi-character edits", () => { expect(source).toContain("const [numericDrafts, setNumericDrafts]"); expect(source).toContain("setNumericDrafts((current) => ({ ...current, [field]: rawValue }))"); expect(source).toContain('inputMode={isNumber ? "decimal" : undefined}'); });
  it("passes the active assessment step into Robert’s contextual guidance", () => { expect(source).toContain("<RobertGuide context={assessmentGuidanceIds[step]} />"); expect(guideSource).toContain('id: "assessmentDebt"'); expect(guideSource).toContain("[location, matchedCopy.id]"); });
});
