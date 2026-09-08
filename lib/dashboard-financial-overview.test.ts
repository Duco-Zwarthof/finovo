import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateDashboardFinancialOverview,
} from "./dashboard-financial-overview";
import type {
  BudgetActualInsight,
} from "./budget-actual";
import type {
  CashflowForecastAnalysis,
} from "./cashflow-forecast-analysis";

const budgetActual: BudgetActualInsight = {
  month: "2026-09",
  previousMonth: "2026-08",
  plannedMinor: 100000,
  budgetedSpentMinor: 60000,
  unbudgetedSpentMinor: 5000,
  actualSpentMinor: 65000,
  varianceMinor: 35000,
  usagePercentage: 65,
  status: "on-track",
  previousMonthSpentMinor: 70000,
  monthOverMonthChangePercent:
    -7.14,
  overBudgetCategoryCount: 0,
  nearLimitCategoryCount: 0,
  largestOverrun: null,
  largestBuffer: null,
};

const forecastAnalysis: CashflowForecastAnalysis = {
  forecast: {
    startDate: "2026-09-06",
    endDate: "2026-10-06",
    startingBalanceMinor: 250000,
    endingBalanceMinor: 300000,
    projectedChangeMinor: 50000,
    events: [
      {
        id: "salary",
        recurringTransactionId:
          "salary",
        title: "Salary",
        category: "Salary",
        type: "income",
        date: "2026-09-25",
        amountMinor: 200000,
        balanceAfterMinor: 450000,
      },
      {
        id: "rent",
        recurringTransactionId:
          "rent",
        title: "Rent",
        category: "Housing",
        type: "expense",
        date: "2026-10-01",
        amountMinor: 150000,
        balanceAfterMinor: 300000,
      },
    ],
    points: [
      {
        date: "2026-09-06",
        balanceMinor: 250000,
      },
      {
        date: "2026-09-25",
        balanceMinor: 450000,
      },
      {
        date: "2026-10-01",
        balanceMinor: 300000,
      },
    ],
  },
  accountProjections: [
    {
      accountId: "checking",
      accountName: "Checking",
      startingBalanceMinor:
        250000,
      endingBalanceMinor:
        300000,
      projectedChangeMinor:
        50000,
      lowestBalanceMinor:
        250000,
      lowestBalanceDate:
        "2026-09-06",
      firstNegativeDate: null,
      eventCount: 2,
    },
  ],
  horizonSnapshots: [],
  assignedRecurringCount: 2,
  unassignedRecurringCount: 0,
  riskLevel: "healthy",
};

describe(
  "dashboard financial overview",
  () => {
    it(
      "combines monthly, budget and forecast metrics",
      () => {
        const result =
          calculateDashboardFinancialOverview(
            {
              accounts: [
                {
                  id: "checking",
                  name: "Checking",
                  type: "checking",
                  balanceMinor:
                    250000,
                  includedInNetWorth:
                    true,
                },
              ],
              recurringItems: [
                {
                  id: "salary",
                  title: "Salary",
                  category: "Salary",
                  amountMinor:
                    200000,
                  type: "income",
                  frequency:
                    "monthly",
                  startDate:
                    "2026-01-25",
                  endDate: null,
                  dayOfMonth: 25,
                  isActive: true,
                  accountId:
                    "checking",
                },
              ],
              netWorthMinor:
                250000,
              monthlyIncomeMinor:
                200000,
              monthlyExpensesMinor:
                100000,
              monthlySurplusMinor:
                100000,
              budgetActual,
              forecastAnalysis,
            }
          );

        expect(
          result.status
        ).toBe("strong");

        expect(
          result.netWorthMinor
        ).toBe(250000);

        expect(
          result.surplusRate
        ).toBe(50);

        expect(
          result.forecastRecurringIncomeMinor
        ).toBe(200000);

        expect(
          result.forecastRecurringExpensesMinor
        ).toBe(150000);

        expect(
          result.recurringCoveragePercentage
        ).toBe(100);

        expect(
          result.nextRecurringTitle
        ).toBe("Salary");
      }
    );

    it(
      "returns risk when an account is projected negative",
      () => {
        const result =
          calculateDashboardFinancialOverview(
            {
              accounts: [],
              recurringItems: [],
              netWorthMinor: 0,
              monthlyIncomeMinor:
                100000,
              monthlyExpensesMinor:
                100000,
              monthlySurplusMinor:
                0,
              budgetActual,
              forecastAnalysis: {
                ...forecastAnalysis,
                riskLevel: "risk",
                accountProjections: [
                  {
                    ...forecastAnalysis
                      .accountProjections[
                      0
                    ],
                    firstNegativeDate:
                      "2026-09-20",
                  },
                ],
              },
            }
          );

        expect(
          result.status
        ).toBe("risk");

        expect(
          result.focusHref
        ).toBe("/forecast");
      }
    );

    it(
      "prioritizes budget pressure when the budget is over",
      () => {
        const result =
          calculateDashboardFinancialOverview(
            {
              accounts: [],
              recurringItems: [],
              netWorthMinor: 0,
              monthlyIncomeMinor:
                100000,
              monthlyExpensesMinor:
                90000,
              monthlySurplusMinor:
                10000,
              budgetActual: {
                ...budgetActual,
                status:
                  "over-budget",
                varianceMinor:
                  -10000,
              },
              forecastAnalysis,
            }
          );

        expect(
          result.status
        ).toBe("watch");

        expect(
          result.focusHref
        ).toBe("/budget");
      }
    );

    it(
      "routes to recurring when scheduled items are unassigned",
      () => {
        const result =
          calculateDashboardFinancialOverview(
            {
              accounts: [],
              recurringItems: [],
              netWorthMinor: 0,
              monthlyIncomeMinor:
                100000,
              monthlyExpensesMinor:
                50000,
              monthlySurplusMinor:
                50000,
              budgetActual,
              forecastAnalysis: {
                ...forecastAnalysis,
                assignedRecurringCount:
                  1,
                unassignedRecurringCount:
                  1,
                riskLevel: "watch",
              },
            }
          );

        expect(
          result.focusHref
        ).toBe("/recurring");

        expect(
          result.recurringCoveragePercentage
        ).toBe(50);
      }
    );
  }
);
