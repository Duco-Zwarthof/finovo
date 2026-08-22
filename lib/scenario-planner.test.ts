import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateScenarioMonthlyChanges,
  calculateScenarioProjection,
} from "./scenario-planner";
import type { ScenarioAdjustment } from "./scenario-planner-types";

const adjustments: ScenarioAdjustment[] = [
  {
    id: "raise",
    type: "monthly-income",
    label: "Salary increase",
    amountMinor: 30_000,
  },
  {
    id: "rent",
    type: "monthly-expense",
    label: "Higher rent",
    amountMinor: 10_000,
  },
  {
    id: "invest",
    type: "monthly-investment",
    label: "Extra investing",
    amountMinor: 20_000,
  },
];

describe("scenario planner", () => {
  it("calculates monthly cash and investment changes", () => {
    expect(
      calculateScenarioMonthlyChanges(
        adjustments
      )
    ).toEqual({
      monthlyCashChangeMinor: 0,
      monthlyInvestmentContributionMinor:
        20_000,
    });
  });

  it("projects cash and investments over time", () => {
    expect(
      calculateScenarioProjection(
        500_000,
        1_000_000,
        adjustments,
        3
      )
    ).toEqual({
      months: 3,
      startingCashMinor: 500_000,
      startingInvestmentsMinor:
        1_000_000,
      projectedCashMinor: 500_000,
      projectedInvestmentsMinor:
        1_060_000,
      projectedNetWorthMinor:
        1_560_000,
      monthlyCashChangeMinor: 0,
      monthlyInvestmentContributionMinor:
        20_000,
      points: [
        {
          month: 0,
          projectedCashMinor: 500_000,
          projectedInvestmentsMinor:
            1_000_000,
          projectedNetWorthMinor:
            1_500_000,
        },
        {
          month: 1,
          projectedCashMinor: 500_000,
          projectedInvestmentsMinor:
            1_020_000,
          projectedNetWorthMinor:
            1_520_000,
        },
        {
          month: 2,
          projectedCashMinor: 500_000,
          projectedInvestmentsMinor:
            1_040_000,
          projectedNetWorthMinor:
            1_540_000,
        },
        {
          month: 3,
          projectedCashMinor: 500_000,
          projectedInvestmentsMinor:
            1_060_000,
          projectedNetWorthMinor:
            1_560_000,
        },
      ],
    });
  });

  it("handles a negative monthly cash scenario", () => {
    const projection =
      calculateScenarioProjection(
        200_000,
        0,
        [
          {
            id: "expense",
            type: "monthly-expense",
            label: "Extra expense",
            amountMinor: 50_000,
          },
        ],
        3
      );

    expect(
      projection.projectedCashMinor
    ).toBe(50_000);
  });

  it("compounds an annual investment return monthly", () => {
    const projection =
      calculateScenarioProjection(
        0,
        1_000_000,
        [],
        12,
        {
          annualInvestmentReturnPercent:
            10,
        }
      );

    expect(
      projection.projectedInvestmentsMinor
    ).toBeCloseTo(
      1_100_000,
      -2
    );
  });

  it("compounds new monthly investment contributions", () => {
    const projection =
      calculateScenarioProjection(
        1_200_000,
        0,
        [
          {
            id: "invest",
            type: "monthly-investment",
            label: "Invest monthly",
            amountMinor: 100_000,
          },
        ],
        12,
        {
          annualInvestmentReturnPercent:
            10,
        }
      );

    expect(
      projection.projectedInvestmentsMinor
    ).toBeGreaterThan(
      1_200_000
    );

    expect(
      projection.projectedCashMinor
    ).toBe(0);
  });

  it("rejects invalid annual return assumptions", () => {
    expect(() =>
      calculateScenarioProjection(
        0,
        0,
        [],
        12,
        {
          annualInvestmentReturnPercent:
            101,
        }
      )
    ).toThrow(
      "Annual investment return must be between 0 and 100 percent"
    );
  });

  it("rejects negative adjustment amounts", () => {
    expect(() =>
      calculateScenarioMonthlyChanges([
        {
          id: "bad",
          type: "monthly-income",
          label: "Bad",
          amountMinor: -1,
        },
      ])
    ).toThrow(
      "Scenario adjustment amount cannot be negative"
    );
  });

  it("rejects invalid projection horizons", () => {
    expect(() =>
      calculateScenarioProjection(
        0,
        0,
        [],
        0
      )
    ).toThrow(
      "Scenario months must be between 1 and 600"
    );
  });
});
