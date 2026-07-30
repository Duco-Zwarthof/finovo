import { describe, expect, it } from "vitest";

import type { Transaction } from "./types";
import { calculateMonthlyFinancialSummary } from "./finance";

function createTransaction({
  id,
  amount,
  type,
  date,
}: Pick<Transaction, "id" | "amount" | "type" | "date">): Transaction {
  return {
    id,
    title: id,
    amount,
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
        type: "income",
        date: "2026-07-01",
      }),
      createTransaction({
        id: "expense",
        amount: 250,
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
      income: 1_000,
      expenses: 250,
      surplus: 750,
      surplusRate: 75,
    });
  });

  it("excludes transactions from other months and invalid dates", () => {
    const transactions = [
      createTransaction({
        id: "june-income",
        amount: 3_000,
        type: "income",
        date: "2026-06-30",
      }),
      createTransaction({
        id: "july-income",
        amount: 2_000,
        type: "income",
        date: "2026-07-10",
      }),
      createTransaction({
        id: "july-expense",
        amount: 500,
        type: "expense",
        date: "2026-07-20",
      }),
      createTransaction({
        id: "august-expense",
        amount: 700,
        type: "expense",
        date: "2026-08-01",
      }),
      createTransaction({
        id: "invalid-expense",
        amount: 900,
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
      income: 2_000,
      expenses: 500,
      surplus: 1_500,
      surplusRate: 75,
    });
  });

  it("returns no rate when the current month has no income", () => {
    const summary = calculateMonthlyFinancialSummary(
      [
        createTransaction({
          id: "expense",
          amount: 100,
          type: "expense",
          date: "2026-07-15",
        }),
      ],
      julyReference
    );

    expect(summary).toEqual({
      income: 0,
      expenses: 100,
      surplus: -100,
      surplusRate: null,
    });
  });

  it("returns a negative surplus and surplus rate", () => {
    const transactions = [
      createTransaction({
        id: "income",
        amount: 200,
        type: "income",
        date: "2026-07-15",
      }),
      createTransaction({
        id: "expense",
        amount: 300,
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
      income: 200,
      expenses: 300,
      surplus: -100,
      surplusRate: -50,
    });
  });

  it("preserves a small negative surplus rate", () => {
    const summary = calculateMonthlyFinancialSummary(
      [
        createTransaction({
          id: "income",
          amount: 1_000,
          type: "income",
          date: "2026-07-15",
        }),
        createTransaction({
          id: "expense",
          amount: 1_004,
          type: "expense",
          date: "2026-07-16",
        }),
      ],
      julyReference
    );

    expect(summary.surplus).toBe(-4);
    expect(summary.surplusRate).toBeCloseTo(-0.4);
  });

  it("returns an empty summary when no transactions match", () => {
    expect(
      calculateMonthlyFinancialSummary([], julyReference)
    ).toEqual({
      income: 0,
      expenses: 0,
      surplus: 0,
      surplusRate: null,
    });
  });
});
