import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  Transaction,
} from "./types";
import {
  calculateTransactionAnalytics,
} from "./transaction-analytics";

const transactions: Transaction[] = [
  {
    id: "salary",
    title: "Salary",
    amountMinor: 250_000,
    type: "income",
    category: "Salary",
    date: "2026-09-01",
  },
  {
    id: "rent",
    title: "Rent",
    amountMinor: 90_000,
    type: "expense",
    category: "Housing",
    date: "2026-09-02",
  },
  {
    id: "food-1",
    title: "Groceries",
    amountMinor: 5_000,
    type: "expense",
    category: "Groceries",
    date: "2026-09-03",
  },
  {
    id: "food-2",
    title: "Groceries again",
    amountMinor: 7_000,
    type: "expense",
    category: "Groceries",
    date: "2026-09-03",
  },
  {
    id: "old",
    title: "Old expense",
    amountMinor: 40_000,
    type: "expense",
    category: "Other",
    date: "2026-08-20",
  },
];

describe(
  "transaction analytics",
  () => {
    it(
      "summarizes expenses for the selected month",
      () => {
        const analytics =
          calculateTransactionAnalytics(
            transactions,
            new Date(
              2026,
              8,
              15
            )
          );

        expect(
          analytics.expenseTotalMinor
        ).toBe(102_000);

        expect(
          analytics.expenseCount
        ).toBe(3);

        expect(
          analytics.averageExpenseMinor
        ).toBe(34_000);
      }
    );

    it(
      "orders category spending from highest to lowest",
      () => {
        const analytics =
          calculateTransactionAnalytics(
            transactions,
            new Date(
              2026,
              8,
              15
            )
          );

        expect(
          analytics
            .categoryBreakdown[0]
            .category
        ).toBe("Housing");

        expect(
          analytics
            .categoryBreakdown[1]
            .amountMinor
        ).toBe(12_000);
      }
    );

    it(
      "calculates category shares",
      () => {
        const analytics =
          calculateTransactionAnalytics(
            transactions,
            new Date(
              2026,
              8,
              15
            )
          );

        expect(
          analytics.topCategory
            ?.sharePercent
        ).toBeCloseTo(
          88.235,
          2
        );
      }
    );

    it(
      "combines expenses on the same day",
      () => {
        const analytics =
          calculateTransactionAnalytics(
            transactions,
            new Date(
              2026,
              8,
              15
            )
          );

        expect(
          analytics.dailyExpenses
        ).toEqual([
          {
            date: "2026-09-02",
            amountMinor: 90_000,
          },
          {
            date: "2026-09-03",
            amountMinor: 12_000,
          },
        ]);
      }
    );

    it(
      "finds the largest expense",
      () => {
        const analytics =
          calculateTransactionAnalytics(
            transactions,
            new Date(
              2026,
              8,
              15
            )
          );

        expect(
          analytics.largestExpense
        ).toEqual({
          title: "Rent",
          amountMinor: 90_000,
          category: "Housing",
        });
      }
    );

    it(
      "returns empty analytics when the month has no expenses",
      () => {
        const analytics =
          calculateTransactionAnalytics(
            transactions,
            new Date(
              2026,
              9,
              15
            )
          );

        expect(
          analytics.expenseCount
        ).toBe(0);

        expect(
          analytics.topCategory
        ).toBeNull();

        expect(
          analytics.dailyExpenses
        ).toEqual([]);
      }
    );
  }
);
