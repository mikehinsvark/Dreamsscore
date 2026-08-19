import { ChevronDown, ChevronRight, Download, Printer, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { DreamsReport } from "@shared/dreams";
import { formatEstimate } from "@shared/dreams";
import { destinationForCategory, destinations } from "@/lib/destinations";
import { PageIndex } from "@/components/SiteChrome";
import { reportSectionIndex } from "@shared/navigation";
import "@/components/ReportColorSystem.css";

const palette: Record<string, string> = {
  D: "category-sky",
  R: "category-mint",
  E: "category-gold",
  A: "category-violet",
  M: "category-cyan",
  S: "category-rose",
};

export function ReportView({ report, sample = false }: { report: DreamsReport; sample?: boolean }) {
  const [openCategory, setOpenCategory] = useState<string>(report.categories[0]?.code ?? "D");
  const maxCategoryTotal = Math.max(...report.categories.map((category) => category.total), 1);

  return (
    <div className="report-document">
      <PageIndex items={reportSectionIndex} className="report-page-index" />
      <section className="report-hero-card paper-card" id="financial-summary">
        <div className="report-heading">
          <span className="report-kicker"><Download size={15} /> DREAMS Score Report {sample ? "— Sample" : "— Personalized"}</span>
          <h1>{report.companyName}</h1>
          <p>{report.industry} <span>·</span> {report.employeeCount.toLocaleString()} employees <span>·</span> Generated {new Date(report.generatedAt).toLocaleDateString()}</p>
        </div>
        <div className="report-actions print-hidden">
          <button className="button button-outline button-small" type="button" onClick={() => window.print()}><Printer size={15} /> Print</button>
          <a className="button button-primary button-small" href={destinations.booking}>Discuss findings <ChevronRight size={15} /></a>
        </div>
        <div className="kpi-grid">
          <article className="report-kpi kpi-savings">
            <span>Total Est. Annual Savings</span>
            <strong>{formatEstimate(report.annualSavings)}</strong>
            <small>Expense reduction, retirement, tax credits & protection</small>
          </article>
          <article className="report-kpi kpi-profit">
            <span>Total Est. Increased Profit</span>
            <strong>{formatEstimate(report.annualProfit)}</strong>
            <small>Funding access, asset optimization & growth</small>
          </article>
          <article className="report-kpi kpi-total">
            <span>Total Potential Value</span>
            <strong>{formatEstimate(report.totalPotentialValue)}</strong>
            <small>Combined estimated savings + profit opportunity</small>
          </article>
        </div>
      </section>

      <section className="paper-card report-overview" id="category-scores">
        <div className="section-heading report-section-heading">
          <div><span className="eyebrow">At a glance</span><h2>DREAMS Score overview</h2></div>
          <p>Six business lenses surface areas worth specialist review.</p>
        </div>
        <div className="category-summary-list">
          {report.categories.map((category) => (
            <article className={`category-summary report-color-${category.code}`} key={category.code}>
              <span className={`category-code ${palette[category.code]}`}>{category.code}</span>
              <div className="category-summary-main">
                <div><h3>{category.name}</h3><span>{category.estimateKind === "savings" ? "Estimated savings" : "Estimated profit potential"}</span></div>
                <div className="category-bar-track"><span className={`category-bar ${palette[category.code]}`} style={{ width: `${Math.max((category.total / maxCategoryTotal) * 100, 3)}%` }} /></div>
              </div>
              <strong>{formatEstimate(category.total)}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="report-findings" id="recommendations">
        <div className="section-heading">
          <div><span className="eyebrow">Detailed findings</span><h2>Review the opportunity areas.</h2></div>
          <p>Open each section to see the inputs used and the recommended next conversation.</p>
        </div>
        <div className="accordion-list">
          {report.categories.map((category) => {
            const open = openCategory === category.code;
            return (
              <article className={`report-accordion paper-card report-color-${category.code} ${open ? "is-open" : ""}`} key={category.code}>
                <button className="accordion-trigger" type="button" onClick={() => setOpenCategory(open ? "" : category.code)} aria-expanded={open}>
                  <span className={`category-code ${palette[category.code]}`}>{category.code}</span>
                  <span className="accordion-title"><strong>{category.name}</strong><small>{category.summary}</small></span>
                  <span className="accordion-amount"><small>{category.estimateKind === "savings" ? "Savings" : "Profit"}</small><strong>{formatEstimate(category.total)}</strong></span>
                  <ChevronDown className="accordion-chevron" size={20} />
                </button>
                {open && (
                  <div className="accordion-panel">
                    <div className="input-snapshot">
                      {category.inputSummary.map((input) => <div key={input.label}><span>{input.label}</span><strong>{input.value}</strong></div>)}
                    </div>
                    <div className="comparison-card">
                      <div className="comparison-heading"><span>Opportunity comparison</span><strong>{formatEstimate(category.total)}</strong></div>
                      {category.opportunities.map((opportunity) => (
                        <div className="opportunity-line" key={opportunity.title}>
                          <div><span>{opportunity.title}</span><div className="opportunity-track"><i className={`category-bar ${palette[category.code]}`} style={{ width: `${Math.max((opportunity.amount / Math.max(category.total, 1)) * 100, 5)}%` }} /></div></div>
                          <strong>{formatEstimate(opportunity.amount)}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="opportunity-grid">
                      {category.opportunities.map((opportunity) => (
                        <article className="opportunity-card" key={opportunity.title}>
                          <span>{opportunity.title}</span>
                          <strong>{formatEstimate(opportunity.amount)}<small>/yr est.</small></strong>
                          <p>{opportunity.summary}</p>
                          <a href={destinationForCategory(category.code)}>{opportunity.nextAction} <ChevronRight size={14} /></a>
                        </article>
                      ))}
                    </div>
                    <p className="estimate-disclaimer"><ShieldCheck size={15} /> Estimate only. Findings use limited inputs and are not guaranteed. A qualified specialist can provide a complete, personalized assessment.</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="report-next-step paper-card" id="consultation">
        <span className="eyebrow">Next step</span>
        <h2>Turn the estimates into a focused conversation.</h2>
        <p>Bring this report to a DREAMS specialist to validate which opportunities are applicable, available, and worth prioritizing for your business.</p>
        <a className="button button-primary" href={destinations.booking}>Schedule an expert review <ChevronRight size={16} /></a>
      </section>
    </div>
  );
}
