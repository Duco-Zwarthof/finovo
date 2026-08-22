import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateAdvisorScenarioContext,
} from "./advisor-scenario";

describe("advisor scenario context", () => {
  it("creates bear, base and bull outcomes from saved scenario settings", () => {
    const result =
      calculateAdvisorScenarioContext(
        1_000_000,
        1_000_000,
        {
          extraIncomeEuro: 300,
          extraExpensesEuro: 100,
          extraInvestingEuro: 100,
          years: 5,
          bearReturn: 2,
          baseReturn: 6,
          bullReturn: 9,
        }
      );

    expect(
      result.bearEndingNetWorthMinor
    ).toBeLessThan(
      result.baseEndingNetWorthMinor
    );

    expect(
      result.baseEndingNetWorthMinor
    ).toBeLessThan(
      result.bullEndingNetWorthMinor
    );

    expect(
      result.extraInvestingMinor
    ).toBe(10_000);

    expect(result.years).toBe(5);
  });

  it("tracks the lowest projected cash balance", () => {
    const result =
      calculateAdvisorScenarioContext(
        100_000,
        0,
        {
          extraIncomeEuro: 0,
          extraExpensesEuro: 100,
          extraInvestingEuro: 0,
          years: 1,
          bearReturn: 0,
          baseReturn: 0,
          bullReturn: 0,
        }
      );

    expect(
      result.lowestProjectedCashMinor
    ).toBe(-20_000);
  });
});
