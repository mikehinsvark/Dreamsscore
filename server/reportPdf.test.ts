import { describe, expect, it } from "vitest";
import { calculateDreamsReport, emptyAssessment } from "@shared/dreams";
import { createBrandedReportPdf } from "./reportPdf";
describe("branded report PDF",()=>{it("creates a downloadable multi-page PDF from the authoritative report model",async()=>{const report=calculateDreamsReport({...emptyAssessment,companyName:"Colorful Test Company",email:"test@example.com"});const result=await createBrandedReportPdf(report),bytes=Buffer.from(result.base64,"base64");expect(result.mimeType).toBe("application/pdf");expect(result.filename).toBe("colorful-test-company-dreams-score-report.pdf");expect(bytes.subarray(0,5).toString()).toBe("%PDF-");expect(bytes.byteLength).toBeGreaterThan(10_000);});});
