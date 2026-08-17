import { decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import type { AssessmentInput, DreamsReport } from "../shared/dreams";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * A public assessment is stored with its input payload and the snapshot report
 * generated at submission time, so later reads remain consistent with the result shown.
 */
export const assessmentReports = mysqlTable("assessmentReports", {
  id: varchar("id", { length: 32 }).primaryKey(),
  companyName: varchar("companyName", { length: 160 }).notNull(),
  contactName: varchar("contactName", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  industry: varchar("industry", { length: 120 }).notNull(),
  payload: json("payload").$type<AssessmentInput>().notNull(),
  reportJson: json("reportJson").$type<DreamsReport>().notNull(),
  annualSavings: decimal("annualSavings", { precision: 14, scale: 2 }).notNull(),
  annualProfit: decimal("annualProfit", { precision: 14, scale: 2 }).notNull(),
  totalPotentialValue: decimal("totalPotentialValue", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AssessmentReport = typeof assessmentReports.$inferSelect;
export type InsertAssessmentReport = typeof assessmentReports.$inferInsert;
