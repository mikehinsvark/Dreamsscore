import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { emptyAssessment } from "../shared/dreams";

const dbMocks = vi.hoisted(() => ({
  createAssessmentReport: vi.fn(),
  getAssessmentReportById: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("dreams.createReport", () => {
  beforeEach(() => {
    dbMocks.createAssessmentReport.mockReset();
    dbMocks.getAssessmentReportById.mockReset();
    dbMocks.createAssessmentReport.mockResolvedValue(undefined);
  });

  it("calculates and persists a public assessment report snapshot", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const response = await caller.dreams.createReport({
      ...emptyAssessment,
      companyName: "Summit Industrial",
      contactName: "Jordan Lee",
      email: "jordan@summit.example",
      phone: "555-010-0200",
      title: "President",
      website: "summit.example",
    });

    expect(response.id).toHaveLength(12);
    expect(response.report.companyName).toBe("Summit Industrial");
    expect(response.report.totalPotentialValue).toBe(response.report.annualSavings + response.report.annualProfit);
    expect(dbMocks.createAssessmentReport).toHaveBeenCalledWith(expect.objectContaining({
      id: response.id,
      companyName: "Summit Industrial",
      reportJson: response.report,
      annualSavings: response.report.annualSavings.toFixed(2),
      annualProfit: response.report.annualProfit.toFixed(2),
    }));
  });
});
