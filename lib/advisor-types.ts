import type { FinancialInsight } from "./insight-types";

export type AdvisorContext = {
  netWorthMinor: number;
  liquidAssetsMinor: number;
  investmentAssetsMinor: number;
  monthlyIncomeMinor: number;
  monthlyExpensesMinor: number;
  monthlySurplusMinor: number;
  financialHealthScore: number;
  forecastEndingBalanceMinor: number;
  forecastLowestBalanceMinor: number;
  forecastLowestBalanceDate: string;
  goalProgressPercentage: number | null;
  topInsights: FinancialInsight[];
};

export type AdvisorQuestionCategory =
  | "affordability"
  | "investing"
  | "saving"
  | "cashflow"
  | "general";

export type AdvisorQuestion = {
  text: string;
  category: AdvisorQuestionCategory;
};

export type AdvisorDraftAnswer = {
  category: AdvisorQuestionCategory;
  headline: string;
  summary: string;
  supportingPoints: string[];
  disclaimer: string;
};
