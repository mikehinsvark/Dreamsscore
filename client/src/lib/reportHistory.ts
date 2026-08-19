export type ReportHistoryEntry = {
  id: string;
  companyName: string;
  generatedAt: string;
  totalPotentialValue: number;
  savedAt: number;
};

export type ReportHistorySort = "newest" | "potential";

export const REPORT_HISTORY_KEY = "dreams-score-report-history-v1";
export const REPORT_HISTORY_UPDATED_EVENT = "dreams-score-report-history-updated";

export function generatedDateKey(generatedAt: string): string {
  const date = new Date(generatedAt);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function filterReportHistory(entries: ReportHistoryEntry[], query: string, generatedDate: string): ReportHistoryEntry[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return entries.filter((entry) => (!normalizedQuery || entry.companyName.toLocaleLowerCase().includes(normalizedQuery)) && (!generatedDate || generatedDateKey(entry.generatedAt) === generatedDate));
}

export function sortReportHistory(entries: ReportHistoryEntry[], sort: ReportHistorySort): ReportHistoryEntry[] {
  return [...entries].sort((left, right) => {
    if (sort === "potential") {
      return right.totalPotentialValue - left.totalPotentialValue || new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime();
    }
    return new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime() || right.savedAt - left.savedAt;
  });
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function createReportHistoryCsv(entries: ReportHistoryEntry[]): string {
  const header = ["Report ID", "Company Name", "Generated Date", "Potential Value", "Saved To Device"];
  const rows = entries.map((entry) => [entry.id, entry.companyName, entry.generatedAt, entry.totalPotentialValue, new Date(entry.savedAt).toISOString()]);
  return `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

export function readReportHistory(): ReportHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(REPORT_HISTORY_KEY) ?? "[]") as unknown;
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is ReportHistoryEntry => Boolean(entry && typeof entry === "object" && typeof (entry as ReportHistoryEntry).id === "string" && typeof (entry as ReportHistoryEntry).companyName === "string" && typeof (entry as ReportHistoryEntry).generatedAt === "string" && Number.isFinite((entry as ReportHistoryEntry).totalPotentialValue) && Number.isFinite((entry as ReportHistoryEntry).savedAt))).slice(0, 12);
  } catch {
    return [];
  }
}

export function saveReportHistoryEntry(entry: Omit<ReportHistoryEntry, "savedAt">): ReportHistoryEntry[] {
  const next = [{ ...entry, savedAt: Date.now() }, ...readReportHistory().filter((current) => current.id !== entry.id)].slice(0, 12);
  try { window.localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(next)); window.dispatchEvent(new Event(REPORT_HISTORY_UPDATED_EVENT)); } catch { /* Storage may be unavailable. */ }
  return next;
}

export function clearReportHistory(): void {
  try { window.localStorage.removeItem(REPORT_HISTORY_KEY); window.dispatchEvent(new Event(REPORT_HISTORY_UPDATED_EVENT)); } catch { /* Storage may be unavailable. */ }
}
