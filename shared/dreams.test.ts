import { describe, expect, it } from "vitest";
import { calculateDreamsReport, emptyAssessment } from "./dreams";

describe("calculateDreamsReport", () => {
  it("returns six transparent category estimates and reconciles the headline totals", () => {
    const report = calculateDreamsReport({
      ...emptyAssessment,
      companyName: "Northstar Fabrication",
      annualResearchSpend: 240_000,
      employeeCount: 80,
    });

    expect(report.categories).toHaveLength(6);
    expect(report.categories.map((category) => category.code)).toEqual(["D", "R", "E", "A", "M", "S"]);
    expect(report.annualSavings).toBeGreaterThan(0);
    expect(report.annualProfit).toBeGreaterThan(0);
    expect(report.totalPotentialValue).toBe(report.annualSavings + report.annualProfit);
    expect(report.categories.find((category) => category.code === "M")?.total).toBeGreaterThan(0);
  });

  it("does not create negative estimates when optional opportunity inputs are zero", () => {
    const report = calculateDreamsReport({
      ...emptyAssessment,
      companyName: "Cedar Works",
      fundingDesired: 0,
      currentDebt: 0,
      monthlyDebtPayments: 0,
      annualResearchSpend: 0,
      annualTipWages: 0,
      expectedStateCredits: 0,
      solarInterest: false,
    });

    expect(report.categories.every((category) => category.total >= 0)).toBe(true);
    expect(report.categories.find((category) => category.code === "D")?.total).toBe(0);
  });
});
