import {
  describe,
  expect,
  it,
} from "vitest";

import type { FinancialHealthResult } from "./financial-health-types";
import type { NetWorthHistorySummary } from "./net-worth-history-types";
import type { FinancialOverview } from "./net-worth-types";
import {
  createCashFlowInsight,
  createEmergencyBufferInsight,
  createGoalInsight,
  createNetWorthTrendInsight,
  generateFinancialInsights,
} from "./insights";

const overview: FinancialOverview = {
  netWorthMinor: 4_000_000,
  liquidAssetsMinor: 1_200_000,
  investmentAssetsMinor: 2_800_000,
  monthlyIncomeMinor: 300_000,
  monthlyExpensesMinor: 200_000,
  monthlySurplusMinor: 100_000,
  totalGoalTargetMinor: 3_000_000,
  totalGoalProgressMinor: 1_500_000,
  goalProgressPercentage: 50,
  accountBreakdown: {
    checkingMinor: 200_000,
    savingsMinor: 1_000_000,
    cashMinor: 0,
    investmentAccountsMinor: 2_800_000,
    totalIncludedAccountsMinor: 4_000_000,
  },
  portfolioCoverage: {
    investmentAccountsMinor: 2_800_000,
    trackedHoldingsMinor: 2_500_000,
    differenceMinor: 300_000,
    coveragePercentage: 89.3,
  },
};

const health: FinancialHealthResult = {
  score: 88,
  rating: "excellent",
  factors: [],
};

const history: NetWorthHistorySummary = {
  firstSnapshot: {
    id: "first",
    date: "2026-08-01",
    netWorthMinor: 3_800_000,
  },
  latestSnapshot: {
    id: "latest",
    date: "2026-08-03",
    netWorthMinor: 4_000_000,
  },
  changeMinor: 200_000,
  changePercentage: 5.2631578947,
  highestSnapshot: {
    id: "latest",
    date: "2026-08-03",
    netWorthMinor: 4_000_000,
  },
  lowestSnapshot: {
    id: "first",
    date: "2026-08-01",
    netWorthMinor: 3_800_000,
  },
};

describe("financial insights", () => {
  it("recognizes strong cash flow", () => {
    expect(
      createCashFlowInsight(
        overview
      ).level
    ).toBe("success");
  });

  it("warns about a small emergency buffer", () => {
    expect(
      createEmergencyBufferInsight({
        ...overview,
        liquidAssetsMinor: 400_000,
      })
    ).toMatchObject({
      level: "warning",
      priority: "high",
    });
  });

  it("describes goal progress", () => {
    expect(
      createGoalInsight(overview)
    ).toMatchObject({
      id: "goals-progressing",
      priority: "medium",
    });
  });

  it("describes positive net worth growth", () => {
    expect(
      createNetWorthTrendInsight(
        history
      )
    ).toMatchObject({
      id: "net-worth-growing",
      level: "success",
    });
  });

  it("sorts high-priority insights first", () => {
    const generated =
      generateFinancialInsights(
        {
          ...overview,
          monthlyExpensesMinor: 350_000,
          monthlySurplusMinor: -50_000,
        },
        {
          ...health,
          score: 45,
          rating: "needs-attention",
        },
        history
      );

    expect(
      generated
        .slice(0, 2)
        .every(
          (insight) =>
            insight.priority === "high"
        )
    ).toBe(true);
  });
});
