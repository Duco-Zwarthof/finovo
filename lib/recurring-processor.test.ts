import {
  describe,
  expect,
  it,
} from "vitest";

import type { RecurringTransaction } from "./recurring-transaction-types";
import {
  createRecurringTransactionId,
  createTransactionFromRecurringOccurrence,
  processDueRecurringTransactions,
} from "./recurring-processor";
import type { Transaction } from "./types";

const rent: RecurringTransaction = {
  id: "rent",
  title: "Rent",
  category: "Housing",
  amountMinor: 95_000,
  type: "expense",
  frequency: "monthly",
  startDate: "2026-06-01",
  endDate: null,
  dayOfMonth: 1,
  isActive: true,
};

describe("recurring processor", () => {
  it("creates deterministic transaction ids", () => {
    expect(
      createRecurringTransactionId(
        "rent",
        "2026-08-01"
      )
    ).toBe(
      "recurring:rent:2026-08-01"
    );
  });

  it("converts a recurring occurrence into a transaction", () => {
    expect(
      createTransactionFromRecurringOccurrence(
        rent,
        "2026-08-01"
      )
    ).toEqual({
      id: "recurring:rent:2026-08-01",
      title: "Rent",
      category: "Housing",
      amountMinor: 95_000,
      type: "expense",
      date: "2026-08-01",
    });
  });

  it("materializes every due occurrence through the selected date", () => {
    const result =
      processDueRecurringTransactions(
        [rent],
        [],
        "2026-08-03"
      );

    expect(
      result.createdTransactions.map(
        (transaction) => transaction.date
      )
    ).toEqual([
      "2026-06-01",
      "2026-07-01",
      "2026-08-01",
    ]);

    expect(
      result.transactions.map(
        (transaction) => transaction.date
      )
    ).toEqual([
      "2026-08-01",
      "2026-07-01",
      "2026-06-01",
    ]);
  });

  it("does not create duplicate transactions when processed repeatedly", () => {
    const firstRun =
      processDueRecurringTransactions(
        [rent],
        [],
        "2026-08-03"
      );

    const secondRun =
      processDueRecurringTransactions(
        [rent],
        firstRun.transactions,
        "2026-08-03"
      );

    expect(
      secondRun.createdTransactions
    ).toEqual([]);

    expect(
      secondRun.transactions
    ).toEqual(firstRun.transactions);
  });

  it("preserves normal user transactions", () => {
    const userTransaction: Transaction = {
      id: "user-transaction",
      title: "Groceries",
      category: "Groceries",
      amountMinor: 5_000,
      type: "expense",
      date: "2026-08-02",
    };

    const result =
      processDueRecurringTransactions(
        [rent],
        [userTransaction],
        "2026-08-03"
      );

    expect(
      result.transactions
    ).toContainEqual(userTransaction);
  });

  it("ignores paused recurring items", () => {
    const result =
      processDueRecurringTransactions(
        [
          {
            ...rent,
            isActive: false,
          },
        ],
        [],
        "2026-08-03"
      );

    expect(result).toEqual({
      transactions: [],
      createdTransactions: [],
      skippedOccurrences: [],
    });
  });

  it("reports categories that cannot become normal transactions", () => {
    const result =
      processDueRecurringTransactions(
        [
          {
            ...rent,
            category: "Custom category",
          },
        ],
        [],
        "2026-08-03"
      );

    expect(
      result.transactions
    ).toEqual([]);

    expect(
      result.skippedOccurrences
    ).toHaveLength(3);

    expect(
      result.skippedOccurrences[0]
    ).toMatchObject({
      recurringTransactionId: "rent",
      reason: "invalid-category",
    });
  });

  it("rejects an invalid processing date", () => {
    expect(() =>
      processDueRecurringTransactions(
        [rent],
        [],
        "2026-02-30"
      )
    ).toThrow(
      "Cannot process recurring transactions through an invalid date"
    );
  });
});
