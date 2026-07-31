import { describe, expect, it } from "vitest";

import type { Transaction } from "./types";
import {
  addMinorUnits,
  calculateExpensesMinor,
  calculateIncomeMinor,
  calculateMonthlyFinancialSummary,
  calculateSurplusMinor,
} from "./finance";

function createTransaction({
  id,
  amount,
  amountMinor,
  type,
  date,
}: Pick<
  Transaction,
  "id" | "amount" | "amountMinor" | "type" | "date"
>): Transaction {
  return {
    id,
    title: id,
    amount,
    amountMinor,
    type,
    category: type === "income" ? "Salary" : "Groceries",
    date,
  };
}

describe("calculateMonthlyFinancialSummary", () => {
  const julyReference = new Date(2026, 6, 15);

  it("calculates income, expenses, surplus, and rate for the current month", () => {
    const transactions = [
      createTransaction({
        id: "income",
        amount: 1_000,
        amountMinor: 100_000,
        type: "income",
        date: "2026-07-01",
      }),
      createTransaction({
        id: "expense",
        amount: 250,
        amountMinor: 25_000,
        type: "expense",
        date: "2026-07-31",
      }),
    ];

    expect(
      calculateMonthlyFinancialSummary(
        transactions,
        julyReference
      )
    ).toEqual({
      incomeMinor: 100_000,
      expensesMinor: 25_000,
      surplusMinor: 75_000,
      surplusRate: 75,
    });
  });

  it("excludes transactions from other months and invalid dates", () => {
    const transactions = [
      createTransaction({
        id: "june-income",
        amount: 3_000,
        amountMinor: 300_000,
        type: "income",
        date: "2026-06-30",
      }),
      createTransaction({
        id: "july-income",
        amount: 2_000,
        amountMinor: 200_000,
        type: "income",
        date: "2026-07-10",
      }),
      createTransaction({
        id: "july-expense",
        amount: 500,
        amountMinor: 50_000,
        type: "expense",
        date: "2026-07-20",
      }),
      createTransaction({
        id: "august-expense",
        amount: 700,
        amountMinor: 70_000,
        type: "expense",
        date: "2026-08-01",
      }),
      createTransaction({
        id: "invalid-expense",
        amount: 900,
        amountMinor: 90_000,
        type: "expense",
        date: "2026-07-32",
      }),
    ];

    expect(
      calculateMonthlyFinancialSummary(
        transactions,
        julyReference
      )
    ).toEqual({
      incomeMinor: 200_000,
      expensesMinor: 50_000,
      surplusMinor: 150_000,
      surplusRate: 75,
    });
  });

  it("returns no rate when the current month has no income", () => {
    const summary = calculateMonthlyFinancialSummary(
      [
        createTransaction({
          id: "expense",
          amount: 100,
          amountMinor: 10_000,
          type: "expense",
          date: "2026-07-15",
        }),
      ],
      julyReference
    );

    expect(summary).toEqual({
      incomeMinor: 0,
      expensesMinor: 10_000,
      surplusMinor: -10_000,
      surplusRate: null,
    });
  });

  it("returns a negative surplus and surplus rate", () => {
    const transactions = [
      createTransaction({
        id: "income",
        amount: 200,
        amountMinor: 20_000,
        type: "income",
        date: "2026-07-15",
      }),
      createTransaction({
        id: "expense",
        amount: 300,
        amountMinor: 30_000,
        type: "expense",
        date: "2026-07-16",
      }),
    ];

    expect(
      calculateMonthlyFinancialSummary(
        transactions,
        julyReference
      )
    ).toEqual({
      incomeMinor: 20_000,
      expensesMinor: 30_000,
      surplusMinor: -10_000,
      surplusRate: -50,
    });
  });

  it("preserves a small negative surplus rate", () => {
    const summary = calculateMonthlyFinancialSummary(
      [
        createTransaction({
          id: "income",
          amount: 1_000,
          amountMinor: 100_000,
          type: "income",
          date: "2026-07-15",
        }),
        createTransaction({
          id: "expense",
          amount: 1_004,
          amountMinor: 100_400,
          type: "expense",
          date: "2026-07-16",
        }),
      ],
      julyReference
    );

    expect(summary.surplusMinor).toBe(-400);
    expect(summary.surplusRate).toBeCloseTo(-0.4);
  });

  it("returns an empty summary when no transactions match", () => {
    expect(
      calculateMonthlyFinancialSummary([], julyReference)
    ).toEqual({
      incomeMinor: 0,
      expensesMinor: 0,
      surplusMinor: 0,
      surplusRate: null,
    });
  });
});

describe("minor-unit financial totals", () => {
  const transactions = [
    createTransaction({
      id: "income",
      amount: 999,
      amountMinor: 1,
      type: "income",
      date: "2026-07-01",
    }),
    createTransaction({
      id: "expense",
      amount: 999,
      amountMinor: 2,
      type: "expense",
      date: "2026-07-01",
    }),
  ];

  it("uses amountMinor instead of the compatibility amount", () => {
    expect(calculateIncomeMinor(transactions)).toBe(1);
    expect(calculateExpensesMinor(transactions)).toBe(2);
    expect(calculateSurplusMinor(1, 2)).toBe(-1);
  });

  it("rejects unsafe minor-unit totals", () => {
    expect(() =>
      addMinorUnits(Number.MAX_SAFE_INTEGER, 1)
    ).toThrow(RangeError);
  });
});
