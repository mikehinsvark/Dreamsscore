import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearReportHistory, createReportHistoryCsv, filterReportHistory, generatedDateKey, readReportHistory, REPORT_HISTORY_UPDATED_EVENT, saveReportHistoryEntry, sortReportHistory } from "../client/src/lib/reportHistory";

const store = new Map<string, string>();
const dispatchEvent = vi.fn();

beforeEach(() => {
  store.clear();
  dispatchEvent.mockClear();
  vi.stubGlobal("window", { localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) }, dispatchEvent });
});

describe("same-device report history", () => {
  it("stores only display metadata, deduplicates an ID, and clears locally", () => {
    saveReportHistoryEntry({ id: "report-123456", companyName: "Acme Holdings", generatedAt: "2026-08-19T00:00:00.000Z", totalPotentialValue: 850_000 });
    saveReportHistoryEntry({ id: "report-123456", companyName: "Acme Holdings Updated", generatedAt: "2026-08-19T00:00:00.000Z", totalPotentialValue: 900_000 });
    expect(readReportHistory()).toHaveLength(1);
    expect(readReportHistory()[0]).toMatchObject({ id: "report-123456", companyName: "Acme Holdings Updated", totalPotentialValue: 900_000 });
    expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: REPORT_HISTORY_UPDATED_EVENT }));
    clearReportHistory();
    expect(readReportHistory()).toEqual([]);
  });

  it("filters saved reports by case-insensitive company name and generated date", () => {
    const entries = [
      { id: "northstar", companyName: "Northstar Distribution", generatedAt: "2026-08-19T14:00:00.000Z", totalPotentialValue: 525_000, savedAt: 1 },
      { id: "peak", companyName: "Peak Manufacturing", generatedAt: "2026-08-18T14:00:00.000Z", totalPotentialValue: 850_000, savedAt: 2 },
    ];
    expect(filterReportHistory(entries, "NORTH", "")).toHaveLength(1);
    expect(filterReportHistory(entries, "", generatedDateKey(entries[1].generatedAt))).toEqual([entries[1]]);
    expect(filterReportHistory(entries, "missing", "")).toEqual([]);
  });

  it("sorts by newest or highest potential value and serializes spreadsheet-safe CSV", () => {
    const entries = [
      { id: "northstar", companyName: "Northstar, Distribution", generatedAt: "2026-08-19T14:00:00.000Z", totalPotentialValue: 525_000, savedAt: 1 },
      { id: "peak", companyName: "Peak Manufacturing", generatedAt: "2026-08-18T14:00:00.000Z", totalPotentialValue: 850_000, savedAt: 2 },
    ];
    expect(sortReportHistory(entries, "newest").map((entry) => entry.id)).toEqual(["northstar", "peak"]);
    expect(sortReportHistory(entries, "potential").map((entry) => entry.id)).toEqual(["peak", "northstar"]);
    const csv = createReportHistoryCsv(entries);
    expect(csv).toContain("Report ID,Company Name,Generated Date,Potential Value,Saved To Device");
    expect(csv).toContain('"Northstar, Distribution"');
    expect(csv).toContain("peak,Peak Manufacturing");
  });
});
