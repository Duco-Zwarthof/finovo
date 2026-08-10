import type { CashflowForecast } from "./cashflow-forecast-types";
import type { FinancialHealthResult } from "./financial-health-types";
import type { FinancialInsight } from "./insight-types";
import {
  generateFinancialInsights,
  sortFinancialInsights,
} from "./insights";
import type { NetWorthHistorySummary } from "./net-worth-history-types";
import type { FinancialOverview } from "./net-worth-types";
import { formatCurrency } from "./money";
import { amountMinorToEuroAmount } from "./transaction-amount";

function formatMinorCurrency(
  amountMinor: number
): string {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export function findLowestForecastBalance(
  forecast: CashflowForecast
): {
  date: string;
  balanceMinor: number;
} {
  return forecast.points.reduce(
    (lowest, point) =>
      point.balanceMinor <
      lowest.balanceMinor
        ? point
        : lowest,
    forecast.points[0] ?? {
      date: forecast.startDate,
      balanceMinor:
        forecast.startingBalanceMinor,
    }
  );
}

export function createForecastChangeInsight(
  forecast: CashflowForecast
): FinancialInsight {
  if (forecast.events.length === 0) {
    return {
      id: "forecast-no-events",
      level: "info",
      priority: "low",
      title: "Your forecast has no scheduled changes",
      description:
        "There are no active recurring transactions inside the selected forecast period.",
      actionLabel: "Open forecast",
      actionHref: "/forecast",
    };
  }

  if (forecast.projectedChangeMinor < 0) {
    return {
      id: "forecast-negative-change",
      level: "warning",
      priority: "high",
      title: "Your forecast is trending downward",
      description: `Your liquid balance is projected to decrease by ${formatMinorCurrency(
        Math.abs(forecast.projectedChangeMinor)
      )} during this forecast period.`,
      actionLabel: "Review forecast",
      actionHref: "/forecast",
    };
  }

  if (forecast.projectedChangeMinor > 0) {
    return {
      id: "forecast-positive-change",
      level: "success",
      priority: "low",
      title: "Your forecast is trending upward",
      description: `Your liquid balance is projected to increase by ${formatMinorCurrency(
        forecast.projectedChangeMinor
      )} during this forecast period.`,
      actionLabel: "View forecast",
      actionHref: "/forecast",
    };
  }

  return {
    id: "forecast-flat",
    level: "info",
    priority: "low",
    title: "Your forecast is currently flat",
    description:
      "Scheduled recurring income and expenses currently offset each other over this forecast period.",
    actionLabel: "View forecast",
    actionHref: "/forecast",
  };
}

export function createLowestBalanceInsight(
  forecast: CashflowForecast
): FinancialInsight {
  const lowest =
    findLowestForecastBalance(forecast);

  if (lowest.balanceMinor < 0) {
    return {
      id: "forecast-negative-balance",
      level: "warning",
      priority: "high",
      title: "Your forecast drops below zero",
      description: `The lowest projected liquid balance is ${formatMinorCurrency(
        lowest.balanceMinor
      )} on ${lowest.date}.`,
      actionLabel: "Review forecast",
      actionHref: "/forecast",
    };
  }

  if (
    forecast.startingBalanceMinor > 0 &&
    lowest.balanceMinor <
      forecast.startingBalanceMinor * 0.25
  ) {
    return {
      id: "forecast-low-buffer",
      level: "warning",
      priority: "medium",
      title: "Your projected cash buffer becomes thin",
      description: `The lowest projected liquid balance is ${formatMinorCurrency(
        lowest.balanceMinor
      )} on ${lowest.date}.`,
      actionLabel: "Review forecast",
      actionHref: "/forecast",
    };
  }

  return {
    id: "forecast-buffer-healthy",
    level: "success",
    priority: "low",
    title: "Your projected cash buffer stays positive",
    description: `The lowest projected liquid balance is ${formatMinorCurrency(
      lowest.balanceMinor
    )} during this forecast period.`,
    actionLabel: "View forecast",
    actionHref: "/forecast",
  };
}

export function generateSmartFinancialInsights(
  overview: FinancialOverview,
  health: FinancialHealthResult,
  history: NetWorthHistorySummary,
  forecast: CashflowForecast
): FinancialInsight[] {
  const existing =
    generateFinancialInsights(
      overview,
      health,
      history
    );

  return sortFinancialInsights([
    ...existing,
    createForecastChangeInsight(
      forecast
    ),
    createLowestBalanceInsight(
      forecast
    ),
  ]);
}
