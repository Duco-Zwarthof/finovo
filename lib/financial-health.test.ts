import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateCashFlowFactor,
  calculateEmergencyBufferFactor,
  calculateFinancialHealth,
  calculateGoalProgressFactor,
  getFinancialHealthRating,
} from "./financial-health";
import type { FinancialOverview } from "./net-worth-types";

const baseOverview: FinancialOverview = {
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
    coveragePercentage: 89.2857142857,
  },
};

describe("financial health", () => {
  it("maps scores to ratings", () => {
    expect(
      getFinancialHealthRating(90)
    ).toBe("excellent");

    expect(
      getFinancialHealthRating(75)
    ).toBe("good");

    expect(
      getFinancialHealthRating(55)
    ).toBe("fair");

    expect(
      getFinancialHealthRating(30)
    ).toBe("needs-attention");
  });

  it("scores positive monthly cash flow", () => {
    expect(
      calculateCashFlowFactor(
        baseOverview
      )
    ).toEqual({
      id: "cash-flow",
      label: "Monthly cash flow",
      score: 40,
      maximumScore: 40,
      summary:
        "Your monthly surplus is at least 20% of income.",
    });
  });

  it("scores a six-month emergency buffer", () => {
    expect(
      calculateEmergencyBufferFactor(
        baseOverview
      )
    ).toEqual({
      id: "emergency-buffer",
      label: "Emergency buffer",
      score: 35,
      maximumScore: 35,
      summary:
        "Liquid assets cover at least six months of current expenses.",
    });
  });

  it("scores goal progress proportionally", () => {
    expect(
      calculateGoalProgressFactor(
        baseOverview
      )
    ).toEqual({
      id: "goal-progress",
      label: "Goal progress",
      score: 12.5,
      maximumScore: 25,
      summary:
        "You are making measurable progress toward your savings goals.",
    });
  });

  it("uses a neutral goal score when no goals exist", () => {
    expect(
      calculateGoalProgressFactor({
        ...baseOverview,
        goalProgressPercentage: null,
      }).score
    ).toBe(12.5);
  });

  it("calculates a transparent overall score", () => {
    expect(
      calculateFinancialHealth(
        baseOverview
      )
    ).toEqual({
      score: 88,
      rating: "excellent",
      factors: [
        calculateCashFlowFactor(
          baseOverview
        ),
        calculateEmergencyBufferFactor(
          baseOverview
        ),
        calculateGoalProgressFactor(
          baseOverview
        ),
      ],
    });
  });
});
