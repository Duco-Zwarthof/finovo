import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  AdvisorContext,
} from "./advisor-types";
import {
  assessCurrentFinancialPosition,
  assessMonthlyCommitment,
  assessOneOffPurchase,
} from "./advisor-assessment";

const healthyContext: AdvisorContext = {
  netWorthMinor: 4_000_000,
  liquidAssetsMinor: 1_000_000,
  investmentAssetsMinor: 3_000_000,
  monthlyIncomeMinor: 300_000,
  monthlyExpensesMinor: 200_000,
  monthlySurplusMinor: 100_000,
  financialHealthScore: 86,
  forecastEndingBalanceMinor: 1_150_000,
  forecastLowestBalanceMinor: 800_000,
  forecastLowestBalanceDate: "2026-09-01",
  goalProgressPercentage: 50,
  topInsights: [],
};

describe("advisor assessment", () => {
  it("rates a healthy position as safe", () => {
    expect(
      assessCurrentFinancialPosition(
        healthyContext
      )
    ).toMatchObject({
      verdict: "safe",
      estimatedMonthlyRoomMinor:
        100_000,
    });
  });

  it("rates a modest monthly commitment as safe", () => {
    expect(
      assessMonthlyCommitment(
        25_000,
        healthyContext
      ).verdict
    ).toBe("safe");
  });

  it("rates a commitment using most of the surplus as tight", () => {
    expect(
      assessMonthlyCommitment(
        90_000,
        healthyContext
      ).verdict
    ).toBe("tight");
  });

  it("rates a commitment above the monthly surplus as risky", () => {
    expect(
      assessMonthlyCommitment(
        125_000,
        healthyContext
      ).verdict
    ).toBe("risky");
  });

  it("rates a purchase that breaks the cash buffer as tight or risky", () => {
    expect(
      assessOneOffPurchase(
        600_000,
        healthyContext
      ).verdict
    ).not.toBe("safe");
  });
});
