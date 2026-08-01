import { describe, expect, it } from "vitest";

import {
  addBudget,
  BUDGET_NEAR_LIMIT_PERCENTAGE,
  calculateBudgetProgress,
  calculateMonthlyBudgetSummary,
  deleteBudget,
  getBudgetStatus,
  hasDuplicateBudget,
  isBudgetCategory,
  isValidBudget,
  isValidBudgetLimitMinor,
  updateBudget,
  upsertBudget,
} from "./budget";
import {
  compareBudgetMonths,
  formatBudgetMonth,
  getNextBudgetMonth,
  getPreviousBudgetMonth,
  isTransactionDateInBudgetMonth,
  isValidBudgetMonth,
  parseBudgetMonth,
  shiftBudgetMonth,
} from "./budget-month";
import type { Budget } from "./budget-types";
import type { Transaction } from "./types";

function createBudget(
  overrides: Partial<Budget> = {}
): Budget {
  return {
    id: "budget-groceries-2026-08",
    month: "2026-08",
    category: "Groceries",
    limitMinor: 30_000,
    ...overrides,
  };
}

function createTransaction(
  overrides: Partial<Transaction> = {}
): Transaction {
  return {
    id: "transaction-1",
    title: "Groceries",
    amountMinor: 5_000,
    type: "expense",
    category: "Groceries",
    date: "2026-08-10",
    ...overrides,
  };
}

describe("budget month", () => {
  it.each(["2026-01", "2026-08", "2027-12"])(
    "accepts %s",
    (month) => {
      expect(isValidBudgetMonth(month)).toBe(true);
    }
  );

  it.each([
    "2026-00",
    "2026-13",
    "26-08",
    "August 2026",
    "2026-1",
    "0000-01",
  ])("rejects %s", (month) => {
    expect(isValidBudgetMonth(month)).toBe(false);
  });

  it("parses a valid month", () => {
    expect(parseBudgetMonth("2026-08")).toEqual({
      year: 2026,
      monthIndex: 7,
    });
  });

  it("formats a date using the local calendar", () => {
    expect(formatBudgetMonth(new Date(2026, 7, 31))).toBe(
      "2026-08"
    );
  });

  it("matches a transaction date to a budget month", () => {
    expect(
      isTransactionDateInBudgetMonth(
        "2026-08-31",
        "2026-08"
      )
    ).toBe(true);
    expect(
      isTransactionDateInBudgetMonth(
        "2026-09-01",
        "2026-08"
      )
    ).toBe(false);
    expect(
      isTransactionDateInBudgetMonth(
        "2026-02-30",
        "2026-02"
      )
    ).toBe(false);
  });

  it("moves across year boundaries", () => {
    expect(getPreviousBudgetMonth("2026-01")).toBe(
      "2025-12"
    );
    expect(getNextBudgetMonth("2026-12")).toBe(
      "2027-01"
    );
    expect(shiftBudgetMonth("2026-08", 18)).toBe(
      "2028-02"
    );
  });

  it("compares budget months chronologically", () => {
    expect(compareBudgetMonths("2026-08", "2026-07")).toBe(
      1
    );
    expect(compareBudgetMonths("2026-08", "2026-08")).toBe(
      0
    );
    expect(compareBudgetMonths("2025-12", "2026-01")).toBe(
      -1
    );
  });
});

describe("budget validation and CRUD", () => {
  it("accepts the supported categories", () => {
    expect(isBudgetCategory("Housing")).toBe(true);
    expect(isBudgetCategory("Groceries")).toBe(true);
    expect(isBudgetCategory("Salary")).toBe(false);
    expect(isBudgetCategory("Investments")).toBe(false);
  });

  it("requires a positive safe-integer limit", () => {
    expect(isValidBudgetLimitMinor(1)).toBe(true);
    expect(isValidBudgetLimitMinor(0)).toBe(false);
    expect(isValidBudgetLimitMinor(-1)).toBe(false);
    expect(isValidBudgetLimitMinor(1.5)).toBe(false);
    expect(
      isValidBudgetLimitMinor(Number.MAX_SAFE_INTEGER + 1)
    ).toBe(false);
  });

  it("validates a complete budget", () => {
    expect(isValidBudget(createBudget())).toBe(true);
    expect(
      isValidBudget(createBudget({ id: "" }))
    ).toBe(false);
    expect(
      isValidBudget(createBudget({ limitMinor: 0 }))
    ).toBe(false);
  });

  it("detects duplicate month/category combinations", () => {
    const existing = createBudget();

    expect(
      hasDuplicateBudget([existing], {
        id: "another-id",
        month: existing.month,
        category: existing.category,
      })
    ).toBe(true);
    expect(
      hasDuplicateBudget([existing], existing)
    ).toBe(false);
  });

  it("adds without mutating the original array", () => {
    const budgets: Budget[] = [];
    const budget = createBudget();
    const result = addBudget(budgets, budget);

    expect(budgets).toEqual([]);
    expect(result).toEqual([budget]);
    expect(result).not.toBe(budgets);
  });

  it("rejects duplicate additions", () => {
    const existing = createBudget();

    expect(() =>
      addBudget([
        existing,
      ], createBudget({ id: "duplicate" }))
    ).toThrow(/already exists/i);
  });

  it("updates a budget immutably", () => {
    const existing = createBudget();
    const updated = createBudget({ limitMinor: 40_000 });
    const result = updateBudget([existing], updated);

    expect(result).toEqual([updated]);
    expect(result[0]).not.toBe(existing);
  });

  it("prevents an update from creating a duplicate", () => {
    const groceries = createBudget();
    const transport = createBudget({
      id: "transport",
      category: "Transport",
    });

    expect(() =>
      updateBudget(
        [groceries, transport],
        createBudget({
          id: "transport",
          category: "Groceries",
        })
      )
    ).toThrow(/already exists/i);
  });

  it("upserts by category and month", () => {
    const existing = createBudget();
    const replacement = createBudget({
      id: "replacement",
      limitMinor: 45_000,
    });

    expect(upsertBudget([existing], replacement)).toEqual([
      replacement,
    ]);
  });

  it("deletes a budget without mutating the original", () => {
    const existing = createBudget();
    const result = deleteBudget([existing], existing.id);

    expect(result).toEqual([]);
  });
});

describe("budget calculations", () => {
  it("returns unused progress without transactions", () => {
    expect(calculateBudgetProgress(createBudget(), [])).toEqual({
      budgetId: "budget-groceries-2026-08",
      month: "2026-08",
      category: "Groceries",
      limitMinor: 30_000,
      spentMinor: 0,
      remainingMinor: 30_000,
      usagePercentage: 0,
      status: "unused",
      transactionCount: 0,
    });
  });

  it("includes only matching expense transactions", () => {
    const transactions: Transaction[] = [
      createTransaction({ id: "matching", amountMinor: 10_001 }),
      createTransaction({
        id: "income",
        type: "income",
        amountMinor: 50_000,
      }),
      createTransaction({
        id: "other-category",
        category: "Transport",
        amountMinor: 7_000,
      }),
      createTransaction({
        id: "other-month",
        date: "2026-09-01",
        amountMinor: 8_000,
      }),
    ];

    const progress = calculateBudgetProgress(
      createBudget(),
      transactions
    );

    expect(progress.spentMinor).toBe(10_001);
    expect(progress.transactionCount).toBe(1);
    expect(progress.remainingMinor).toBe(19_999);
  });

  it("keeps repeated cent values exact", () => {
    const transactions = Array.from({ length: 30 }, (_, index) =>
      createTransaction({
        id: `cent-${index}`,
        amountMinor: 1,
      })
    );

    expect(
      calculateBudgetProgress(createBudget(), transactions)
        .spentMinor
    ).toBe(30);
  });

  it.each([
    [0, "unused"],
    [1, "on-track"],
    [BUDGET_NEAR_LIMIT_PERCENTAGE, "near-limit"],
    [100, "near-limit"],
    [101, "over-budget"],
  ] as const)(
    "returns the correct status at %s%%",
    (percentage, expectedStatus) => {
      expect(getBudgetStatus(percentage, 100)).toBe(
        expectedStatus
      );
    }
  );

  it("returns negative remaining money when over budget", () => {
    const progress = calculateBudgetProgress(
      createBudget({ limitMinor: 10_000 }),
      [createTransaction({ amountMinor: 12_500 })]
    );

    expect(progress.remainingMinor).toBe(-2_500);
    expect(progress.usagePercentage).toBe(125);
    expect(progress.status).toBe("over-budget");
  });

  it("creates a monthly summary and keeps unbudgeted spending visible", () => {
    const budgets = [
      createBudget({ limitMinor: 30_000 }),
      createBudget({
        id: "budget-transport",
        category: "Transport",
        limitMinor: 10_000,
      }),
    ];
    const transactions = [
      createTransaction({ amountMinor: 25_000 }),
      createTransaction({
        id: "transport-expense",
        category: "Transport",
        amountMinor: 12_000,
      }),
      createTransaction({
        id: "entertainment-expense",
        category: "Entertainment",
        amountMinor: 4_500,
      }),
      createTransaction({
        id: "salary",
        type: "income",
        category: "Salary",
        amountMinor: 200_000,
      }),
      createTransaction({
        id: "other-month",
        category: "Entertainment",
        amountMinor: 9_000,
        date: "2026-09-01",
      }),
    ];

    expect(
      calculateMonthlyBudgetSummary(
        budgets,
        transactions,
        "2026-08"
      )
    ).toEqual({
      month: "2026-08",
      totalLimitMinor: 40_000,
      totalSpentMinor: 37_000,
      totalRemainingMinor: 3_000,
      unbudgetedSpentMinor: 4_500,
      usagePercentage: 92.5,
      budgetedCategoryCount: 2,
      overBudgetCategoryCount: 1,
    });
  });

  it("returns an unavailable usage percentage without budgets", () => {
    expect(
      calculateMonthlyBudgetSummary([], [], "2026-08")
    ).toEqual({
      month: "2026-08",
      totalLimitMinor: 0,
      totalSpentMinor: 0,
      totalRemainingMinor: 0,
      unbudgetedSpentMinor: 0,
      usagePercentage: null,
      budgetedCategoryCount: 0,
      overBudgetCategoryCount: 0,
    });
  });

  it("throws when an aggregate exceeds the safe integer range", () => {
    const budget = createBudget({
      limitMinor: Number.MAX_SAFE_INTEGER,
    });
    const transactions = [
      createTransaction({
        id: "first",
        amountMinor: Number.MAX_SAFE_INTEGER,
      }),
      createTransaction({ id: "second", amountMinor: 1 }),
    ];

    expect(() =>
      calculateBudgetProgress(budget, transactions)
    ).toThrow(/safe minor-unit range/i);
  });
});
