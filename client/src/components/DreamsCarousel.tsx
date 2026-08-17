import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

type CarouselSlide = {
  id: string;
  code: string;
  channel: string;
  title: string;
  copy: string;
  image: string;
  alt: string;
};

const slides: CarouselSlide[] = [
  { id: "opportunity", code: "01", channel: "Opportunity intelligence", title: "See the value signals inside your business.", copy: "DREAMS Score organizes six connected opportunity areas into one calmer, clearer business review.", image: "/manus-storage/overview_c0e6eba8.png", alt: "DREAMS Score opportunity intelligence overview" },
  { id: "debt", code: "D", channel: "Debt & Funding", title: "Make capital decisions with more clarity.", copy: "Review debt structure, business-credit priorities, and funding questions worth a closer specialist conversation.", image: "/manus-storage/debt_7b15ca88.png", alt: "DREAMS Score Debt and Funding opportunity panel" },
  { id: "retirement", code: "R", channel: "Retirement", title: "Strengthen the benefits engine.", copy: "Explore retirement-plan efficiency, participation, and employee-benefit design through a focused business lens.", image: "/manus-storage/retirement_805f94c8.png", alt: "DREAMS Score Retirement opportunity panel" },
  { id: "expenses", code: "E", channel: "Expenses", title: "Stop overpaying where it matters most.", copy: "Surface questions around premiums, technology, and payroll taxes that may deserve a qualified cost review.", image: "/manus-storage/expenses_8162aaf9.png", alt: "DREAMS Score Expenses opportunity panel" },
  { id: "assets", code: "A", channel: "Assets", title: "Activate what already drives growth.", copy: "Connect people, digital presence, reputation, and customer signals into a more intentional growth conversation.", image: "/manus-storage/assets_31f1e512.png", alt: "DREAMS Score Assets opportunity panel" },
  { id: "credits", code: "M", channel: "Money & Tax Credits", title: "Explore overlooked opportunity paths.", copy: "Identify business-credit and tax-credit questions that could be worth taking to qualified specialists.", image: "/manus-storage/credits_68ffc36e.png", alt: "DREAMS Score Money and Tax Credits opportunity panel" },
  { id: "security", code: "S", channel: "Security", title: "Protect the enterprise you have built.", copy: "Review resilience, continuity, key-person, and technology-risk questions in one disciplined conversation.", image: "/manus-storage/security_56e53df1.png", alt: "DREAMS Score Security opportunity panel" },
];

function stepIndex(currentIndex: number, direction: -1 | 1) {
  return (currentIndex + direction + slides.length) % slides.length;
}

export function DreamsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    const timer = window.setInterval(() => setActiveIndex((current) => stepIndex(current, 1)), 7000);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  const selectSlide = (index: number) => setActiveIndex(index);
  const focusSlideTab = (index: number) => document.getElementById(`opportunity-tab-${index}`)?.focus();

  return (
    <section className="opportunity-carousel" id="opportunity-map" aria-roledescription="carousel" aria-label="DREAMS opportunity map">
      <div className="shell carousel-shell">
        <div className="carousel-topline">
          <div><span className="eyebrow">Opportunity map</span><span className="carousel-counter">{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span></div>
          <div className="carousel-controls">
            <button type="button" onClick={() => setActiveIndex((current) => stepIndex(current, -1))} aria-label="Previous opportunity panel"><ArrowLeft size={16} /></button>
            <button type="button" onClick={() => setIsPaused((paused) => !paused)} aria-label={isPaused ? "Resume automatic carousel" : "Pause automatic carousel"}>{isPaused ? <Play size={15} /> : <Pause size={15} />}</button>
            <button type="button" onClick={() => setActiveIndex((current) => stepIndex(current, 1))} aria-label="Next opportunity panel"><ArrowRight size={16} /></button>
          </div>
        </div>

        <div className="carousel-tabs" role="tablist" aria-label="Opportunity map panels">
          {slides.map((slide, index) => (
            <button
              id={`opportunity-tab-${index}`}
              role="tab"
              type="button"
              key={slide.id}
              aria-selected={activeIndex === index}
              aria-controls="opportunity-panel"
              tabIndex={activeIndex === index ? 0 : -1}
              onClick={() => selectSlide(index)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                event.preventDefault();
                const nextIndex = stepIndex(index, event.key === "ArrowRight" ? 1 : -1);
                selectSlide(nextIndex);
                focusSlideTab(nextIndex);
              }}
            >
              <span>{slide.code}</span><small>{slide.channel}</small>
            </button>
          ))}
        </div>

        <article className="carousel-panel" id="opportunity-panel" role="tabpanel" aria-labelledby={`opportunity-tab-${activeIndex}`} aria-live={isPaused || prefersReducedMotion ? "polite" : "off"}>
          <div className="carousel-copy" key={activeSlide.id}>
            <span className="carousel-channel">{activeSlide.code} · {activeSlide.channel}</span>
            <h2>{activeSlide.title}</h2>
            <p>{activeSlide.copy}</p>
            <span className="carousel-disclaimer">Educational opportunity review · estimate-based guidance</span>
            <Link href="/assessment" className="button button-primary">Start your assessment <ArrowRight size={16} /></Link>
          </div>
          <figure className="carousel-image" key={`${activeSlide.id}-image`}><img src={activeSlide.image} alt={activeSlide.alt} /></figure>
        </article>
      </div>
    </section>
  );
}
