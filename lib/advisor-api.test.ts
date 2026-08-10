import {
  describe,
  expect,
  it,
} from "vitest";

import {
  parseAdvisorApiRequest,
} from "./advisor-api";
import type {
  AdvisorContext,
} from "./advisor-types";

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

describe("advisor API", () => {
  it("parses a valid request", () => {
    expect(
      parseAdvisorApiRequest({
        question:
          " Can I afford a holiday? ",
        context,
      })
    ).toEqual({
      question:
        "Can I afford a holiday?",
      context,
    });
  });

  it("rejects an empty question", () => {
    expect(() =>
      parseAdvisorApiRequest({
        question: " ",
        context,
      })
    ).toThrow(
      "Advisor question must contain between 1 and 2000 characters"
    );
  });

  it("rejects missing context", () => {
    expect(() =>
      parseAdvisorApiRequest({
        question: "Test",
      })
    ).toThrow(
      "Advisor context is required"
    );
  });

  it("rejects invalid financial values", () => {
    expect(() =>
      parseAdvisorApiRequest({
        question: "Test",
        context: {
          ...context,
          netWorthMinor: Number.NaN,
        },
      })
    ).toThrow(
      "Advisor context field netWorthMinor must be a finite number"
    );
  });
});
