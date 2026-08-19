import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import type { DreamsReport } from "@shared/dreams";
import { ReportView } from "@/components/ReportView";
import { ReportHistoryPanel } from "@/components/ReportHistory";
import { RobertGuide, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { trpc } from "@/lib/trpc";

export default function Report({ id }: { id: string }) {
  const result = trpc.dreams.getReport.useQuery({ id });
  return <div className="app-page report-page"><SiteHeader compact />
    <main className="report-main shell">
      <Link href="/" className="back-link"><ArrowLeft size={15} /> Back to home</Link>
      {result.isLoading && <div className="report-loading paper-card"><Loader2 className="spin" size={26} /><p>Opening your DREAMS Score report…</p></div>}
      <ReportHistoryPanel />
      {result.data && <ReportView report={result.data.reportJson as DreamsReport} reportId={id} />}
      {result.data === null && <div className="report-not-found paper-card"><span className="eyebrow">Report unavailable</span><h1>We couldn’t find that DREAMS Score.</h1><p>Reports are created after a completed assessment. Start a new assessment to generate a fresh, personalized report.</p><Link className="button button-primary" href="/assessment">Start my assessment</Link></div>}
    </main><SiteFooter /><RobertGuide />
  </div>;
}
