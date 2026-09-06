import {
  calculateBudgetProgress,
  calculateMonthlyBudgetSummary,
} from "./budget";
import {
  getPreviousBudgetMonth,
  isTransactionDateInBudgetMonth,
} from "./budget-month";
import type {
  Budget,
  BudgetCategory,
  BudgetMonth,
} from "./budget-types";
import {
  addMinorUnits,
} from "./finance";
import type {
  Transaction,
} from "./types";

export type BudgetActualStatus =
  | "no-budget"
  | "on-track"
  | "near-limit"
  | "over-budget";

export type BudgetActualCategoryVariance = {
  category: BudgetCategory;
  limitMinor: number;
  spentMinor: number;
  varianceMinor: number;
};

export type BudgetActualInsight = {
  month: BudgetMonth;
  previousMonth: BudgetMonth;
  plannedMinor: number;
  budgetedSpentMinor: number;
  unbudgetedSpentMinor: number;
  actualSpentMinor: number;
  varianceMinor: number;
  usagePercentage: number | null;
  status: BudgetActualStatus;
  previousMonthSpentMinor: number;
  monthOverMonthChangePercent: number | null;
  overBudgetCategoryCount: number;
  nearLimitCategoryCount: number;
  largestOverrun: BudgetActualCategoryVariance | null;
  largestBuffer: BudgetActualCategoryVariance | null;
};

function subtractMinorUnits(
  first: number,
  second: number
) {
  const result =
    first - second;

  if (
    !Number.isSafeInteger(
      result
    )
  ) {
    throw new RangeError(
      "Budget variance exceeds the safe minor-unit range"
    );
  }

  return result;
}

function calculatePercentage(
  numerator: number,
  denominator: number
) {
  if (
    denominator === 0
  ) {
    return null;
  }

  return (
    numerator /
    denominator
  ) * 100;
}

function getActualStatus(
  plannedMinor: number,
  actualSpentMinor: number
): BudgetActualStatus {
  if (
    plannedMinor === 0
  ) {
    return "no-budget";
  }

  if (
    actualSpentMinor >
    plannedMinor
  ) {
    return "over-budget";
  }

  const usage =
    calculatePercentage(
      actualSpentMinor,
      plannedMinor
    );

  if (
    usage !== null &&
    usage >= 80
  ) {
    return "near-limit";
  }

  return "on-track";
}

function calculateExpenseTotalForMonth(
  transactions: readonly Transaction[],
  month: BudgetMonth
) {
  return transactions.reduce(
    (
      total,
      transaction
    ) => {
      if (
        transaction.type !==
          "expense" ||
        !isTransactionDateInBudgetMonth(
          transaction.date,
          month
        )
      ) {
        return total;
      }

      return addMinorUnits(
        total,
        transaction.amountMinor
      );
    },
    0
  );
}

function createCategoryVariances(
  budgets: readonly Budget[],
  transactions: readonly Transaction[],
  month: BudgetMonth
) {
  return budgets
    .filter(
      (budget) =>
        budget.month ===
        month
    )
    .map((budget) => {
      const progress =
        calculateBudgetProgress(
          budget,
          transactions
        );

      return {
        category:
          progress.category,
        limitMinor:
          progress.limitMinor,
        spentMinor:
          progress.spentMinor,
        varianceMinor:
          subtractMinorUnits(
            progress.limitMinor,
            progress.spentMinor
          ),
      };
    });
}

export function calculateBudgetActualInsight(
  budgets: readonly Budget[],
  transactions: readonly Transaction[],
  month: BudgetMonth
): BudgetActualInsight {
  const summary =
    calculateMonthlyBudgetSummary(
      budgets,
      transactions,
      month
    );

  const previousMonth =
    getPreviousBudgetMonth(
      month
    );

  const actualSpentMinor =
    calculateExpenseTotalForMonth(
      transactions,
      month
    );

  const previousMonthSpentMinor =
    calculateExpenseTotalForMonth(
      transactions,
      previousMonth
    );

  const categoryVariances =
    createCategoryVariances(
      budgets,
      transactions,
      month
    );

  const overBudget =
    categoryVariances
      .filter(
        (item) =>
          item.varianceMinor <
          0
      )
      .sort(
        (first, second) =>
          first.varianceMinor -
          second.varianceMinor
      );

  const withBuffer =
    categoryVariances
      .filter(
        (item) =>
          item.varianceMinor >
          0
      )
      .sort(
        (first, second) =>
          second.varianceMinor -
          first.varianceMinor
      );

  const progress =
    budgets
      .filter(
        (budget) =>
          budget.month ===
          month
      )
      .map((budget) =>
        calculateBudgetProgress(
          budget,
          transactions
        )
      );

  return {
    month,
    previousMonth,
    plannedMinor:
      summary.totalLimitMinor,
    budgetedSpentMinor:
      summary.totalSpentMinor,
    unbudgetedSpentMinor:
      summary.unbudgetedSpentMinor,
    actualSpentMinor,
    varianceMinor:
      subtractMinorUnits(
        summary.totalLimitMinor,
        actualSpentMinor
      ),
    usagePercentage:
      calculatePercentage(
        actualSpentMinor,
        summary.totalLimitMinor
      ),
    status:
      getActualStatus(
        summary.totalLimitMinor,
        actualSpentMinor
      ),
    previousMonthSpentMinor,
    monthOverMonthChangePercent:
      calculatePercentage(
        subtractMinorUnits(
          actualSpentMinor,
          previousMonthSpentMinor
        ),
        previousMonthSpentMinor
      ),
    overBudgetCategoryCount:
      progress.filter(
        (item) =>
          item.status ===
          "over-budget"
      ).length,
    nearLimitCategoryCount:
      progress.filter(
        (item) =>
          item.status ===
          "near-limit"
      ).length,
    largestOverrun:
      overBudget[0] ??
      null,
    largestBuffer:
      withBuffer[0] ??
      null,
  };
}
