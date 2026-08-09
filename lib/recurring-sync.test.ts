import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RecurringTransaction,
} from "./recurring-transaction-types";
import {
  processDueRecurringTransactions,
} from "./recurring-processor";

const salary: RecurringTransaction = {
  id: "salary",
  title: "Salary",
  category: "Salary",
  amountMinor: 250_000,
  type: "income",
  frequency: "monthly",
  startDate: "2026-07-25",
  endDate: null,
  dayOfMonth: 25,
  isActive: true,
};

describe("app-wide recurring sync contract", () => {
  it("is idempotent when the same due items are processed more than once", () => {
    const first =
      processDueRecurringTransactions(
        [salary],
        [],
        "2026-08-26"
      );

    const second =
      processDueRecurringTransactions(
        [salary],
        first.transactions,
        "2026-08-26"
      );

    expect(
      first.createdTransactions
    ).toHaveLength(2);

    expect(
      second.createdTransactions
    ).toHaveLength(0);

    expect(
      second.transactions
    ).toEqual(first.transactions);
  });
});
