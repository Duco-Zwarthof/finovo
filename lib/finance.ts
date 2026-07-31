import { isInLocalCalendarMonth } from "./date";
import type { Transaction } from "./types";

export type MonthlyFinancialSummary = {
  incomeMinor: number;
  expensesMinor: number;
  surplusMinor: number;
  surplusRate: number | null;
};

export function addMinorUnits(
  total: number,
  amountMinor: number
) {
  const nextTotal = total + amountMinor;

  if (!Number.isSafeInteger(nextTotal)) {
    throw new RangeError(
      "Transaction total exceeds the safe minor-unit range"
    );
  }

  return nextTotal;
}

export function calculateIncomeMinor(
  transactions: readonly Transaction[]
): number {
  return transactions.reduce(
    (incomeMinor, transaction) =>
      transaction.type === "income"
        ? addMinorUnits(
            incomeMinor,
            transaction.amountMinor
          )
        : incomeMinor,
    0
  );
}

export function calculateExpensesMinor(
  transactions: readonly Transaction[]
): number {
  return transactions.reduce(
    (expensesMinor, transaction) =>
      transaction.type === "expense"
        ? addMinorUnits(
            expensesMinor,
            transaction.amountMinor
          )
        : expensesMinor,
    0
  );
}

export function calculateSurplusMinor(
  incomeMinor: number,
  expensesMinor: number
): number {
  const surplusMinor = incomeMinor - expensesMinor;

  if (!Number.isSafeInteger(surplusMinor)) {
    throw new RangeError(
      "Transaction surplus exceeds the safe minor-unit range"
    );
  }

  return surplusMinor;
}

export function calculateMonthlyFinancialSummary(
  transactions: Transaction[],
  referenceDate: Date
): MonthlyFinancialSummary {
  const currentMonthTransactions = transactions.filter(
    (transaction) =>
      isInLocalCalendarMonth(
        transaction.date,
        referenceDate
      )
  );
  const incomeMinor = calculateIncomeMinor(
    currentMonthTransactions
  );
  const expensesMinor = calculateExpensesMinor(
    currentMonthTransactions
  );
  const surplusMinor = calculateSurplusMinor(
    incomeMinor,
    expensesMinor
  );

  return {
    incomeMinor,
    expensesMinor,
    surplusMinor,
    surplusRate:
      incomeMinor === 0
        ? null
        : (surplusMinor / incomeMinor) * 100,
  };
}
