import { ArrowDown, ArrowUp, ListTree } from "lucide-react";
import { useEffect, useState } from "react";
import type { SectionIndexItem } from "@shared/navigation";

export function SectionNavigator({ items }: { items: SectionIndexItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const trackedSections = items.map((item) => document.getElementById(item.id)).filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => right.intersectionRatio - left.intersectionRatio);
      const current = visible[0]?.target.id;
      const currentIndex = items.findIndex((item) => item.id === current);
      if (currentIndex >= 0) setActiveIndex(currentIndex);
    }, { rootMargin: "-28% 0px -58% 0px", threshold: [0.1, 0.35, 0.65] });

    trackedSections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (index: number) => {
    const target = items[index];
    if (!target) return;
    document.getElementById(target.id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  const current = items[activeIndex];
  return (
    <aside className="section-navigator" aria-label="Page section navigator">
      <span className="section-navigator-icon" aria-hidden="true"><ListTree size={15} /></span>
      <button type="button" onClick={() => scrollToSection(activeIndex - 1)} disabled={activeIndex === 0} aria-label={`Previous section${activeIndex > 0 ? `: ${items[activeIndex - 1]?.label}` : ""}`}><ArrowUp size={17} /></button>
      <a href={`#${current.id}`} aria-label={`Current section: ${current.label}`}><small>{String(activeIndex + 1).padStart(2, "0")}</small><span>{current.label}</span></a>
      <button type="button" onClick={() => scrollToSection(activeIndex + 1)} disabled={activeIndex === items.length - 1} aria-label={`Next section${activeIndex < items.length - 1 ? `: ${items[activeIndex + 1]?.label}` : ""}`}><ArrowDown size={17} /></button>
    </aside>
  );
}
