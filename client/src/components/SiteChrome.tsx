import { ArrowUp, BarChart3, ChevronRight, Menu, Sparkles, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { destinations } from "@/lib/destinations";
import type { SectionIndexItem } from "@shared/navigation";

const navItems = [
  { label: "Overview", href: "/#overview" },
  { label: "Six pillars", href: "/#six-pillars" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Sample dashboard", href: "/sample-report/peak-manufacturing" },
];

export function BrandMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`brand-mark ${inverted ? "brand-mark-inverted" : ""}`} aria-hidden="true">
      <BarChart3 size={17} strokeWidth={2.7} />
    </span>
  );
}

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const drawerRef = useRef<HTMLElement>(null);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const drawer = drawerRef.current;
    const firstFocusable = drawer?.querySelector<HTMLElement>("a, button");
    firstFocusable?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab" || !drawer) return;
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>("a, button:not([disabled])"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [menuOpen]);

  useEffect(() => {
    closeMenu();
  }, [location]);

  return (
    <header className={`site-header ${compact ? "site-header-compact" : ""}`}>
      <div className="shell site-header-inner">
        <Link href="/" className="brand-lockup" aria-label="DREAMS Score Online home">
          <BrandMark />
          <span className="brand-wordmark">DREAMS <small>Score Online</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/assessment" className="button button-primary button-small">
            Start assessment <ChevronRight size={15} />
          </Link>
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}<span>Menu</span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <>
          <button className="mobile-menu-scrim" type="button" aria-label="Close menu" onClick={closeMenu} />
          <nav id="mobile-navigation" className="mobile-nav" ref={drawerRef} aria-label="Mobile navigation">
            <div className="mobile-nav-top"><span className="eyebrow">Navigate</span><button className="mobile-nav-close" type="button" onClick={closeMenu}>Close <X size={16} /></button></div>
            {navItems.map((item) => (
              <a href={item.href} onClick={closeMenu} key={item.label}>{item.label}<ChevronRight size={16} /></a>
            ))}
            <Link href="/ai-visibility" onClick={closeMenu}>AI visibility <ChevronRight size={16} /></Link>
            <Link href="/assessment" className="button button-primary" onClick={closeMenu}>Start assessment <ChevronRight size={16} /></Link>
          </nav>
        </>
      )}
      <BackToTop />
    </header>
  );
}

export function PageIndex({ items, className = "" }: { items: SectionIndexItem[]; className?: string }) {
  return (
    <nav className={`page-index ${className}`} aria-label="On this page">
      <span className="page-index-label">On this page</span>
      <div className="page-index-links">
        {items.map((item) => <a href={`#${item.id}`} key={item.id}>{item.label}</a>)}
      </div>
    </nav>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 520);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;
  return <button className="back-to-top" type="button" aria-label="Back to top" onClick={() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }}><ArrowUp size={16} /><span>Top</span></button>;
}

const guideCopy: Array<{ match: string; note: string }> = [
  {
    match: "/assessment",
    note: "I’ll help you move through each section. Your inputs are used to prepare directional estimates—not guarantees.",
  },
  {
    match: "/report",
    note: "Your report organizes potential opportunities for review. A qualified specialist can help validate what applies to your business.",
  },
  {
    match: "/ai-visibility",
    note: "I’ll help you frame a quick first look at how discoverable your business may be in AI-assisted search.",
  },
  {
    match: "/",
    note: "Welcome. In about 15 minutes, you can see directional savings, profit, and protection opportunities across six business areas.",
  },
];

export function RobertGuide() {
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(true);
  const matchedCopy = guideCopy.find((item) => location.startsWith(item.match)) ?? guideCopy[3];

  return (
    <aside className={`robert-guide ${expanded ? "is-expanded" : "is-collapsed"}`} aria-label="Robert, your AI DREAMS Guide">
      <button className="robert-head" type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <span className="robert-avatar"><Sparkles size={16} /></span>
        {expanded && <span><strong>Robert</strong><small>Your AI DREAMS Guide</small></span>}
        <span className="robert-toggle">{expanded ? <X size={15} /> : <Sparkles size={15} />}</span>
      </button>
      {expanded && (
        <div className="robert-body">
          <p>{matchedCopy.note}</p>
          <span className="robert-status">Guidance mode · no live chat enabled</span>
        </div>
      )}
    </aside>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" id="booking">
      <div className="shell footer-grid">
        <div>
          <div className="brand-lockup footer-brand"><BrandMark inverted /><span className="brand-wordmark">DREAMS <small>Score Online</small></span></div>
          <p>Financial-health conversations become clearer when the right questions are asked in the right order.</p>
        </div>
        <div>
          <span className="eyebrow">Next step</span>
          <h3><a href={destinations.booking}>Book a review conversation.</a></h3>
          <p>When a booking destination is not configured, this link safely returns visitors to this on-page review section.</p>
        </div>
        <div className="footer-meta">
          <span>15-minute assessment</span>
          <span>Estimate-based findings</span>
          <span>© Dreams Business Resources 2026</span>
        </div>
      </div>
    </footer>
  );
}
