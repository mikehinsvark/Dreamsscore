import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { calculateDreamsReport, emptyAssessment } from "@shared/dreams";
import { ReportView } from "@/components/ReportView";
import { RobertGuide, SiteFooter, SiteHeader } from "@/components/SiteChrome";

const peakManufacturing = calculateDreamsReport({
  ...emptyAssessment,
  companyName: "Peak Manufacturing, LLC",
  contactName: "Sarah Mitchell",
  email: "sarah@peakmanufacturing.example",
  phone: "555-014-8624",
  title: "CEO",
  website: "peakmanufacturing.example",
  industry: "Manufacturing",
  annualRevenue: 18_500_000,
  employeeCount: 85,
  yearsInBusiness: 16,
  buildingSquareFeet: 65_000,
  fundingDesired: 300_000,
  currentDebt: 450_000,
  monthlyDebtPayments: 12_000,
  retirementAssets: 3_800_000,
  annualRetirementContributions: 280_000,
  annualHealthSpend: 540_000,
  annualBenefitsSpend: 260_000,
  annualEnergySpend: 260_000,
  solarInterest: true,
  monthlyWebsiteLeads: 55,
  averageLeadValue: 7_500,
  monthlyMarketingSpend: 24_000,
  annualResearchSpend: 5_500_000,
  annualLifePremiums: 180_000,
  keyPersonCount: 5,
  monthlyItSpend: 16_000,
});

export default function SampleReport() {
  return <div className="app-page report-page"><SiteHeader compact />
    <main className="report-main shell"><Link href="/" className="back-link"><ArrowLeft size={15} /> Back to home</Link><ReportView report={peakManufacturing} sample /></main>
    <SiteFooter /><RobertGuide />
  </div>;
}
