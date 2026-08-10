import type { CashflowForecast } from "./cashflow-forecast-types";
import type { FinancialHealthResult } from "./financial-health-types";
import type { FinancialInsight } from "./insight-types";
import type { FinancialOverview } from "./net-worth-types";
import type {
  AdvisorContext,
  AdvisorDraftAnswer,
  AdvisorQuestion,
  AdvisorQuestionCategory,
} from "./advisor-types";
import { formatCurrency } from "./money";
import { amountMinorToEuroAmount } from "./transaction-amount";

function formatMinorCurrency(
  amountMinor: number
): string {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export function classifyAdvisorQuestion(
  text: string
): AdvisorQuestionCategory {
  const normalized = text.toLowerCase();

  if (
    normalized.includes("afford") ||
    normalized.includes("buy") ||
    normalized.includes("holiday") ||
    normalized.includes("vacation")
  ) {
    return "affordability";
  }

  if (
    normalized.includes("invest") ||
    normalized.includes("portfolio") ||
    normalized.includes("etf")
  ) {
    return "investing";
  }

  if (
    normalized.includes("save") ||
    normalized.includes("goal") ||
    normalized.includes("deposit")
  ) {
    return "saving";
  }

  if (
    normalized.includes("cashflow") ||
    normalized.includes("cash flow") ||
    normalized.includes("balance") ||
    normalized.includes("expenses")
  ) {
    return "cashflow";
  }

  return "general";
}

export function createAdvisorContext(
  overview: FinancialOverview,
  health: FinancialHealthResult,
  forecast: CashflowForecast,
  insights: readonly FinancialInsight[]
): AdvisorContext {
  const lowestPoint = forecast.points.reduce(
    (lowest, point) =>
      point.balanceMinor < lowest.balanceMinor
        ? point
        : lowest,
    forecast.points[0] ?? {
      date: forecast.startDate,
      balanceMinor:
        forecast.startingBalanceMinor,
    }
  );

  return {
    netWorthMinor: overview.netWorthMinor,
    liquidAssetsMinor:
      overview.liquidAssetsMinor,
    investmentAssetsMinor:
      overview.investmentAssetsMinor,
    monthlyIncomeMinor:
      overview.monthlyIncomeMinor,
    monthlyExpensesMinor:
      overview.monthlyExpensesMinor,
    monthlySurplusMinor:
      overview.monthlySurplusMinor,
    financialHealthScore: health.score,
    forecastEndingBalanceMinor:
      forecast.endingBalanceMinor,
    forecastLowestBalanceMinor:
      lowestPoint.balanceMinor,
    forecastLowestBalanceDate:
      lowestPoint.date,
    goalProgressPercentage:
      overview.goalProgressPercentage,
    topInsights: insights.slice(0, 5),
  };
}

export function createAdvisorQuestion(
  text: string
): AdvisorQuestion {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    throw new TypeError(
      "Advisor question cannot be empty"
    );
  }

  return {
    text: trimmed,
    category:
      classifyAdvisorQuestion(trimmed),
  };
}

export function createAdvisorDraftAnswer(
  question: AdvisorQuestion,
  context: AdvisorContext
): AdvisorDraftAnswer {
  const basePoints = [
    `Current liquid assets: ${formatMinorCurrency(
      context.liquidAssetsMinor
    )}.`,
    `Current monthly surplus: ${formatMinorCurrency(
      context.monthlySurplusMinor
    )}.`,
    `Lowest projected balance: ${formatMinorCurrency(
      context.forecastLowestBalanceMinor
    )} on ${context.forecastLowestBalanceDate}.`,
    `Financial Health Score: ${context.financialHealthScore}/100.`,
  ];

  switch (question.category) {
    case "affordability":
      return {
        category: question.category,
        headline:
          "Affordability depends on your cash buffer and forecast.",
        summary:
          "Finovo would evaluate the purchase against your liquid assets, monthly surplus and lowest projected balance before drawing a conclusion.",
        supportingPoints: basePoints,
        disclaimer:
          "This is an informational planning summary, not personal financial advice.",
      };

    case "investing":
      return {
        category: question.category,
        headline:
          "Extra investing should be weighed against your cash buffer.",
        summary:
          "Finovo would compare additional investing with your projected cash position and current monthly surplus.",
        supportingPoints: [
          ...basePoints,
          `Current investment assets: ${formatMinorCurrency(
            context.investmentAssetsMinor
          )}.`,
        ],
        disclaimer:
          "Investment outcomes are uncertain and this is not investment advice.",
      };

    case "saving":
      return {
        category: question.category,
        headline:
          "Your savings progress can be assessed against current cash flow.",
        summary:
          "Finovo would combine your goal progress with your monthly surplus and forecast to estimate how sustainable additional saving may be.",
        supportingPoints: [
          ...basePoints,
          `Combined goal progress: ${
            context.goalProgressPercentage ===
            null
              ? "not available"
              : `${Math.round(
                  context.goalProgressPercentage *
                    10
                ) / 10}%`
          }.`,
        ],
        disclaimer:
          "This is an informational planning summary, not personal financial advice.",
      };

    case "cashflow":
      return {
        category: question.category,
        headline:
          "Your cash-flow outlook is driven by income, expenses and recurring payments.",
        summary:
          "Finovo would focus on whether your monthly surplus remains positive and how low your projected balance falls.",
        supportingPoints: basePoints,
        disclaimer:
          "Forecasts are estimates based on the data stored in Finovo.",
      };

    default:
      return {
        category: question.category,
        headline:
          "Finovo can evaluate this using your current financial position.",
        summary:
          "The advisor context combines net worth, liquidity, cash flow, forecast, goals and financial health.",
        supportingPoints: basePoints,
        disclaimer:
          "This is an informational planning summary, not personal financial advice.",
      };
  }
}
