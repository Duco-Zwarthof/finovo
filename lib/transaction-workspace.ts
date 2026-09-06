import {
  calculateMonthlyFinancialSummary,
} from "./finance";
import {
  isInLocalCalendarMonth,
} from "./date";
import type {
  Transaction,
} from "./types";

export type TransactionWorkspaceSummary = {
  incomeMinor: number;
  expensesMinor: number;
  surplusMinor: number;
  surplusRate: number | null;
  currentMonthCount: number;
  totalCount: number;
};

export function calculateTransactionWorkspaceSummary(
  transactions: readonly Transaction[],
  referenceDate: Date
): TransactionWorkspaceSummary {
  const monthlySummary =
    calculateMonthlyFinancialSummary(
      [...transactions],
      referenceDate
    );

  const currentMonthCount =
    transactions.filter(
      (transaction) =>
        isInLocalCalendarMonth(
          transaction.date,
          referenceDate
        )
    ).length;

  return {
    ...monthlySummary,
    currentMonthCount,
    totalCount: transactions.length,
  };
}
