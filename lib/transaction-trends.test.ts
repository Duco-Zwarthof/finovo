import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  Transaction,
} from "./types";
import {
  calculateTransactionTrends,
} from "./transaction-trends";

const transactions: Transaction[] = [
  {
    id: "aug-income",
    title: "August salary",
    amountMinor: 200_000,
    type: "income",
    category: "Salary",
    date: "2026-08-01",
  },
  {
    id: "aug-expense",
    title: "August rent",
    amountMinor: 100_000,
    type: "expense",
    category: "Housing",
    date: "2026-08-02",
  },
  {
    id: "sep-income",
    title: "September salary",
    amountMinor: 240_000,
    type: "income",
    category: "Salary",
    date: "2026-09-01",
  },
  {
    id: "sep-expense-1",
    title: "September rent",
    amountMinor: 90_000,
    type: "expense",
    category: "Housing",
    date: "2026-09-02",
  },
  {
    id: "sep-expense-2",
    title: "September groceries",
    amountMinor: 30_000,
    type: "expense",
    category: "Groceries",
    date: "2026-09-03",
  },
];

describe(
  "transaction trends",
  () => {
    it(
      "creates a continuous month series ending in the reference month",
      () => {
        const result =
          calculateTransactionTrends(
            transactions,
            new Date(
              2026,
              8,
              15
            ),
            3
          );

        expect(
          result.months.map(
            (month) =>
              month.monthKey
          )
        ).toEqual([
          "2026-07",
          "2026-08",
          "2026-09",
        ]);
      }
    );

    it(
      "calculates monthly income, expenses and surplus",
      () => {
        const result =
          calculateTransactionTrends(
            transactions,
            new Date(
              2026,
              8,
              15
            )
          );

        expect(
          result.current
        ).toMatchObject({
          incomeMinor:
            240_000,
          expensesMinor:
            120_000,
          surplusMinor:
            120_000,
          transactionCount: 3,
        });
      }
    );

    it(
      "calculates month-over-month changes",
      () => {
        const result =
          calculateTransactionTrends(
            transactions,
            new Date(
              2026,
              8,
              15
            )
          );

        expect(
          result.expenseChangePercent
        ).toBe(20);

        expect(
          result.incomeChangePercent
        ).toBe(20);

        expect(
          result.surplusChangeMinor
        ).toBe(20_000);
      }
    );

    it(
      "returns null percentage when the previous month is zero and current is non-zero",
      () => {
        const result =
          calculateTransactionTrends(
            [
              transactions[2],
            ],
            new Date(
              2026,
              8,
              15
            )
          );

        expect(
          result.incomeChangePercent
        ).toBeNull();
      }
    );

    it(
      "rejects unsupported trend windows",
      () => {
        expect(() =>
          calculateTransactionTrends(
            transactions,
            new Date(
              2026,
              8,
              15
            ),
            1
          )
        ).toThrow();
      }
    );
  }
);
