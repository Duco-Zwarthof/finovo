import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  Transaction,
} from "./types";
import {
  calculateTransactionWorkspaceSummary,
} from "./transaction-workspace";

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
    id: "old",
    title: "Old groceries",
    amountMinor: 5_000,
    type: "expense",
    category: "Groceries",
    date: "2026-08-20",
  },
];

describe(
  "transaction workspace",
  () => {
    it(
      "summarizes the selected calendar month",
      () => {
        const summary =
          calculateTransactionWorkspaceSummary(
            transactions,
            new Date(
              2026,
              8,
              15
            )
          );

        expect(
          summary.incomeMinor
        ).toBe(250_000);

        expect(
          summary.expensesMinor
        ).toBe(90_000);

        expect(
          summary.surplusMinor
        ).toBe(160_000);

        expect(
          summary.currentMonthCount
        ).toBe(2);

        expect(
          summary.totalCount
        ).toBe(3);
      }
    );

    it(
      "returns a null surplus rate when there is no monthly income",
      () => {
        const summary =
          calculateTransactionWorkspaceSummary(
            transactions,
            new Date(
              2026,
              9,
              15
            )
          );

        expect(
          summary.surplusRate
        ).toBeNull();

        expect(
          summary.currentMonthCount
        ).toBe(0);
      }
    );
  }
);
