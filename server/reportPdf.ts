import PDFDocument from "pdfkit";
import { z } from "zod";
import { formatEstimate, type DreamsReport } from "@shared/dreams";
type PdfDocumentInstance = InstanceType<typeof PDFDocument>;

const reportCategorySchema = z.object({
  code: z.enum(["D", "R", "E", "A", "M", "S"]),
  name: z.string().min(1).max(120),
  estimateKind: z.enum(["savings", "profit"]),
  total: z.number().finite(),
  summary: z.string().min(1).max(800),
  inputSummary: z.array(z.object({ label: z.string().max(100), value: z.string().max(200) })).max(12),
  opportunities: z.array(z.object({ title: z.string().max(160), amount: z.number().finite(), summary: z.string().max(1_200), nextAction: z.string().max(240) })).max(10),
});

export const brandedReportPdfInputSchema = z.object({
  report: z.object({
    companyName: z.string().min(1).max(160),
    industry: z.string().min(1).max(100),
    employeeCount: z.number().finite().nonnegative(),
    generatedAt: z.string().min(1).max(80),
    annualSavings: z.number().finite(),
    annualProfit: z.number().finite(),
    totalPotentialValue: z.number().finite(),
    categories: z.array(reportCategorySchema).length(6),
  }),
  coverMessage: z.string().trim().max(480).optional(),
});

const palette: Record<string, { accent: string; deep: string; soft: string }> = {
  D: { accent: "#4F7FCA", deep: "#285C9B", soft: "#E8F0FD" },
  R: { accent: "#3F9F73", deep: "#22714E", soft: "#E5F5EB" },
  E: { accent: "#C98431", deep: "#96601C", soft: "#FFF0DC" },
  A: { accent: "#8962C5", deep: "#62418D", soft: "#F0E9FB" },
  M: { accent: "#2997A5", deep: "#176C75", soft: "#E3F5F7" },
  S: { accent: "#CF5F8B", deep: "#9A3B60", soft: "#FDE8F0" },
};
const colors = { navy: "#101B30", ink: "#263342", muted: "#64727E", paper: "#FFFCF7", line: "#E4E9E4", teal: "#178F89", gold: "#B6904F" };

function drawPillarRule(doc: PdfDocumentInstance) {
  const x = 40;
  const width = (doc.page.width - 80) / 6;
  ["D", "R", "E", "A", "M", "S"].forEach((code, index) => doc.rect(x + index * width, 28, width, 5).fill(palette[code].accent));
}

function header(doc: PdfDocumentInstance, label: string) {
  drawPillarRule(doc);
  doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(8).text("DREAMS SCORE FOR BUSINESS", 40, 44);
  doc.fillColor(colors.muted).font("Helvetica").fontSize(8).text(label, 40, 56);
  doc.moveTo(40, 69).lineTo(doc.page.width - 40, 69).strokeColor(colors.line).lineWidth(1).stroke();
  doc.y = 92;
}

function footer(doc: PdfDocumentInstance, page: number) {
  doc.moveTo(40, doc.page.height - 44).lineTo(doc.page.width - 40, doc.page.height - 44).strokeColor(colors.line).lineWidth(1).stroke();
  doc.fillColor(colors.muted).font("Helvetica").fontSize(7).text("Estimate-based findings. A qualified specialist can provide a complete, personalized review.", 40, doc.page.height - 34, { width: doc.page.width - 120 });
  doc.fillColor(colors.navy).font("Helvetica-Bold").text(String(page).padStart(2, "0"), doc.page.width - 62, doc.page.height - 34, { width: 22, align: "right" });
}

function kpi(doc: PdfDocumentInstance, x: number, y: number, title: string, amount: string, copy: string, fill: string, accent: string) {
  doc.roundedRect(x, y, 160, 90, 8).fillAndStroke(fill, colors.line);
  doc.rect(x, y, 160, 3).fill(accent);
  doc.fillColor(colors.muted).font("Helvetica-Bold").fontSize(7).text(title.toUpperCase(), x + 12, y + 16, { width: 136 });
  doc.fillColor(accent).font("Helvetica-Bold").fontSize(18).text(amount, x + 12, y + 29, { width: 136 });
  doc.fillColor(colors.muted).font("Helvetica").fontSize(7).text(copy, x + 12, y + 56, { width: 136, lineGap: 2 });
}

function categoryRow(doc: PdfDocumentInstance, report: DreamsReport["categories"][number], y: number) {
  const theme = palette[report.code];
  doc.roundedRect(40, y, doc.page.width - 80, 46, 7).fillAndStroke(colors.paper, theme.soft);
  doc.rect(40, y, 4, 46).fill(theme.accent);
  doc.roundedRect(55, y + 13, 20, 20, 6).fill(theme.soft);
  doc.fillColor(theme.deep).font("Helvetica-Bold").fontSize(9).text(report.code, 55, y + 19, { width: 20, align: "center" });
  doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(10).text(report.name, 87, y + 11, { width: 265 });
  doc.fillColor(colors.muted).font("Helvetica").fontSize(7).text(report.estimateKind === "savings" ? "Estimated savings" : "Estimated profit potential", 87, y + 25, { width: 190 });
  doc.fillColor(theme.deep).font("Helvetica-Bold").fontSize(11).text(formatEstimate(report.total), doc.page.width - 160, y + 17, { width: 110, align: "right" });
}

function categoryPage(doc: PdfDocumentInstance, category: DreamsReport["categories"][number], page: number) {
  doc.addPage();
  const theme = palette[category.code];
  header(doc, `${category.code} · ${category.name.toUpperCase()}`);
  doc.roundedRect(40, 90, doc.page.width - 80, 78, 10).fill(theme.soft);
  doc.fillColor(theme.deep).font("Helvetica-Bold").fontSize(10).text(`${category.code}  ·  ${category.estimateKind === "savings" ? "ESTIMATED SAVINGS" : "ESTIMATED PROFIT"}`, 58, 108);
  doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(22).text(category.name, 58, 126, { width: 320 });
  doc.fillColor(theme.deep).font("Helvetica-Bold").fontSize(22).text(formatEstimate(category.total), 370, 126, { width: 164, align: "right" });
  doc.fillColor(colors.ink).font("Helvetica").fontSize(9).text(category.summary, 58, 179, { width: doc.page.width - 116, lineGap: 3 });
  let y = 222;
  doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(10).text("Snapshot", 40, y);
  y += 18;
  const inputs = category.inputSummary.slice(0, 6);
  inputs.forEach((input, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 40 + column * 255;
    const boxY = y + row * 42;
    doc.roundedRect(x, boxY, 235, 33, 6).fillAndStroke("#FFFFFF", colors.line);
    doc.fillColor(colors.muted).font("Helvetica").fontSize(7).text(input.label, x + 10, boxY + 8, { width: 205 });
    doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(9).text(input.value, x + 10, boxY + 19, { width: 205 });
  });
  y += Math.ceil(inputs.length / 2) * 42 + 17;
  doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(10).text("Opportunity map", 40, y);
  y += 18;
  category.opportunities.slice(0, 3).forEach((opportunity) => {
    const height = 73;
    doc.roundedRect(40, y, doc.page.width - 80, height, 8).fillAndStroke("#FFFFFF", theme.soft);
    doc.rect(40, y, 4, height).fill(theme.accent);
    doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(9).text(opportunity.title, 58, y + 12, { width: 275 });
    doc.fillColor(theme.deep).font("Helvetica-Bold").fontSize(11).text(`${formatEstimate(opportunity.amount)}/yr est.`, 365, y + 12, { width: 170, align: "right" });
    doc.fillColor(colors.ink).font("Helvetica").fontSize(7.5).text(opportunity.summary, 58, y + 29, { width: 465, height: 23, ellipsis: true, lineGap: 2 });
    doc.fillColor(theme.deep).font("Helvetica-Bold").fontSize(7.5).text(`Next step: ${opportunity.nextAction}`, 58, y + 55, { width: 465 });
    y += height + 10;
  });
  const calloutY = Math.min(y + 4, doc.page.height - 112);
  doc.roundedRect(40, calloutY, doc.page.width - 80, 41, 8).fill("#F5FAF7");
  doc.fillColor(colors.teal).font("Helvetica-Bold").fontSize(8).text("SPECIALIST REVIEW", 54, calloutY + 11);
  doc.fillColor(colors.ink).font("Helvetica").fontSize(8).text("Use this directional estimate to frame a focused follow-up conversation.", 54, calloutY + 23, { width: 440 });
  footer(doc, page);
}

export async function createBrandedReportPdf(report: DreamsReport, coverMessage?: string) {
  return new Promise<{ base64: string; filename: string; mimeType: string }>((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 0, info: { Title: `DREAMS Score — ${report.companyName}`, Author: "Dreams Business Resources", Subject: "DREAMS Score Report" } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => {
      const safeName = report.companyName.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase() || "dreams-score";
      resolve({ base64: Buffer.concat(chunks).toString("base64"), filename: `${safeName}-dreams-score-report.pdf`, mimeType: "application/pdf" });
    });

    header(doc, "BRANDED BUSINESS OPPORTUNITY REPORT");
    doc.fillColor(colors.teal).font("Helvetica-Bold").fontSize(8).text("DREAMS SCORE REPORT", 40, 96);
    doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(27).text(report.companyName, 40, 112, { width: 500 });
    doc.fillColor(colors.muted).font("Helvetica").fontSize(10).text(`${report.industry}  ·  ${report.employeeCount.toLocaleString()} employees  ·  Generated ${new Date(report.generatedAt).toLocaleDateString()}`, 40, 148, { width: 500 });
    doc.fillColor(colors.ink).font("Helvetica").fontSize(10).text("A colorful, directional opportunity map across six connected business pillars.", 40, 184, { width: 420 });
    if (coverMessage) {
      doc.roundedRect(40, 202, doc.page.width - 80, 20, 5).fill("#F4F8F5");
      doc.fillColor(colors.teal).font("Helvetica-Bold").fontSize(7).text("PERSONAL COVER MESSAGE", 50, 208, { width: 105 });
      doc.fillColor(colors.ink).font("Helvetica").fontSize(7.5).text(coverMessage, 160, 208, { width: doc.page.width - 210, height: 10, ellipsis: true });
    }
    const kpiY = 232;
    kpi(doc, 40, kpiY, "Annual savings", formatEstimate(report.annualSavings), "Expense reduction, retirement, tax credits and protection.", "#E5F5EB", "#22714E");
    kpi(doc, 216, kpiY, "Increased profit", formatEstimate(report.annualProfit), "Funding access, asset optimization and growth.", "#FFF0DC", "#96601C");
    kpi(doc, 392, kpiY, "Potential value", formatEstimate(report.totalPotentialValue), "Combined estimated savings and profit opportunity.", "#E8F0FD", "#285C9B");
    doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(12).text("Six connected pillars", 40, 360);
    doc.fillColor(colors.muted).font("Helvetica").fontSize(8.5).text("Each color follows a business lens from your inputs through the opportunity details that follow.", 40, 377, { width: 455 });
    let overviewY = 412;
    report.categories.forEach((category) => { categoryRow(doc, category, overviewY); overviewY += 55; });
    footer(doc, 1);
    report.categories.forEach((category, index) => categoryPage(doc, category, index + 2));
    doc.end();
  });
}
