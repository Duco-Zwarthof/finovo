import {
  calculateBudgetProgress,
} from "./budget";
import {
  isTransactionDateInBudgetMonth,
  isValidBudgetMonth,
  parseBudgetMonth,
  shiftBudgetMonth,
} from "./budget-month";
import {
  BUDGET_CATEGORIES,
  type Budget,
  type BudgetCategory,
  type BudgetMonth,
} from "./budget-types";
import {
  addMinorUnits,
} from "./finance";
import type {
  Transaction,
} from "./types";

export type BudgetHistoryMonthPoint = {
  month: BudgetMonth;
  label: string;
  plannedMinor: number;
  actualMinor: number;
  varianceMinor: number;
  usagePercentage: number | null;
  isOverPlan: boolean;
};

export type BudgetCategoryHistory = {
  category: BudgetCategory;
  budgetedMonthCount: number;
  overBudgetMonthCount: number;
  currentOverspendStreak: number;
  averageSpentMinor: number;
  averageLimitMinor: number | null;
  currentSpentMinor: number;
  currentLimitMinor: number | null;
  currentVarianceMinor: number | null;
  previousSpentMinor: number;
  spendingChangePercent: number | null;
};

export type BudgetHistorySummary = {
  months: BudgetHistoryMonthPoint[];
  averageMonthlySpentMinor: number;
  averageMonthlyPlannedMinor: number;
  budgetAccuracyPercent: number | null;
  categoryAdherencePercent: number | null;
  monthsOverPlan: number;
  categories: BudgetCategoryHistory[];
  recurringPressure: BudgetCategoryHistory[];
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
      "Budget history value exceeds the safe minor-unit range"
    );
  }

  return result;
}

function divideRounded(
  total: number,
  count: number
) {
  if (
    count <= 0
  ) {
    return 0;
  }

  return Math.round(
    total / count
  );
}

function calculatePercent(
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

function formatShortMonthLabel(
  month: BudgetMonth
) {
  const parsed =
    parseBudgetMonth(month);

  if (!parsed) {
    return month;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      month: "short",
      year: "2-digit",
    }
  ).format(
    new Date(
      parsed.year,
      parsed.monthIndex,
      1
    )
  );
}

function getExpenseTotal(
  transactions: readonly Transaction[],
  month: BudgetMonth,
  category?: BudgetCategory
) {
  return transactions.reduce(
    (
      total,
      transaction
    ) => {
      const matches =
        transaction.type ===
          "expense" &&
        isTransactionDateInBudgetMonth(
          transaction.date,
          month
        ) &&
        (
          category ===
            undefined ||
          transaction.category ===
            category
        );

      return matches
        ? addMinorUnits(
            total,
            transaction.amountMinor
          )
        : total;
    },
    0
  );
}

function getPlannedTotal(
  budgets: readonly Budget[],
  month: BudgetMonth
) {
  return budgets.reduce(
    (
      total,
      budget
    ) =>
      budget.month === month
        ? addMinorUnits(
            total,
            budget.limitMinor
          )
        : total,
    0
  );
}

function getCategoryBudget(
  budgets: readonly Budget[],
  month: BudgetMonth,
  category: BudgetCategory
) {
  return (
    budgets.find(
      (budget) =>
        budget.month ===
          month &&
        budget.category ===
          category
    ) ?? null
  );
}

function createMonthKeys(
  referenceMonth: BudgetMonth,
  numberOfMonths: number
) {
  return Array.from(
    {
      length:
        numberOfMonths,
    },
    (_, index) =>
      shiftBudgetMonth(
        referenceMonth,
        index -
          (
            numberOfMonths -
            1
          )
      )
  );
}

export function calculateBudgetHistory(
  budgets: readonly Budget[],
  transactions: readonly Transaction[],
  referenceMonth: BudgetMonth,
  numberOfMonths = 6
): BudgetHistorySummary {
  if (
    !isValidBudgetMonth(
      referenceMonth
    )
  ) {
    throw new RangeError(
      "Cannot calculate history for an invalid budget month"
    );
  }

  if (
    !Number.isSafeInteger(
      numberOfMonths
    ) ||
    numberOfMonths < 2 ||
    numberOfMonths > 24
  ) {
    throw new RangeError(
      "Budget history must cover between 2 and 24 months"
    );
  }

  const monthKeys =
    createMonthKeys(
      referenceMonth,
      numberOfMonths
    );

  const months =
    monthKeys.map(
      (month) => {
        const plannedMinor =
          getPlannedTotal(
            budgets,
            month
          );

        const actualMinor =
          getExpenseTotal(
            transactions,
            month
          );

        return {
          month,
          label:
            formatShortMonthLabel(
              month
            ),
          plannedMinor,
          actualMinor,
          varianceMinor:
            subtractMinorUnits(
              plannedMinor,
              actualMinor
            ),
          usagePercentage:
            calculatePercent(
              actualMinor,
              plannedMinor
            ),
          isOverPlan:
            plannedMinor > 0 &&
            actualMinor >
              plannedMinor,
        };
      }
    );

  const totalSpentMinor =
    months.reduce(
      (total, month) =>
        addMinorUnits(
          total,
          month.actualMinor
        ),
      0
    );

  const totalPlannedMinor =
    months.reduce(
      (total, month) =>
        addMinorUnits(
          total,
          month.plannedMinor
        ),
      0
    );

  const budgetedMonths =
    months.filter(
      (month) =>
        month.plannedMinor >
        0
    );

  const accuracyScores =
    budgetedMonths.map(
      (month) => {
        const deviation =
          Math.abs(
            subtractMinorUnits(
              month.actualMinor,
              month.plannedMinor
            )
          );

        const deviationPercent =
          calculatePercent(
            deviation,
            month.plannedMinor
          ) ?? 0;

        return Math.max(
          0,
          100 -
            deviationPercent
        );
      }
    );

  const categoryRecords =
    BUDGET_CATEGORIES.flatMap(
      (category) =>
        monthKeys.flatMap(
          (month) => {
            const budget =
              getCategoryBudget(
                budgets,
                month,
                category
              );

            if (!budget) {
              return [];
            }

            return [
              calculateBudgetProgress(
                budget,
                transactions
              ),
            ];
          }
        )
    );

  const categoryAdherencePercent =
    categoryRecords.length ===
    0
      ? null
      : (
          categoryRecords.filter(
            (record) =>
              record.status !==
              "over-budget"
          ).length /
          categoryRecords.length
        ) * 100;

  const categories =
    BUDGET_CATEGORIES.map(
      (category) => {
        const spentByMonth =
          monthKeys.map(
            (month) =>
              getExpenseTotal(
                transactions,
                month,
                category
              )
          );

        const categoryBudgets =
          monthKeys.map(
            (month) =>
              getCategoryBudget(
                budgets,
                month,
                category
              )
          );

        const budgetedProgress =
          categoryBudgets.flatMap(
            (budget) =>
              budget
                ? [
                    calculateBudgetProgress(
                      budget,
                      transactions
                    ),
                  ]
                : []
          );

        let currentOverspendStreak =
          0;

        for (
          let index =
            monthKeys.length -
            1;
          index >= 0;
          index -= 1
        ) {
          const budget =
            categoryBudgets[
              index
            ];

          if (!budget) {
            break;
          }

          const spentMinor =
            spentByMonth[index];

          if (
            spentMinor >
            budget.limitMinor
          ) {
            currentOverspendStreak +=
              1;
            continue;
          }

          break;
        }

        const currentBudget =
          categoryBudgets[
            categoryBudgets.length -
              1
          ];

        const currentSpentMinor =
          spentByMonth[
            spentByMonth.length -
              1
          ];

        const previousSpentMinor =
          spentByMonth[
            spentByMonth.length -
              2
          ];

        const limitTotal =
          categoryBudgets.reduce(
            (
              total,
              budget
            ) =>
              budget
                ? addMinorUnits(
                    total,
                    budget.limitMinor
                  )
                : total,
            0
          );

        const budgetedMonthCount =
          categoryBudgets.filter(
            Boolean
          ).length;

        return {
          category,
          budgetedMonthCount,
          overBudgetMonthCount:
            budgetedProgress.filter(
              (record) =>
                record.status ===
                "over-budget"
            ).length,
          currentOverspendStreak,
          averageSpentMinor:
            divideRounded(
              spentByMonth.reduce(
                (
                  total,
                  amount
                ) =>
                  addMinorUnits(
                    total,
                    amount
                  ),
                0
              ),
              monthKeys.length
            ),
          averageLimitMinor:
            budgetedMonthCount ===
            0
              ? null
              : divideRounded(
                  limitTotal,
                  budgetedMonthCount
                ),
          currentSpentMinor,
          currentLimitMinor:
            currentBudget
              ?.limitMinor ??
            null,
          currentVarianceMinor:
            currentBudget
              ? subtractMinorUnits(
                  currentBudget.limitMinor,
                  currentSpentMinor
                )
              : null,
          previousSpentMinor,
          spendingChangePercent:
            calculatePercent(
              subtractMinorUnits(
                currentSpentMinor,
                previousSpentMinor
              ),
              previousSpentMinor
            ),
        };
      }
    ).filter(
      (category) =>
        category.budgetedMonthCount >
          0 ||
        category.averageSpentMinor >
          0
    );

  const recurringPressure =
    categories
      .filter(
        (category) =>
          category.currentOverspendStreak >=
          2
      )
      .sort(
        (first, second) =>
          second.currentOverspendStreak -
            first.currentOverspendStreak ||
          second.overBudgetMonthCount -
            first.overBudgetMonthCount
      );

  return {
    months,
    averageMonthlySpentMinor:
      divideRounded(
        totalSpentMinor,
        monthKeys.length
      ),
    averageMonthlyPlannedMinor:
      divideRounded(
        totalPlannedMinor,
        monthKeys.length
      ),
    budgetAccuracyPercent:
      accuracyScores.length ===
      0
        ? null
        : accuracyScores.reduce(
            (
              total,
              score
            ) =>
              total + score,
            0
          ) /
          accuracyScores.length,
    categoryAdherencePercent,
    monthsOverPlan:
      months.filter(
        (month) =>
          month.isOverPlan
      ).length,
    categories,
    recurringPressure,
  };
}
