import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearReportHistory, readReportHistory, REPORT_HISTORY_UPDATED_EVENT, saveReportHistoryEntry } from "../client/src/lib/reportHistory";

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
});
