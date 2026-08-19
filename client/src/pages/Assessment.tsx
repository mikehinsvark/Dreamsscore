import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleAlert, Lightbulb, Loader2, RotateCcw, Save } from "lucide-react";
import { createContext, useContext, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { assessmentInputSchema, emptyAssessment, type AssessmentInput } from "@shared/dreams";
import { RobertGuide, SiteHeader } from "@/components/SiteChrome";
import { trpc } from "@/lib/trpc";
import "@/components/AssessmentEnhancements.css";

type FieldProps = { label: string; field: keyof AssessmentInput; hint?: string; placeholder?: string; optional?: boolean; type?: "text" | "email" | "tel" | "number" };
type AssessmentTextFieldProps = FieldProps & { value: string | number; draftValue?: string; onTextChange: (field: keyof AssessmentInput, value: string) => void; onNumberChange: (field: keyof AssessmentInput, value: string) => void; onNumberBlur: (field: keyof AssessmentInput) => void; };
function AssessmentTextField({ label, field, hint, placeholder, optional, type = "text", value, draftValue, onTextChange, onNumberChange, onNumberBlur }: AssessmentTextFieldProps) { const isNumber = type === "number"; return <label className="form-field"><span>{label}{optional && <em className="optional-field-label">Optional</em>}</span>{hint && <small>{hint}</small>}<input type={type} inputMode={isNumber ? "decimal" : undefined} placeholder={placeholder} value={isNumber ? draftValue ?? String(value) : String(value)} onChange={(event) => isNumber ? onNumberChange(field, event.target.value) : onTextChange(field, event.target.value)} onBlur={() => isNumber && onNumberBlur(field)} /></label>; }
type AssessmentFieldContextValue = { form: AssessmentInput; numericDrafts: Partial<Record<keyof AssessmentInput, string>>; setTextField: (field: keyof AssessmentInput, value: string) => void; setNumberField: (field: keyof AssessmentInput, value: string) => void; commitNumberField: (field: keyof AssessmentInput) => void; };
const AssessmentFieldContext = createContext<AssessmentFieldContextValue | null>(null);
function TextField(props: FieldProps) { const context = useContext(AssessmentFieldContext); if (!context) throw new Error("Assessment text fields require assessment form context."); return <AssessmentTextField {...props} value={context.form[props.field] as string | number} draftValue={context.numericDrafts[props.field]} onTextChange={context.setTextField} onNumberChange={context.setNumberField} onNumberBlur={context.commitNumberField} />; }

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
const assessmentGuidanceIds = ["assessmentBusiness", "assessmentDebt", "assessmentRetirement", "assessmentExpenses", "assessmentAssets", "assessmentMoney", "assessmentSecurity"] as const;
const assessmentTips = [{ title: "Start with practical business context", summary: "High-level details are enough. You can leave optional contact fields blank.", bullets: ["Use the legal or operating company name you recognize.", "Approximate revenue and employee counts are fine."] }, { title: "Keep debt figures directional", summary: "Use broad current amounts—not account numbers or lending documents.", bullets: ["Include typical monthly payments where known.", "Choose the credit profile that feels closest today."] }, { title: "Use a broad retirement snapshot", summary: "No account numbers or personal details are needed here.", bullets: ["Round balances and annual contributions are useful.", "Participation can be a best estimate."] }, { title: "Focus on recurring operating costs", summary: "Annual estimates help identify questions worth reviewing with a specialist.", bullets: ["Use recent annual totals when available.", "Only select energy interest if it is relevant today."] }, { title: "Think in terms of growth assets", summary: "Use typical monthly lead and marketing numbers rather than exact campaign reports.", bullets: ["Estimate a representative lead value.", "Reputation focus is optional."] }, { title: "Flag possible credit conversations", summary: "This is an early screening step, not tax advice or a filing.", bullets: ["Use approximate research and tip-wage amounts.", "Enter expected credits only if you already know them."] }, { title: "Finish with business-resilience inputs", summary: "These high-level costs help frame protection and technology questions.", bullets: ["Use annual premium and monthly IT estimates.", "Key-person roles can be a rounded count."] }];
const ASSESSMENT_DRAFT_KEY = "dreams-score-assessment-draft-v1";
type SavedAssessmentDraft = { version: 1; step: number; form: AssessmentInput; savedAt: number };
function readSavedAssessmentDraft(): SavedAssessmentDraft | null { if (typeof window === "undefined") return null; try { const saved = JSON.parse(window.localStorage.getItem(ASSESSMENT_DRAFT_KEY) ?? "null") as SavedAssessmentDraft | null; if (saved?.version === 1 && Number.isInteger(saved.step) && saved.step >= 0 && saved.step < steps.length && saved.form && typeof saved.form === "object") return saved; } catch {} return null; }

export default function Assessment() {
  const [, navigate] = useLocation();
  const [restoredDraft] = useState<SavedAssessmentDraft | null>(() => readSavedAssessmentDraft());
  const [step, setStep] = useState(() => restoredDraft?.step ?? 0);
  const [form, setForm] = useState<AssessmentInput>(() => restoredDraft?.form ?? emptyAssessment);
  const [numericDrafts, setNumericDrafts] = useState<Partial<Record<keyof AssessmentInput, string>>>({});
  const [submitError, setSubmitError] = useState("");
  const [tipsOpen, setTipsOpen] = useState(false); const [hasSavedDraft, setHasSavedDraft] = useState(Boolean(restoredDraft)); const [saveStatus, setSaveStatus] = useState(restoredDraft ? "Your saved assessment was restored on this device." : "");
  const createReport = trpc.dreams.createReport.useMutation({
    onSuccess: ({ id }) => { window.localStorage.removeItem(ASSESSMENT_DRAFT_KEY); navigate(`/report/${id}`); },
    onError: () => setSubmitError("We could not save your assessment just now. Please review the form and try again."),
  });

  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);
  const setField = <K extends keyof AssessmentInput>(field: K, value: AssessmentInput[K]) => setForm((current) => ({ ...current, [field]: value }));
  const setTextField = (field: keyof AssessmentInput, value: string) => setField(field, value as AssessmentInput[typeof field]);
  const setNumberField = (field: keyof AssessmentInput, rawValue: string) => { setNumericDrafts((current) => ({ ...current, [field]: rawValue })); const parsed = Number(rawValue); if (rawValue !== "" && Number.isFinite(parsed)) setField(field, Math.max(0, parsed) as AssessmentInput[typeof field]); };
  const commitNumberField = (field: keyof AssessmentInput) => { if (numericDrafts[field] === "") setField(field, 0 as AssessmentInput[typeof field]); setNumericDrafts((current) => { const { [field]: _draft, ...remaining } = current; return remaining; }); };
  const saveAssessment = () => { try { window.localStorage.setItem(ASSESSMENT_DRAFT_KEY, JSON.stringify({ version: 1, step, form, savedAt: Date.now() } satisfies SavedAssessmentDraft)); setHasSavedDraft(true); setSaveStatus("Saved on this device. Return to this browser and select Start assessment to resume."); } catch { setSaveStatus("This browser could not save your progress. You can still continue the assessment now."); } };
  const startFresh = () => { window.localStorage.removeItem(ASSESSMENT_DRAFT_KEY); setForm(emptyAssessment); setNumericDrafts({}); setStep(0); setHasSavedDraft(false); setSaveStatus("Saved copy cleared. You are starting a fresh assessment."); };

  const stepContent = [
    <div className="assessment-fields two-col" key="business">
      <TextField label="Company name" field="companyName" placeholder="e.g., Acme Holdings" /> <TextField label="Contact name" field="contactName" optional placeholder="e.g., Jordan Lee" />
      <TextField label="Email" field="email" type="email" placeholder="e.g., name@company.com" /> <TextField label="Phone" field="phone" type="tel" optional placeholder="e.g., (555) 123-4567" />
      <TextField label="Title / position" field="title" optional placeholder="e.g., Owner or CFO" /> <TextField label="Business website" field="website" optional placeholder="e.g., acme.com" />
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
        <section className={`assessment-step-tips ${tipsOpen ? "is-open" : ""}`} aria-label={`Robert's tips for ${steps[step].label}`}><button type="button" className="assessment-tips-trigger" aria-expanded={tipsOpen} aria-controls="robert-step-tips" onClick={() => setTipsOpen((open) => !open)}><span className="assessment-tips-icon"><Lightbulb size={15} /></span><span><strong>Robert’s tips for this step</strong><small>{assessmentTips[step].summary}</small></span><ChevronDown size={17} /></button>{tipsOpen && <div id="robert-step-tips" className="assessment-tips-panel"><p>{assessmentTips[step].title}</p><ul>{assessmentTips[step].bullets.map((tip) => <li key={tip}>{tip}</li>)}</ul></div>}</section>
        <AssessmentFieldContext.Provider value={{ form, numericDrafts, setTextField, setNumberField, commitNumberField }}>{stepContent[step]}</AssessmentFieldContext.Provider>
        {submitError && <p className="form-error"><CircleAlert size={16} /> {submitError}</p>}
        <div className="assessment-actions"><button className="button button-outline" type="button" disabled={step === 0 || createReport.isPending} onClick={() => setStep((current) => Math.max(0, current - 1))}><ArrowLeft size={16} /> Back</button><div className="assessment-save-tools"><button className="assessment-save-link" type="button" onClick={saveAssessment}><Save size={14} /> Save &amp; Resume later</button>{hasSavedDraft && <button className="assessment-save-link assessment-reset-link" type="button" onClick={startFresh}><RotateCcw size={13} /> Start fresh</button>}</div><button className="button button-primary" type="button" disabled={createReport.isPending} onClick={advance}>{createReport.isPending ? <><Loader2 className="spin" size={16} /> Building your report</> : step === steps.length - 1 ? <>Generate my report <ArrowRight size={16} /></> : <>Continue <ArrowRight size={16} /></>}</button></div><p className="assessment-save-status" role="status" aria-live="polite">{saveStatus || "Saved progress stays only in this browser on this device."}</p>
      </section>
      <p className="assessment-disclaimer">All figures will be estimates based on the limited information you provide. No outcome is guaranteed; a qualified specialist can provide a complete, personalized proposal.</p>
    </main>
    <RobertGuide context={assessmentGuidanceIds[step]} />
  </div>;
}
