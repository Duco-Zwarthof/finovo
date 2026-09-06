import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateBudgetActualInsight,
} from "./budget-actual";
import type {
  Budget,
} from "./budget-types";
import type {
  Transaction,
} from "./types";

const budgets: Budget[] = [
  {
    id: "groceries",
    month: "2026-09",
    category: "Groceries",
    limitMinor: 30000,
  },
  {
    id: "transport",
    month: "2026-09",
    category: "Transport",
    limitMinor: 10000,
  },
];

const transactions: Transaction[] = [
  {
    id: "groceries-1",
    title: "Albert Heijn",
    amountMinor: 25000,
    type: "expense",
    category: "Groceries",
    date: "2026-09-04",
  },
  {
    id: "transport-1",
    title: "NS",
    amountMinor: 12000,
    type: "expense",
    category: "Transport",
    date: "2026-09-05",
  },
  {
    id: "unbudgeted-1",
    title: "Netflix",
    amountMinor: 1500,
    type: "expense",
    category: "Subscriptions",
    date: "2026-09-06",
  },
  {
    id: "income-1",
    title: "Salary",
    amountMinor: 200000,
    type: "income",
    category: "Salary",
    date: "2026-09-01",
  },
  {
    id: "august-expense",
    title: "Previous month",
    amountMinor: 20000,
    type: "expense",
    category: "Groceries",
    date: "2026-08-15",
  },
];

describe(
  "budget vs actual insight",
  () => {
    it(
      "compares the total plan with all actual expenses",
      () => {
        const insight =
          calculateBudgetActualInsight(
            budgets,
            transactions,
            "2026-09"
          );

        expect(
          insight.plannedMinor
        ).toBe(40000);

        expect(
          insight.budgetedSpentMinor
        ).toBe(37000);

        expect(
          insight.unbudgetedSpentMinor
        ).toBe(1500);

        expect(
          insight.actualSpentMinor
        ).toBe(38500);

        expect(
          insight.varianceMinor
        ).toBe(1500);
      }
    );

    it(
      "reports month-over-month spending change",
      () => {
        const insight =
          calculateBudgetActualInsight(
            budgets,
            transactions,
            "2026-09"
          );

        expect(
          insight.previousMonth
        ).toBe("2026-08");

        expect(
          insight.previousMonthSpentMinor
        ).toBe(20000);

        expect(
          insight.monthOverMonthChangePercent
        ).toBeCloseTo(92.5);
      }
    );

    it(
      "finds the category with the largest overrun",
      () => {
        const insight =
          calculateBudgetActualInsight(
            budgets,
            transactions,
            "2026-09"
          );

        expect(
          insight.largestOverrun
        ).toMatchObject({
          category: "Transport",
          varianceMinor: -2000,
        });
      }
    );

    it(
      "finds the category with the largest remaining buffer",
      () => {
        const insight =
          calculateBudgetActualInsight(
            budgets,
            transactions,
            "2026-09"
          );

        expect(
          insight.largestBuffer
        ).toMatchObject({
          category: "Groceries",
          varianceMinor: 5000,
        });
      }
    );

    it(
      "returns no-budget when the month has no plan",
      () => {
        const insight =
          calculateBudgetActualInsight(
            [],
            transactions,
            "2026-09"
          );

        expect(
          insight.status
        ).toBe("no-budget");

        expect(
          insight.usagePercentage
        ).toBeNull();
      }
    );

    it(
      "returns null month-over-month change when the previous month has no spending",
      () => {
        const insight =
          calculateBudgetActualInsight(
            budgets,
            transactions.filter(
              (transaction) =>
                transaction.id !==
                "august-expense"
            ),
            "2026-09"
          );

        expect(
          insight.previousMonthSpentMinor
        ).toBe(0);

        expect(
          insight.monthOverMonthChangePercent
        ).toBeNull();
      }
    );
  }
);
