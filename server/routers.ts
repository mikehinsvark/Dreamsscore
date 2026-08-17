import { COOKIE_NAME } from "@shared/const";
import { assessmentInputSchema, calculateDreamsReport } from "@shared/dreams";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createAssessmentReport, getAssessmentReportById } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  dreams: router({
    createReport: publicProcedure.input(assessmentInputSchema).mutation(async ({ input }) => {
      const report = calculateDreamsReport(input);
      const id = nanoid(12);

      await createAssessmentReport({
        id,
        companyName: input.companyName,
        contactName: input.contactName,
        email: input.email,
        industry: input.industry,
        payload: input,
        reportJson: report,
        annualSavings: report.annualSavings.toFixed(2),
        annualProfit: report.annualProfit.toFixed(2),
        totalPotentialValue: report.totalPotentialValue.toFixed(2),
      });

      return { id, report };
    }),
    getReport: publicProcedure
      .input(z.object({ id: z.string().min(8).max(32) }))
      .query(async ({ input }) => {
        const record = await getAssessmentReportById(input.id);
        if (!record) {
          return null;
        }
        return record;
      }),
  }),
});

export type AppRouter = typeof appRouter;
