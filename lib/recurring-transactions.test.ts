import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RecurringTransaction,
} from "./recurring-transaction-types";
import {
  addRecurringTransaction,
  deleteRecurringTransaction,
  generateRecurringOccurrences,
  isValidRecurringTransaction,
  updateRecurringTransaction,
} from "./recurring-transactions";

const rent: RecurringTransaction = {
  id: "rent",
  title: "Rent",
  category: "Housing",
  amountMinor: 95_000,
  type: "expense",
  frequency: "monthly",
  startDate: "2026-01-01",
  endDate: null,
  dayOfMonth: 1,
  isActive: true,
};

describe("recurring transactions", () => {
  it("validates recurring transactions", () => {
    expect(
      isValidRecurringTransaction(rent)
    ).toBe(true);

    expect(
      isValidRecurringTransaction({
        ...rent,
        dayOfMonth: 32,
      })
    ).toBe(false);
  });

  it("adds, updates and deletes items", () => {
    const added =
      addRecurringTransaction(
        [],
        rent
      );

    expect(added).toEqual([rent]);

    const updated =
      updateRecurringTransaction(
        added,
        {
          ...rent,
          amountMinor: 100_000,
        }
      );

    expect(
      updated[0].amountMinor
    ).toBe(100_000);

    expect(
      deleteRecurringTransaction(
        updated,
        rent.id
      )
    ).toEqual([]);
  });

  it("rejects duplicate and missing items", () => {
    expect(() =>
      addRecurringTransaction(
        [rent],
        rent
      )
    ).toThrow(
      "Recurring transaction already exists"
    );

    expect(() =>
      updateRecurringTransaction(
        [],
        rent
      )
    ).toThrow(
      "Cannot update a recurring transaction that does not exist"
    );
  });

  it("generates monthly occurrences", () => {
    expect(
      generateRecurringOccurrences(
        rent,
        "2026-08-01",
        "2026-10-31"
      )
    ).toEqual([
      {
        recurringTransactionId: "rent",
        date: "2026-08-01",
      },
      {
        recurringTransactionId: "rent",
        date: "2026-09-01",
      },
      {
        recurringTransactionId: "rent",
        date: "2026-10-01",
      },
    ]);
  });

  it("handles month-end dates", () => {
    expect(
      generateRecurringOccurrences(
        {
          ...rent,
          id: "month-end",
          startDate: "2026-01-31",
          dayOfMonth: 31,
        },
        "2026-02-01",
        "2026-04-30"
      )
    ).toEqual([
      {
        recurringTransactionId:
          "month-end",
        date: "2026-02-28",
      },
      {
        recurringTransactionId:
          "month-end",
        date: "2026-03-31",
      },
      {
        recurringTransactionId:
          "month-end",
        date: "2026-04-30",
      },
    ]);
  });

  it("generates weekly and yearly occurrences", () => {
    expect(
      generateRecurringOccurrences(
        {
          ...rent,
          id: "weekly",
          frequency: "weekly",
          startDate: "2026-08-03",
          dayOfMonth: null,
        },
        "2026-08-01",
        "2026-08-20"
      ).map((item) => item.date)
    ).toEqual([
      "2026-08-03",
      "2026-08-10",
      "2026-08-17",
    ]);

    expect(
      generateRecurringOccurrences(
        {
          ...rent,
          id: "yearly",
          frequency: "yearly",
          startDate: "2024-02-29",
          dayOfMonth: null,
        },
        "2025-01-01",
        "2026-12-31"
      ).map((item) => item.date)
    ).toEqual([
      "2025-02-28",
      "2026-02-28",
    ]);
  });

  it("returns no occurrences for inactive items", () => {
    expect(
      generateRecurringOccurrences(
        {
          ...rent,
          isActive: false,
        },
        "2026-08-01",
        "2026-10-31"
      )
    ).toEqual([]);
  });
});
