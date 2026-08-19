import { Download, ExternalLink, History, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { clearReportHistory, filterReportHistory, generatedDateKey, readReportHistory, REPORT_HISTORY_UPDATED_EVENT, type ReportHistoryEntry } from "@/lib/reportHistory";
import { formatEstimate } from "@shared/dreams";
import "@/components/ReportHistory.css";

function downloadPdf({ base64, filename, mimeType }: { base64: string; filename: string; mimeType: string }) {
  const bytes = Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function ReportHistoryPanel() {
  const [entries, setEntries] = useState<ReportHistoryEntry[]>(() => readReportHistory());
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [generatedDate, setGeneratedDate] = useState("");
  const download = trpc.dreams.downloadBrandedPdfById.useMutation();
  useEffect(() => {
    const sync = () => setEntries(readReportHistory());
    window.addEventListener(REPORT_HISTORY_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(REPORT_HISTORY_UPDATED_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  if (!entries.length) return null;
  const filteredEntries = useMemo(() => filterReportHistory(entries, query, generatedDate), [entries, query, generatedDate]);
  const availableDates = useMemo(() => Array.from(new Set(entries.map((entry) => generatedDateKey(entry.generatedAt)).filter(Boolean))).sort((left, right) => right.localeCompare(left)), [entries]);
  const hasFilters = Boolean(query || generatedDate);
  const clearFilters = () => { setQuery(""); setGeneratedDate(""); };

  const reDownload = (entry: ReportHistoryEntry) => {
    setStatus(`Preparing ${entry.companyName}'s color PDF…`);
    download.mutate({ id: entry.id }, {
      onSuccess: (file) => { downloadPdf(file); setStatus(`${entry.companyName}'s color PDF download has started.`); },
      onError: () => setStatus("That report is no longer available. You can begin a new assessment at any time."),
    });
  };

  return <section className="report-history-panel paper-card" aria-labelledby="report-history-title">
    <div className="report-history-heading"><div><span className="eyebrow"><History size={14} /> Returning here?</span><h2 id="report-history-title">Your report history</h2><p>These links are saved only in this browser on this device.</p></div><button type="button" className="report-history-clear" onClick={() => { clearReportHistory(); setEntries([]); setStatus("Saved report history cleared from this browser."); }}><RotateCcw size={14} /> Clear history</button></div>
    <div className="report-history-filters" role="search" aria-label="Search saved reports"><label className="report-history-search"><Search size={15} aria-hidden="true" /><span className="sr-only">Search by company name</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company name" /></label><label className="report-history-date"><span>Generated</span><select value={generatedDate} onChange={(event) => setGeneratedDate(event.target.value)}><option value="">All dates</option>{availableDates.map((date) => <option key={date} value={date}>{new Date(`${date}T12:00:00`).toLocaleDateString()}</option>)}</select></label>{hasFilters && <button type="button" className="report-history-reset" onClick={clearFilters}><X size={14} /> Reset filters</button>}</div>
    {filteredEntries.length ? <div className="report-history-list">{filteredEntries.map((entry) => <article key={entry.id}><div><strong>{entry.companyName}</strong><span>Created {new Date(entry.generatedAt).toLocaleDateString()} · {formatEstimate(entry.totalPotentialValue)} potential value</span></div><div className="report-history-actions"><Link href={`/report/${entry.id}`}><ExternalLink size={14} /> View</Link><button type="button" disabled={download.isPending} onClick={() => reDownload(entry)}><Download size={14} /> PDF</button></div></article>)}</div> : <div className="report-history-empty" role="status"><strong>No saved reports match those filters.</strong><span>Try another company name or reset the date filter.</span>{hasFilters && <button type="button" onClick={clearFilters}>Show all saved reports</button>}</div>}
    <p className="report-history-status" role="status" aria-live="polite">{status}</p>
  </section>;
}
