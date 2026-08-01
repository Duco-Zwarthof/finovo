import {
  formatLocalDate,
  getLocalCalendarMonthKey,
  parseLocalDate,
} from "./date";
import type { BudgetMonth } from "./budget-types";

const BUDGET_MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

export type ParsedBudgetMonth = {
  year: number;
  monthIndex: number;
};

export function parseBudgetMonth(
  value: string
): ParsedBudgetMonth | null {
  const match = BUDGET_MONTH_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (year < 1 || month < 1 || month > 12) {
    return null;
  }

  return {
    year,
    monthIndex: month - 1,
  };
}

export function isValidBudgetMonth(
  value: unknown
): value is BudgetMonth {
  return (
    typeof value === "string" &&
    parseBudgetMonth(value) !== null
  );
}

export function formatBudgetMonth(date: Date): BudgetMonth {
  return formatLocalDate(date).slice(0, 7);
}

export function getTransactionBudgetMonth(
  transactionDate: string
): BudgetMonth | null {
  return getLocalCalendarMonthKey(transactionDate);
}

export function isTransactionDateInBudgetMonth(
  transactionDate: string,
  budgetMonth: BudgetMonth
): boolean {
  if (!isValidBudgetMonth(budgetMonth)) {
    return false;
  }

  return (
    parseLocalDate(transactionDate) !== null &&
    getTransactionBudgetMonth(transactionDate) === budgetMonth
  );
}

export function compareBudgetMonths(
  first: BudgetMonth,
  second: BudgetMonth
): number {
  const parsedFirst = parseBudgetMonth(first);
  const parsedSecond = parseBudgetMonth(second);

  if (!parsedFirst || !parsedSecond) {
    throw new RangeError("Cannot compare an invalid budget month");
  }

  const firstIndex =
    parsedFirst.year * 12 + parsedFirst.monthIndex;
  const secondIndex =
    parsedSecond.year * 12 + parsedSecond.monthIndex;

  return firstIndex - secondIndex;
}

export function shiftBudgetMonth(
  month: BudgetMonth,
  offset: number
): BudgetMonth {
  const parsedMonth = parseBudgetMonth(month);

  if (!parsedMonth || !Number.isSafeInteger(offset)) {
    throw new RangeError("Cannot shift an invalid budget month");
  }

  const date = new Date(0);
  date.setFullYear(
    parsedMonth.year,
    parsedMonth.monthIndex + offset,
    1
  );
  date.setHours(0, 0, 0, 0);

  if (date.getFullYear() < 1) {
    throw new RangeError("Budget month is outside the supported range");
  }

  return formatBudgetMonth(date);
}

export function getPreviousBudgetMonth(
  month: BudgetMonth
): BudgetMonth {
  return shiftBudgetMonth(month, -1);
}

export function getNextBudgetMonth(
  month: BudgetMonth
): BudgetMonth {
  return shiftBudgetMonth(month, 1);
}
