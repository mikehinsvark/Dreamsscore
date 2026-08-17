export type SectionIndexItem = {
  id: string;
  label: string;
};

export const landingSectionIndex: SectionIndexItem[] = [
  { id: "overview", label: "Overview" },
  { id: "opportunity-map", label: "Opportunity map" },
  { id: "six-pillars", label: "Six pillars" },
  { id: "how-it-works", label: "How it works" },
  { id: "sample-dashboard", label: "Sample dashboard" },
  { id: "goals-and-scenarios", label: "Goals & scenarios" },
  { id: "resources", label: "Resources" },
  { id: "faq", label: "FAQ" },
  { id: "book-a-review", label: "Book a review" },
];

export function adjacentSectionIndex(currentIndex: number, totalItems: number, direction: -1 | 1) {
  return Math.min(Math.max(currentIndex + direction, 0), Math.max(totalItems - 1, 0));
}

export const reportSectionIndex: SectionIndexItem[] = [
  { id: "financial-summary", label: "Financial summary" },
  { id: "category-scores", label: "Category scores" },
  { id: "recommendations", label: "Recommendations" },
  { id: "consultation", label: "Consultation" },
];
