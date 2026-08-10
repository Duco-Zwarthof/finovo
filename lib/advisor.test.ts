import {
  describe,
  expect,
  it,
} from "vitest";

import type { CashflowForecast } from "./cashflow-forecast-types";
import type { FinancialHealthResult } from "./financial-health-types";
import type { FinancialInsight } from "./insight-types";
import type { FinancialOverview } from "./net-worth-types";
import {
  classifyAdvisorQuestion,
  createAdvisorContext,
  createAdvisorDraftAnswer,
  createAdvisorQuestion,
} from "./advisor";

const overview: FinancialOverview = {
  netWorthMinor: 4_000_000,
  liquidAssetsMinor: 1_000_000,
  investmentAssetsMinor: 3_000_000,
  monthlyIncomeMinor: 300_000,
  monthlyExpensesMinor: 200_000,
  monthlySurplusMinor: 100_000,
  totalGoalTargetMinor: 2_000_000,
  totalGoalProgressMinor: 1_000_000,
  goalProgressPercentage: 50,
  accountBreakdown: {
    checkingMinor: 250_000,
    savingsMinor: 750_000,
    cashMinor: 0,
    investmentAccountsMinor: 3_000_000,
    totalIncludedAccountsMinor: 4_000_000,
  },
  portfolioCoverage: {
    investmentAccountsMinor: 3_000_000,
    trackedHoldingsMinor: 2_800_000,
    differenceMinor: 200_000,
    coveragePercentage: 93.3,
  },
};

const health: FinancialHealthResult = {
  score: 86,
  rating: "excellent",
  factors: [],
};

const forecast: CashflowForecast = {
  startDate: "2026-08-11",
  endDate: "2026-09-10",
  startingBalanceMinor: 1_000_000,
  endingBalanceMinor: 1_150_000,
  projectedChangeMinor: 150_000,
  events: [],
  points: [
    {
      date: "2026-08-11",
      balanceMinor: 1_000_000,
    },
    {
      date: "2026-09-01",
      balanceMinor: 800_000,
    },
    {
      date: "2026-09-10",
      balanceMinor: 1_150_000,
    },
  ],
};

const insights: FinancialInsight[] = [
  {
    id: "test",
    level: "success",
    priority: "low",
    title: "Healthy buffer",
    description: "Test insight",
    actionLabel: null,
    actionHref: null,
  },
];

describe("advisor", () => {
  it("classifies common question types", () => {
    expect(
      classifyAdvisorQuestion(
        "Can I afford a holiday?"
      )
    ).toBe("affordability");

    expect(
      classifyAdvisorQuestion(
        "Should I invest more?"
      )
    ).toBe("investing");

    expect(
      classifyAdvisorQuestion(
        "How can I save for my goal?"
      )
    ).toBe("saving");
  });

  it("creates a compact advisor context", () => {
    expect(
      createAdvisorContext(
        overview,
        health,
        forecast,
        insights
      )
    ).toMatchObject({
      netWorthMinor: 4_000_000,
      liquidAssetsMinor: 1_000_000,
      financialHealthScore: 86,
      forecastLowestBalanceMinor: 800_000,
      forecastLowestBalanceDate:
        "2026-09-01",
      goalProgressPercentage: 50,
    });
  });

  it("creates a validated question", () => {
    expect(
      createAdvisorQuestion(
        " Can I afford a €2,000 holiday? "
      )
    ).toEqual({
      text:
        "Can I afford a €2,000 holiday?",
      category: "affordability",
    });
  });

  it("rejects empty questions", () => {
    expect(() =>
      createAdvisorQuestion("   ")
    ).toThrow(
      "Advisor question cannot be empty"
    );
  });

  it("creates a deterministic planning answer", () => {
    const context =
      createAdvisorContext(
        overview,
        health,
        forecast,
        insights
      );

    const question =
      createAdvisorQuestion(
        "Should I invest more?"
      );

    expect(
      createAdvisorDraftAnswer(
        question,
        context
      )
    ).toMatchObject({
      category: "investing",
      headline:
        "Extra investing should be weighed against your cash buffer.",
    });
  });
});
