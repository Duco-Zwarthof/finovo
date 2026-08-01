import type { TransactionCategory } from "./types";

export const BUDGET_CATEGORIES = [
  "Housing",
  "Groceries",
  "Transport",
  "Entertainment",
  "Subscriptions",
  "Other",
] as const satisfies readonly TransactionCategory[];

export type BudgetCategory =
  (typeof BUDGET_CATEGORIES)[number];

export type BudgetMonth = string;

export type Budget = {
  id: string;
  month: BudgetMonth;
  category: BudgetCategory;
  limitMinor: number;
};

export type BudgetStatus =
  | "unused"
  | "on-track"
  | "near-limit"
  | "over-budget";

export type BudgetProgress = {
  budgetId: string;
  month: BudgetMonth;
  category: BudgetCategory;
  limitMinor: number;
  spentMinor: number;
  remainingMinor: number;
  usagePercentage: number | null;
  status: BudgetStatus;
  transactionCount: number;
};

export type MonthlyBudgetSummary = {
  month: BudgetMonth;
  totalLimitMinor: number;
  totalSpentMinor: number;
  totalRemainingMinor: number;
  unbudgetedSpentMinor: number;
  usagePercentage: number | null;
  budgetedCategoryCount: number;
  overBudgetCategoryCount: number;
};
