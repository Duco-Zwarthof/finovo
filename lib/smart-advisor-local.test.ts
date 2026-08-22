import {
  describe,
  expect,
  it,
} from "vitest";

import type { AdvisorContext } from "./advisor-types";
import {
  answerLocalAdvisorQuestion,
} from "./smart-advisor-local";

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

describe("local smart advisor", () => {
  it("evaluates an affordable purchase", () => {
    const answer =
      answerLocalAdvisorQuestion(
        "Can I afford a €2,000 holiday?",
        context
      );

    expect(answer).toMatchObject({
      category: "affordability",
      tone: "positive",
    });

    expect(
      answer.supportingPoints
    ).toContain(
      "Liquid assets after purchase: €8,000.00."
    );
  });

  it("warns when a purchase exceeds available liquidity", () => {
    expect(
      answerLocalAdvisorQuestion(
        "Can I afford a €12,000 holiday?",
        context
      )
    ).toMatchObject({
      category: "affordability",
      tone: "caution",
    });
  });

  it("calculates an extra monthly investment contribution", () => {
    const answer =
      answerLocalAdvisorQuestion(
        "What if I invest €250 per month extra?",
        context
      );

    expect(answer).toMatchObject({
      category: "investing",
      tone: "positive",
    });

    expect(
      answer.supportingPoints
    ).toContain(
      "Additional 12-month contributions: €3,000.00."
    );
  });

  it("returns savings guidance", () => {
    expect(
      answerLocalAdvisorQuestion(
        "How can I save for my goal?",
        context
      ).category
    ).toBe("saving");
  });

  it("summarizes cash flow", () => {
    expect(
      answerLocalAdvisorQuestion(
        "How healthy is my cash flow?",
        context
      )
    ).toMatchObject({
      category: "cashflow",
      tone: "positive",
    });
  });

  it("returns general guidance for an unclassified question", () => {
    expect(
      answerLocalAdvisorQuestion(
        "Give me an overview",
        context
      ).category
    ).toBe("general");
  });

  it("includes saved scenario outcomes in investing answers", () => {
    const answer =
      answerLocalAdvisorQuestion(
        "What if I invest €250 per month extra?",
        {
          ...context,
          scenario: {
            years: 5,
            extraIncomeMinor: 0,
            extraExpensesMinor: 0,
            extraInvestingMinor: 25_000,
            bearReturnPercent: 2,
            baseReturnPercent: 6,
            bullReturnPercent: 9,
            bearEndingNetWorthMinor:
              2_000_000,
            baseEndingNetWorthMinor:
              2_500_000,
            bullEndingNetWorthMinor:
              3_000_000,
            lowestProjectedCashMinor:
              500_000,
          },
        }
      );

    expect(
      answer.supportingPoints.some(
        (point) =>
          point.includes(
            "Saved 5-year scenario"
          )
      )
    ).toBe(true);
  });

  it("adds a Safe, Tight or Risky assessment to answers", () => {
    const answer =
      answerLocalAdvisorQuestion(
        "What if I invest €900 per month extra?",
        context
      );

    expect(
      answer.assessment.verdict
    ).toBe("tight");

    expect(
      answer.assessment
        .estimatedMonthlyRoomMinor
    ).toBe(100_000);
  });

  it("adds concrete recommended actions to advisor answers", () => {
    const answer = answerLocalAdvisorQuestion(
      "What if I invest €1,250 per month extra?",
      context
    );

    expect(answer.actions.length).toBeGreaterThan(0);
    expect(
      answer.actions.some((action) => action.id === "reduce-investment")
    ).toBe(true);
  });
});
