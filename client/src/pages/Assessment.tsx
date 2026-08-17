import { ArrowLeft, ArrowRight, Check, CircleAlert, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { assessmentInputSchema, emptyAssessment, type AssessmentInput } from "@shared/dreams";
import { RobertGuide, SiteHeader } from "@/components/SiteChrome";
import { trpc } from "@/lib/trpc";

type FieldProps<K extends keyof AssessmentInput> = { label: string; field: K; hint?: string; type?: "text" | "email" | "tel" | "number" };

const steps = [
  { code: "1", label: "Business Info" },
  { code: "D", label: "Debt & Funding" },
  { code: "R", label: "Retirement" },
  { code: "E", label: "Expenses" },
  { code: "A", label: "Assets" },
  { code: "M", label: "Money & Tax" },
  { code: "S", label: "Security" },
];

const industries = ["Manufacturing", "Technology", "Healthcare", "Construction", "Transportation & Logistics", "Hospitality & Food Service", "Retail", "Professional Services", "Real Estate", "Financial Services", "Education", "Energy", "Agriculture", "Other"];

export default function Assessment() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AssessmentInput>(emptyAssessment);
  const [submitError, setSubmitError] = useState("");
  const createReport = trpc.dreams.createReport.useMutation({
    onSuccess: ({ id }) => navigate(`/report/${id}`),
    onError: () => setSubmitError("We could not save your assessment just now. Please review the form and try again."),
  });

  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);
  const setField = <K extends keyof AssessmentInput>(field: K, value: AssessmentInput[K]) => setForm((current) => ({ ...current, [field]: value }));

  const TextField = <K extends keyof AssessmentInput>({ label, field, hint, type = "text" }: FieldProps<K>) => {
    const isNumber = type === "number";
    return <label className="form-field"><span>{label}</span>{hint && <small>{hint}</small>}<input type={type} value={form[field] as string | number} onChange={(event) => setField(field, (isNumber ? Math.max(0, Number(event.target.value) || 0) : event.target.value) as AssessmentInput[K])} /></label>;
  };

  const stepContent = [
    <div className="assessment-fields two-col" key="business">
      <TextField label="Company name" field="companyName" /> <TextField label="Contact name" field="contactName" />
      <TextField label="Email" field="email" type="email" /> <TextField label="Phone" field="phone" type="tel" />
      <TextField label="Title / position" field="title" /> <TextField label="Business website" field="website" />
      <label className="form-field"><span>Industry</span><select value={form.industry} onChange={(event) => setField("industry", event.target.value)}>{industries.map((industry) => <option key={industry}>{industry}</option>)}</select></label>
      <fieldset className="form-field"><span>Type of sales</span><div className="choice-row">{(["B2B", "B2C", "Both"] as const).map((type) => <label className={`choice-pill ${form.salesType === type ? "selected" : ""}`} key={type}><input type="radio" name="salesType" checked={form.salesType === type} onChange={() => setField("salesType", type)} />{type}</label>)}</div></fieldset>
      <TextField label="Annual revenue" hint="Approximate annual revenue" field="annualRevenue" type="number" /> <TextField label="Number of employees" field="employeeCount" type="number" />
      <TextField label="Years in business" field="yearsInBusiness" type="number" /> <TextField label="Building size (sq ft)" hint="Used to estimate energy opportunities" field="buildingSquareFeet" type="number" />
    </div>,
    <div className="assessment-fields two-col" key="debt">
      <TextField label="Additional funding desired" hint="Capital that could support a current priority" field="fundingDesired" type="number" /> <TextField label="Current business debt" field="currentDebt" type="number" />
      <TextField label="Monthly debt payments" field="monthlyDebtPayments" type="number" />
      <label className="form-field"><span>Business credit profile</span><select value={form.creditProfile} onChange={(event) => setField("creditProfile", event.target.value as AssessmentInput["creditProfile"])}>{["Excellent", "Good", "Fair", "Building"].map((profile) => <option key={profile}>{profile}</option>)}</select></label>
    </div>,
    <div className="assessment-fields two-col" key="retirement">
      <TextField label="Total retirement account balances" field="retirementAssets" type="number" /> <TextField label="Annual retirement contributions" field="annualRetirementContributions" type="number" />
      <TextField label="Employer match" hint="Percentage" field="employerMatch" type="number" /> <TextField label="Employee participation rate" hint="Percentage" field="retirementParticipation" type="number" />
    </div>,
    <div className="assessment-fields two-col" key="expenses">
      <TextField label="Annual health-plan spend" field="annualHealthSpend" type="number" /> <TextField label="Annual benefits spend" field="annualBenefitsSpend" type="number" />
      <TextField label="Annual energy spend" field="annualEnergySpend" type="number" />
      <label className="form-field checkbox-field"><span>Solar / energy efficiency interest</span><button className={`toggle-control ${form.solarInterest ? "on" : ""}`} type="button" role="switch" aria-checked={form.solarInterest} onClick={() => setField("solarInterest", !form.solarInterest)}><i />{form.solarInterest ? "Yes, explore it" : "Not currently"}</button></label>
    </div>,
    <div className="assessment-fields two-col" key="assets">
      <TextField label="Monthly website leads" field="monthlyWebsiteLeads" type="number" /> <TextField label="Average lead value" field="averageLeadValue" type="number" />
      <TextField label="Monthly marketing spend" field="monthlyMarketingSpend" type="number" />
      <label className="form-field checkbox-field"><span>Reputation management focus</span><button className={`toggle-control ${form.reputationFocus ? "on" : ""}`} type="button" role="switch" aria-checked={form.reputationFocus} onClick={() => setField("reputationFocus", !form.reputationFocus)}><i />{form.reputationFocus ? "Included" : "Not currently"}</button></label>
    </div>,
    <div className="assessment-fields two-col" key="money">
      <TextField label="Annual research / product-development spend" field="annualResearchSpend" type="number" /> <TextField label="Annual FICA tip wages" field="annualTipWages" type="number" />
      <TextField label="Known or expected state credits" field="expectedStateCredits" type="number" />
    </div>,
    <div className="assessment-fields two-col" key="security">
      <TextField label="Annual corporate life insurance premiums" field="annualLifePremiums" type="number" /> <TextField label="Key-person roles to protect" field="keyPersonCount" type="number" />
      <TextField label="Monthly cloud / IT spend" field="monthlyItSpend" type="number" />
    </div>,
  ];

  const descriptions = ["Basic information gives your score the right operating context.", "Share high-level capital and debt inputs to identify cash-flow conversations.", "Give us the broad retirement picture—nothing sensitive or account-specific.", "Reveal recurring expense categories that may deserve a closer look.", "See how lead flow, marketing, and reputation may become growth assets.", "Surface potential tax-credit questions for a qualified specialist to investigate.", "Evaluate protection and technical cost areas that can impact business resilience."];

  const advance = () => {
    if (step < steps.length - 1) { setStep((current) => current + 1); setSubmitError(""); return; }
    const parsed = assessmentInputSchema.safeParse(form);
    if (!parsed.success) { setSubmitError("Please complete the required business information with a valid email before generating your report."); setStep(0); return; }
    createReport.mutate(parsed.data);
  };

  return <div className="app-page assessment-page">
    <SiteHeader compact />
    <main className="assessment-main shell">
      <div className="assessment-intro"><span className="eyebrow">Business financial assessment</span><h1>Build your DREAMS Score.</h1><p>Answer a few high-level questions. Your personalized report will show directional estimates across six business areas.</p></div>
      <div className="progress-card paper-card">
        <div className="progress-topline"><span>Step {step + 1} of 7</span><strong>{progress}%</strong></div>
        <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        <ol className="progress-steps">{steps.map((item, index) => <li key={item.code} className={index === step ? "active" : index < step ? "complete" : ""}><button type="button" onClick={() => setStep(index)} aria-label={`Go to ${item.label}`}><i>{index < step ? <Check size={12} /> : item.code}</i><span>{item.label}</span></button></li>)}</ol>
      </div>
      <section className="assessment-card paper-card">
        <div className="assessment-card-heading"><div><span className="eyebrow">{steps[step].code} · {steps[step].label}</span><h2>{step === 0 ? "Tell us about your business" : steps[step].label}</h2><p>{descriptions[step]}</p></div><span className="step-counter">0{step + 1}</span></div>
        {stepContent[step]}
        {submitError && <p className="form-error"><CircleAlert size={16} /> {submitError}</p>}
        <div className="assessment-actions"><button className="button button-outline" type="button" disabled={step === 0 || createReport.isPending} onClick={() => setStep((current) => Math.max(0, current - 1))}><ArrowLeft size={16} /> Back</button><button className="button button-primary" type="button" disabled={createReport.isPending} onClick={advance}>{createReport.isPending ? <><Loader2 className="spin" size={16} /> Building your report</> : step === steps.length - 1 ? <>Generate my report <ArrowRight size={16} /></> : <>Continue <ArrowRight size={16} /></>}</button></div>
      </section>
      <p className="assessment-disclaimer">All figures will be estimates based on the limited information you provide. No outcome is guaranteed; a qualified specialist can provide a complete, personalized proposal.</p>
    </main>
    <RobertGuide />
  </div>;
}
