import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateBudgetHistory,
} from "./budget-history";
import type {
  Budget,
} from "./budget-types";
import type {
  Transaction,
} from "./types";

const budgets: Budget[] = [
  {
    id: "jul-groceries",
    month: "2026-07",
    category: "Groceries",
    limitMinor: 30000,
  },
  {
    id: "aug-groceries",
    month: "2026-08",
    category: "Groceries",
    limitMinor: 30000,
  },
  {
    id: "sep-groceries",
    month: "2026-09",
    category: "Groceries",
    limitMinor: 30000,
  },
  {
    id: "aug-transport",
    month: "2026-08",
    category: "Transport",
    limitMinor: 10000,
  },
  {
    id: "sep-transport",
    month: "2026-09",
    category: "Transport",
    limitMinor: 10000,
  },
];

const transactions: Transaction[] = [
  {
    id: "jul-groceries-spend",
    title: "Groceries July",
    amountMinor: 32000,
    type: "expense",
    category: "Groceries",
    date: "2026-07-10",
  },
  {
    id: "aug-groceries-spend",
    title: "Groceries August",
    amountMinor: 35000,
    type: "expense",
    category: "Groceries",
    date: "2026-08-10",
  },
  {
    id: "sep-groceries-spend",
    title: "Groceries September",
    amountMinor: 36000,
    type: "expense",
    category: "Groceries",
    date: "2026-09-10",
  },
  {
    id: "aug-transport-spend",
    title: "Transport August",
    amountMinor: 5000,
    type: "expense",
    category: "Transport",
    date: "2026-08-11",
  },
  {
    id: "sep-transport-spend",
    title: "Transport September",
    amountMinor: 8000,
    type: "expense",
    category: "Transport",
    date: "2026-09-11",
  },
  {
    id: "sep-unbudgeted",
    title: "Netflix",
    amountMinor: 1500,
    type: "expense",
    category: "Subscriptions",
    date: "2026-09-12",
  },
  {
    id: "sep-income",
    title: "Salary",
    amountMinor: 200000,
    type: "income",
    category: "Salary",
    date: "2026-09-01",
  },
];

describe(
  "budget history",
  () => {
    it(
      "creates a continuous rolling month series",
      () => {
        const result =
          calculateBudgetHistory(
            budgets,
            transactions,
            "2026-09",
            3
          );

        expect(
          result.months.map(
            (month) =>
              month.month
          )
        ).toEqual([
          "2026-07",
          "2026-08",
          "2026-09",
        ]);
      }
    );

    it(
      "compares total monthly plan with all actual expenses",
      () => {
        const result =
          calculateBudgetHistory(
            budgets,
            transactions,
            "2026-09",
            3
          );

        expect(
          result.months[2]
            .plannedMinor
        ).toBe(40000);

        expect(
          result.months[2]
            .actualMinor
        ).toBe(45500);

        expect(
          result.months[2]
            .varianceMinor
        ).toBe(-5500);

        expect(
          result.months[2]
            .isOverPlan
        ).toBe(true);
      }
    );

    it(
      "detects a consecutive overspending streak",
      () => {
        const result =
          calculateBudgetHistory(
            budgets,
            transactions,
            "2026-09",
            3
          );

        const groceries =
          result.categories.find(
            (category) =>
              category.category ===
              "Groceries"
          );

        expect(
          groceries
            ?.currentOverspendStreak
        ).toBe(3);

        expect(
          result.recurringPressure[
            0
          ]?.category
        ).toBe("Groceries");
      }
    );

    it(
      "calculates category adherence from budgeted category-months",
      () => {
        const result =
          calculateBudgetHistory(
            budgets,
            transactions,
            "2026-09",
            3
          );

        expect(
          result.categoryAdherencePercent
        ).toBe(40);
      }
    );

    it(
      "calculates average monthly spending across the selected history window",
      () => {
        const result =
          calculateBudgetHistory(
            budgets,
            transactions,
            "2026-09",
            3
          );

        expect(
          result.averageMonthlySpentMinor
        ).toBe(39167);
      }
    );

    it(
      "returns a budget accuracy score for months with a plan",
      () => {
        const result =
          calculateBudgetHistory(
            budgets,
            transactions,
            "2026-09",
            3
          );

        expect(
          result.budgetAccuracyPercent
        ).not.toBeNull();

        expect(
          result.budgetAccuracyPercent
        ).toBeGreaterThan(80);

        expect(
          result.budgetAccuracyPercent
        ).toBeLessThan(100);
      }
    );

    it(
      "returns null plan metrics when there are no historical budgets",
      () => {
        const result =
          calculateBudgetHistory(
            [],
            transactions,
            "2026-09",
            3
          );

        expect(
          result.budgetAccuracyPercent
        ).toBeNull();

        expect(
          result.categoryAdherencePercent
        ).toBeNull();

        expect(
          result.monthsOverPlan
        ).toBe(0);
      }
    );

    it(
      "rejects unsupported history windows",
      () => {
        expect(() =>
          calculateBudgetHistory(
            budgets,
            transactions,
            "2026-09",
            1
          )
        ).toThrow(RangeError);

        expect(() =>
          calculateBudgetHistory(
            budgets,
            transactions,
            "2026-09",
            25
          )
        ).toThrow(RangeError);
      }
    );
  }
);
