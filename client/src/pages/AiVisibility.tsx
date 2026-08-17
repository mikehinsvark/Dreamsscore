import { ArrowRight, Bot, CheckCircle2, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { RobertGuide, SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function AiVisibility() {
  const [business, setBusiness] = useState("");
  const [website, setWebsite] = useState("");
  const [showResult, setShowResult] = useState(false);
  const readiness = Math.min(88, 50 + (business.length > 3 ? 14 : 0) + (website.includes(".") ? 18 : 0));

  return <div className="app-page ai-page"><SiteHeader />
    <main>
      <section className="ai-hero"><div className="shell ai-hero-grid"><div><span className="eyebrow"><Sparkles size={14} /> Free instant AI analysis</span><h1>Is your business <em>visible</em> to AI?</h1><p>Customers now ask AI tools who to trust. Start a simple, educational visibility snapshot to frame the discovery conversation.</p><div className="ai-engine-row"><span>ChatGPT</span><span>Gemini</span><span>Grok</span><span>Copilot</span><span>Perplexity</span></div></div><div className="ai-orb-card"><div className="ai-orbit ai-orbit-a" /><div className="ai-orbit ai-orbit-b" /><div className="ai-orb-core"><Bot size={38} /><span>AI presence</span></div></div></div></section>
      <section className="shell ai-check-section"><div className="ai-check-copy"><span className="eyebrow">A starting point</span><h2>See the questions AI discovery raises.</h2><p>This lightweight tool does not crawl, score, or guarantee search visibility. It prepares a simple next-step view based on what you choose to share.</p><ul><li><CheckCircle2 size={17} /> Business identity clarity</li><li><CheckCircle2 size={17} /> Website signal readiness</li><li><CheckCircle2 size={17} /> Discovery priorities</li></ul></div><form className="ai-check-form paper-card" onSubmit={(event) => { event.preventDefault(); setShowResult(true); }}><label className="form-field"><span>Business name</span><input required value={business} onChange={(event) => setBusiness(event.target.value)} placeholder="Your business" /></label><label className="form-field"><span>Website</span><input required value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="yourbusiness.com" /></label><button className="button button-primary" type="submit"><Search size={16} /> Create my starting view</button>{showResult && <div className="ai-result"><div><span>Discovery readiness</span><strong>{readiness}<small>/100</small></strong></div><p><b>{business || "Your business"}</b> has a directional starting view. Verify business details, create useful on-site answers, and connect authority signals before relying on AI-assisted discovery.</p><Link href="/assessment">Continue to your DREAMS Score <ArrowRight size={15} /></Link></div>}</form></section>
    </main><SiteFooter /><RobertGuide />
  </div>;
}
