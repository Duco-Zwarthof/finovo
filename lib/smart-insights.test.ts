import {
  describe,
  expect,
  it,
} from "vitest";

import type { CashflowForecast } from "./cashflow-forecast-types";
import type { FinancialHealthResult } from "./financial-health-types";
import type { NetWorthHistorySummary } from "./net-worth-history-types";
import type { FinancialOverview } from "./net-worth-types";
import {
  createForecastChangeInsight,
  createLowestBalanceInsight,
  findLowestForecastBalance,
  generateSmartFinancialInsights,
} from "./smart-insights";

const forecast: CashflowForecast = {
  startDate: "2026-08-09",
  endDate: "2026-09-08",
  startingBalanceMinor: 500_000,
  endingBalanceMinor: 650_000,
  projectedChangeMinor: 150_000,
  events: [
    {
      id: "forecast:rent:2026-09-01",
      recurringTransactionId: "rent",
      title: "Rent",
      category: "Housing",
      type: "expense",
      date: "2026-09-01",
      amountMinor: 100_000,
      balanceAfterMinor: 400_000,
    },
    {
      id: "forecast:salary:2026-09-05",
      recurringTransactionId: "salary",
      title: "Salary",
      category: "Salary",
      type: "income",
      date: "2026-09-05",
      amountMinor: 250_000,
      balanceAfterMinor: 650_000,
    },
  ],
  points: [
    {
      date: "2026-08-09",
      balanceMinor: 500_000,
    },
    {
      date: "2026-09-01",
      balanceMinor: 400_000,
    },
    {
      date: "2026-09-05",
      balanceMinor: 650_000,
    },
  ],
};

const overview: FinancialOverview = {
  netWorthMinor: 1_500_000,
  liquidAssetsMinor: 500_000,
  investmentAssetsMinor: 1_000_000,
  monthlyIncomeMinor: 300_000,
  monthlyExpensesMinor: 200_000,
  monthlySurplusMinor: 100_000,
  totalGoalTargetMinor: 2_000_000,
  totalGoalProgressMinor: 500_000,
  goalProgressPercentage: 25,
  accountBreakdown: {
    checkingMinor: 200_000,
    savingsMinor: 300_000,
    cashMinor: 0,
    investmentAccountsMinor: 1_000_000,
    totalIncludedAccountsMinor: 1_500_000,
  },
  portfolioCoverage: {
    investmentAccountsMinor: 1_000_000,
    trackedHoldingsMinor: 900_000,
    differenceMinor: 100_000,
    coveragePercentage: 90,
  },
};

const health: FinancialHealthResult = {
  score: 80,
  rating: "good",
  factors: [],
};

const history: NetWorthHistorySummary = {
  firstSnapshot: null,
  latestSnapshot: null,
  changeMinor: 0,
  changePercentage: null,
  highestSnapshot: null,
  lowestSnapshot: null,
};

describe("smart financial insights", () => {
  it("finds the lowest projected balance", () => {
    expect(
      findLowestForecastBalance(
        forecast
      )
    ).toEqual({
      date: "2026-09-01",
      balanceMinor: 400_000,
    });
  });

  it("recognizes positive projected change", () => {
    expect(
      createForecastChangeInsight(
        forecast
      )
    ).toMatchObject({
      id: "forecast-positive-change",
      level: "success",
      priority: "low",
    });
  });

  it("warns when the forecast drops below zero", () => {
    expect(
      createLowestBalanceInsight({
        ...forecast,
        points: [
          forecast.points[0],
          {
            date: "2026-09-01",
            balanceMinor: -50_000,
          },
        ],
      })
    ).toMatchObject({
      id: "forecast-negative-balance",
      level: "warning",
      priority: "high",
    });
  });

  it("merges forecast intelligence with existing insights", () => {
    const insights =
      generateSmartFinancialInsights(
        overview,
        health,
        history,
        forecast
      );

    expect(
      insights.some(
        (insight) =>
          insight.id ===
          "forecast-positive-change"
      )
    ).toBe(true);

    expect(
      insights.some(
        (insight) =>
          insight.id ===
          "forecast-buffer-healthy"
      )
    ).toBe(true);
  });

  it("keeps high-priority forecast warnings near the top", () => {
    const insights =
      generateSmartFinancialInsights(
        overview,
        health,
        history,
        {
          ...forecast,
          endingBalanceMinor: -50_000,
          projectedChangeMinor: -550_000,
          points: [
            forecast.points[0],
            {
              date: "2026-09-01",
              balanceMinor: -50_000,
            },
          ],
        }
      );

    expect(
      insights[0].priority
    ).toBe("high");
  });
});
