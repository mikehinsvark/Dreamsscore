import { z } from "zod";

export const dreamsCategoryCodes = ["D", "R", "E", "A", "M", "S"] as const;
export type DreamsCategoryCode = (typeof dreamsCategoryCodes)[number];
export type EstimateKind = "savings" | "profit";

const estimatedAmount = z.number().min(0).max(10_000_000_000);

export const assessmentInputSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(7).max(30),
  title: z.string().trim().min(2).max(120),
  website: z.string().trim().max(200),
  industry: z.string().trim().min(2).max(120),
  salesType: z.enum(["B2B", "B2C", "Both"]),
  annualRevenue: estimatedAmount,
  employeeCount: z.number().int().min(1).max(1_000_000),
  yearsInBusiness: z.number().int().min(0).max(250),
  buildingSquareFeet: estimatedAmount,
  fundingDesired: estimatedAmount,
  currentDebt: estimatedAmount,
  monthlyDebtPayments: estimatedAmount,
  creditProfile: z.enum(["Excellent", "Good", "Fair", "Building"]),
  retirementAssets: estimatedAmount,
  annualRetirementContributions: estimatedAmount,
  employerMatch: z.number().min(0).max(100),
  retirementParticipation: z.number().min(0).max(100),
  annualHealthSpend: estimatedAmount,
  annualBenefitsSpend: estimatedAmount,
  annualEnergySpend: estimatedAmount,
  solarInterest: z.boolean(),
  monthlyWebsiteLeads: z.number().int().min(0).max(100_000_000),
  averageLeadValue: estimatedAmount,
  monthlyMarketingSpend: estimatedAmount,
  reputationFocus: z.boolean(),
  annualResearchSpend: estimatedAmount,
  annualTipWages: estimatedAmount,
  expectedStateCredits: estimatedAmount,
  annualLifePremiums: estimatedAmount,
  keyPersonCount: z.number().int().min(0).max(10_000),
  monthlyItSpend: estimatedAmount,
});

export type AssessmentInput = z.infer<typeof assessmentInputSchema>;

export type Opportunity = {
  title: string;
  amount: number;
  summary: string;
  nextAction: string;
};

export type DreamCategoryReport = {
  code: DreamsCategoryCode;
  name: string;
  estimateKind: EstimateKind;
  total: number;
  summary: string;
  inputSummary: Array<{ label: string; value: string }>;
  opportunities: Opportunity[];
};

export type DreamsReport = {
  companyName: string;
  industry: string;
  employeeCount: number;
  generatedAt: string;
  annualSavings: number;
  annualProfit: number;
  totalPotentialValue: number;
  categories: DreamCategoryReport[];
};

export const emptyAssessment: AssessmentInput = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  title: "",
  website: "",
  industry: "Professional Services",
  salesType: "B2B",
  annualRevenue: 2_500_000,
  employeeCount: 25,
  yearsInBusiness: 5,
  buildingSquareFeet: 5_000,
  fundingDesired: 250_000,
  currentDebt: 180_000,
  monthlyDebtPayments: 8_500,
  creditProfile: "Good",
  retirementAssets: 1_200_000,
  annualRetirementContributions: 120_000,
  employerMatch: 4,
  retirementParticipation: 60,
  annualHealthSpend: 300_000,
  annualBenefitsSpend: 125_000,
  annualEnergySpend: 80_000,
  solarInterest: false,
  monthlyWebsiteLeads: 45,
  averageLeadValue: 4_500,
  monthlyMarketingSpend: 12_000,
  reputationFocus: true,
  annualResearchSpend: 150_000,
  annualTipWages: 0,
  expectedStateCredits: 12_000,
  annualLifePremiums: 45_000,
  keyPersonCount: 2,
  monthlyItSpend: 8_000,
};

const roundEstimate = (value: number) => Math.max(0, Math.round(value / 50) * 50);

const usd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Produces transparent, directional estimates from assessment inputs. It is not
 * a financial projection or guarantee and deliberately exposes the inputs used.
 */
export function calculateDreamsReport(input: AssessmentInput): DreamsReport {
  const debtFunding = roundEstimate(
    input.fundingDesired * 0.08 + input.currentDebt * 0.12 + input.monthlyDebtPayments * 2,
  );
  const retirement = roundEstimate(
    input.annualRetirementContributions * 0.18 +
      input.retirementAssets * 0.003 +
      input.employeeCount * 180,
  );
  const expenseReduction = roundEstimate(
    input.annualHealthSpend * 0.12 +
      input.annualBenefitsSpend * 0.1 +
      input.annualEnergySpend * 0.15 +
      (input.solarInterest ? input.buildingSquareFeet * 0.7 : 0),
  );
  const assetOptimization = roundEstimate(
    input.monthlyWebsiteLeads * input.averageLeadValue * 12 * 0.12 +
      input.monthlyMarketingSpend * 12 * 0.15 +
      (input.reputationFocus ? input.annualRevenue * 0.006 : 0),
  );
  const moneyTaxCredits = roundEstimate(
    input.annualResearchSpend * 0.1 + input.annualTipWages * 0.08 + input.expectedStateCredits,
  );
  const securityProtection = roundEstimate(
    input.annualLifePremiums * 0.12 + input.keyPersonCount * 3_000 + input.monthlyItSpend * 12 * 0.1,
  );

  const categories: DreamCategoryReport[] = [
    {
      code: "D",
      name: "Debt & Corporate Funding",
      estimateKind: "profit",
      total: debtFunding,
      summary: "Potential cash-flow and access-to-capital opportunity based on the funding and debt inputs provided.",
      inputSummary: [
        { label: "Funding desired", value: usd(input.fundingDesired) },
        { label: "Current business debt", value: usd(input.currentDebt) },
        { label: "Monthly debt payments", value: usd(input.monthlyDebtPayments) },
        { label: "Credit profile", value: input.creditProfile },
      ],
      opportunities: [
        {
          title: "Business Funding Review",
          amount: roundEstimate(input.fundingDesired * 0.08),
          summary: "A funding review can help evaluate capital options for equipment, working capital, and expansion priorities.",
          nextAction: "Discuss capital options with a funding specialist",
        },
        {
          title: "Debt Restructuring Review",
          amount: roundEstimate(input.currentDebt * 0.12 + input.monthlyDebtPayments * 2),
          summary: "Debt structure and payment timing may reveal opportunities to improve cash flow and support growth planning.",
          nextAction: "Review current debt structure",
        },
      ],
    },
    {
      code: "R",
      name: "Employee 401(k) & Retirement",
      estimateKind: "savings",
      total: retirement,
      summary: "Potential annual plan-efficiency estimate based on contribution, balance, and employee participation inputs.",
      inputSummary: [
        { label: "Retirement assets", value: usd(input.retirementAssets) },
        { label: "Annual contributions", value: usd(input.annualRetirementContributions) },
        { label: "Employer match", value: `${input.employerMatch}%` },
        { label: "Participation rate", value: `${input.retirementParticipation}%` },
      ],
      opportunities: [
        {
          title: "401(k) Plan Optimization",
          amount: roundEstimate(input.annualRetirementContributions * 0.18 + input.employeeCount * 180),
          summary: "Plan design, fee analysis, and employee engagement can be reviewed by a qualified retirement specialist.",
          nextAction: "Request a retirement-plan review",
        },
        {
          title: "Protected Growth Review",
          amount: roundEstimate(input.retirementAssets * 0.003),
          summary: "A specialist can evaluate applicable options for long-term retirement assets and participant education.",
          nextAction: "Discuss retirement asset options",
        },
      ],
    },
    {
      code: "E",
      name: "Expense Reduction",
      estimateKind: "savings",
      total: expenseReduction,
      summary: "Potential operating-cost reduction estimate based on benefits, health, energy, and building inputs.",
      inputSummary: [
        { label: "Annual health spend", value: usd(input.annualHealthSpend) },
        { label: "Annual benefits spend", value: usd(input.annualBenefitsSpend) },
        { label: "Annual energy spend", value: usd(input.annualEnergySpend) },
        { label: "Building size", value: `${input.buildingSquareFeet.toLocaleString()} sq ft` },
      ],
      opportunities: [
        {
          title: "Benefits & Section 125 Review",
          amount: roundEstimate(input.annualHealthSpend * 0.12 + input.annualBenefitsSpend * 0.1),
          summary: "A benefits review can identify administrative and plan-design questions worth investigating with licensed providers.",
          nextAction: "Schedule a benefits review",
        },
        {
          title: "Energy Cost Review",
          amount: roundEstimate(input.annualEnergySpend * 0.15 + (input.solarInterest ? input.buildingSquareFeet * 0.7 : 0)),
          summary: "Energy usage and relevant solar considerations can be reviewed for operational efficiency opportunities.",
          nextAction: "Request an energy review",
        },
      ],
    },
    {
      code: "A",
      name: "Asset Optimization",
      estimateKind: "profit",
      total: assetOptimization,
      summary: "Potential profit-improvement estimate based on lead flow, lead value, marketing investment, and reputation focus.",
      inputSummary: [
        { label: "Monthly website leads", value: input.monthlyWebsiteLeads.toLocaleString() },
        { label: "Average lead value", value: usd(input.averageLeadValue) },
        { label: "Monthly marketing spend", value: usd(input.monthlyMarketingSpend) },
        { label: "Reputation focus", value: input.reputationFocus ? "Yes" : "Not currently" },
      ],
      opportunities: [
        {
          title: "DREAMS Leads & Intent Data",
          amount: roundEstimate(input.monthlyWebsiteLeads * input.averageLeadValue * 12 * 0.12),
          summary: "A lead-quality review can reveal where qualified demand, follow-up, and conversion are being lost.",
          nextAction: "Discuss lead-generation priorities",
        },
        {
          title: "Reputation & Interactive AI Marketing",
          amount: roundEstimate(input.monthlyMarketingSpend * 12 * 0.15 + (input.reputationFocus ? input.annualRevenue * 0.006 : 0)),
          summary: "Review how reputation management and interactive digital experiences could support the current marketing mix.",
          nextAction: "Explore asset-optimization options",
        },
      ],
    },
    {
      code: "M",
      name: "Money & Tax Credits",
      estimateKind: "savings",
      total: moneyTaxCredits,
      summary: "Potential credit opportunity estimate based on research spend, tip wages, and known state-credit inputs.",
      inputSummary: [
        { label: "Annual research spend", value: usd(input.annualResearchSpend) },
        { label: "Annual tip wages", value: usd(input.annualTipWages) },
        { label: "Expected state credits", value: usd(input.expectedStateCredits) },
      ],
      opportunities: [
        {
          title: "R&D Tax Credit Review",
          amount: roundEstimate(input.annualResearchSpend * 0.1),
          summary: "A tax-credit specialist can determine whether qualified activities and expenses may support a formal claim.",
          nextAction: "Request an R&D credit review",
        },
        {
          title: "FICA & State Credit Review",
          amount: roundEstimate(input.annualTipWages * 0.08 + input.expectedStateCredits),
          summary: "A focused review can identify applicable FICA tip and state-credit questions for a qualified professional.",
          nextAction: "Discuss relevant tax-credit programs",
        },
      ],
    },
    {
      code: "S",
      name: "Security & Protection",
      estimateKind: "savings",
      total: securityProtection,
      summary: "Potential cost-avoidance and protection estimate based on life-insurance, key-person, and IT inputs.",
      inputSummary: [
        { label: "Annual life premiums", value: usd(input.annualLifePremiums) },
        { label: "Key-person roles", value: input.keyPersonCount.toString() },
        { label: "Monthly IT spend", value: usd(input.monthlyItSpend) },
      ],
      opportunities: [
        {
          title: "Corporate Life & Key-Person Review",
          amount: roundEstimate(input.annualLifePremiums * 0.12 + input.keyPersonCount * 3_000),
          summary: "A protection review can help determine whether key-person coverage and business-continuity strategies merit specialist review.",
          nextAction: "Review protection priorities",
        },
        {
          title: "Cloud & IT Security Review",
          amount: roundEstimate(input.monthlyItSpend * 12 * 0.1),
          summary: "A technical review can identify security and cloud-cost questions appropriate for an IT specialist.",
          nextAction: "Schedule a technology review",
        },
      ],
    },
  ];

  const annualSavings = categories
    .filter((category) => category.estimateKind === "savings")
    .reduce((sum, category) => sum + category.total, 0);
  const annualProfit = categories
    .filter((category) => category.estimateKind === "profit")
    .reduce((sum, category) => sum + category.total, 0);

  return {
    companyName: input.companyName,
    industry: input.industry,
    employeeCount: input.employeeCount,
    generatedAt: new Date().toISOString(),
    annualSavings,
    annualProfit,
    totalPotentialValue: annualSavings + annualProfit,
    categories,
  };
}

export const formatEstimate = (value: number) => usd(value);
