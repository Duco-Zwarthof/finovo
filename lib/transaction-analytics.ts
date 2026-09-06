import {
  isInLocalCalendarMonth,
} from "./date";
import type {
  Transaction,
  TransactionCategory,
} from "./types";

export type TransactionCategoryBreakdown = {
  category: TransactionCategory;
  amountMinor: number;
  count: number;
  sharePercent: number;
};

export type DailyExpensePoint = {
  date: string;
  amountMinor: number;
};

export type TransactionAnalytics = {
  expenseTotalMinor: number;
  expenseCount: number;
  averageExpenseMinor: number;
  largestExpense:
    | {
        title: string;
        amountMinor: number;
        category: TransactionCategory;
      }
    | null;
  topCategory:
    | TransactionCategoryBreakdown
    | null;
  categoryBreakdown:
    TransactionCategoryBreakdown[];
  dailyExpenses: DailyExpensePoint[];
};

export function calculateTransactionAnalytics(
  transactions: readonly Transaction[],
  referenceDate: Date
): TransactionAnalytics {
  const expenses =
    transactions.filter(
      (transaction) =>
        transaction.type ===
          "expense" &&
        isInLocalCalendarMonth(
          transaction.date,
          referenceDate
        )
    );

  const expenseTotalMinor =
    expenses.reduce(
      (total, transaction) =>
        total +
        transaction.amountMinor,
      0
    );

  const categoryTotals =
    new Map<
      TransactionCategory,
      {
        amountMinor: number;
        count: number;
      }
    >();

  const dailyTotals =
    new Map<string, number>();

  let largestExpense:
    TransactionAnalytics["largestExpense"] =
    null;

  for (const expense of expenses) {
    const currentCategory =
      categoryTotals.get(
        expense.category
      ) ?? {
        amountMinor: 0,
        count: 0,
      };

    categoryTotals.set(
      expense.category,
      {
        amountMinor:
          currentCategory.amountMinor +
          expense.amountMinor,
        count:
          currentCategory.count + 1,
      }
    );

    dailyTotals.set(
      expense.date,
      (dailyTotals.get(
        expense.date
      ) ?? 0) +
        expense.amountMinor
    );

    if (
      !largestExpense ||
      expense.amountMinor >
        largestExpense.amountMinor
    ) {
      largestExpense = {
        title: expense.title,
        amountMinor:
          expense.amountMinor,
        category:
          expense.category,
      };
    }
  }

  const categoryBreakdown =
    Array.from(
      categoryTotals.entries()
    )
      .map(
        ([
          category,
          values,
        ]) => ({
          category,
          amountMinor:
            values.amountMinor,
          count: values.count,
          sharePercent:
            expenseTotalMinor > 0
              ? (values.amountMinor /
                  expenseTotalMinor) *
                100
              : 0,
        })
      )
      .sort(
        (first, second) =>
          second.amountMinor -
          first.amountMinor
      );

  const dailyExpenses =
    Array.from(
      dailyTotals.entries()
    )
      .map(
        ([date, amountMinor]) => ({
          date,
          amountMinor,
        })
      )
      .sort((first, second) =>
        first.date.localeCompare(
          second.date
        )
      );

  return {
    expenseTotalMinor,
    expenseCount:
      expenses.length,
    averageExpenseMinor:
      expenses.length > 0
        ? Math.round(
            expenseTotalMinor /
              expenses.length
          )
        : 0,
    largestExpense,
    topCategory:
      categoryBreakdown[0] ??
      null,
    categoryBreakdown,
    dailyExpenses,
  };
}
