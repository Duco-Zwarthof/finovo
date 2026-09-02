import { describe, expect, it } from "vitest";

import type { AdvisorContext } from "./advisor-types";
import {
  assessCurrentFinancialPosition,
  assessMonthlyCommitment,
  assessOneOffPurchase,
} from "./advisor-assessment";
import {
  calculateBufferGapMinor,
  calculateComfortableMonthlyCommitmentMinor,
  createAdvisorActions,
} from "./advisor-recommendations";

const context: AdvisorContext = {
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

describe("advisor recommendations", () => {
  it("calculates a three-month buffer gap", () => {
    expect(
      calculateBufferGapMinor({
        ...context,
        liquidAssetsMinor: 400_000,
      })
    ).toBe(200_000);
  });

  it("uses 60 percent of monthly surplus as conservative room", () => {
    expect(
      calculateComfortableMonthlyCommitmentMinor(context)
    ).toBe(60_000);
  });

  it("recommends lowering an investment above surplus", () => {
    const assessment = assessMonthlyCommitment(125_000, context);
    const actions = createAdvisorActions(
      context,
      assessment,
      "investing",
      125_000
    );

    expect(
      actions.some((action) => action.id === "reduce-investment")
    ).toBe(true);
  });

  it("recommends protecting the buffer for a large purchase", () => {
    const assessment = assessOneOffPurchase(600_000, context);
    const actions = createAdvisorActions(
      context,
      assessment,
      "affordability",
      600_000
    );

    expect(
      actions.some((action) => action.id === "purchase-cap")
    ).toBe(true);
  });

  it("returns a maintenance action when no correction is needed", () => {
    const assessment = assessCurrentFinancialPosition(context);
    const actions = createAdvisorActions(
      context,
      assessment,
      "general"
    );

    expect(actions[0].id).toBe("maintain-plan");
  });

  it("adds a destination to every action", () => {
    const assessment =
      assessCurrentFinancialPosition(
        context
      );

    const actions =
      createAdvisorActions(
        context,
        assessment,
        "general"
      );

    for (const action of actions) {
      expect(
        action.href.startsWith("/")
      ).toBe(true);

      expect(
        action.ctaLabel.length
      ).toBeGreaterThan(0);
    }
  });

  it("sorts high-priority actions first", () => {
    const stressedContext: AdvisorContext = {
      ...context,
      liquidAssetsMinor: 100_000,
      monthlySurplusMinor: -10_000,
      forecastLowestBalanceMinor: -25_000,
    };

    const assessment =
      assessCurrentFinancialPosition(
        stressedContext
      );

    const actions =
      createAdvisorActions(
        stressedContext,
        assessment,
        "general"
      );

    expect(
      actions[0].priority
    ).toBe("high");
  });
});
