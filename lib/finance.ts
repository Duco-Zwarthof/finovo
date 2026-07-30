import { isInLocalCalendarMonth } from "./date";
import type { Transaction } from "./types";

export type MonthlyFinancialSummary = {
  income: number;
  expenses: number;
  surplus: number;
  surplusRate: number | null;
};

export function calculateMonthlyFinancialSummary(
  transactions: Transaction[],
  referenceDate: Date
): MonthlyFinancialSummary {
  let income = 0;
  let expenses = 0;

  transactions.forEach((transaction) => {
    if (
      !isInLocalCalendarMonth(transaction.date, referenceDate)
    ) {
      return;
    }

    if (transaction.type === "income") {
      income += transaction.amount;
    } else {
      expenses += transaction.amount;
    }
  });

  const surplus = income - expenses;

  return {
    income,
    expenses,
    surplus,
    surplusRate:
      income === 0
        ? null
        : (surplus / income) * 100,
  };
}
