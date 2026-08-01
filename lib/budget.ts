import { isValidAmountMinor } from "./transaction-amount";
import { addMinorUnits } from "./finance";
import {
  isTransactionDateInBudgetMonth,
  isValidBudgetMonth,
} from "./budget-month";
import {
  BUDGET_CATEGORIES,
  type Budget,
  type BudgetCategory,
  type BudgetMonth,
  type BudgetProgress,
  type BudgetStatus,
  type MonthlyBudgetSummary,
} from "./budget-types";
import type { Transaction } from "./types";

export const BUDGET_NEAR_LIMIT_PERCENTAGE = 80;

export function isBudgetCategory(
  value: unknown
): value is BudgetCategory {
  return (
    typeof value === "string" &&
    BUDGET_CATEGORIES.includes(value as BudgetCategory)
  );
}

export function isValidBudgetLimitMinor(
  value: unknown
): value is number {
  return isValidAmountMinor(value) && value > 0;
}

export function isValidBudget(value: unknown): value is Budget {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const budget = value as Record<string, unknown>;

  return (
    typeof budget.id === "string" &&
    budget.id.trim().length > 0 &&
    isValidBudgetMonth(budget.month) &&
    isBudgetCategory(budget.category) &&
    isValidBudgetLimitMinor(budget.limitMinor)
  );
}

export function getBudgetIdentity(
  budget: Pick<Budget, "month" | "category">
): string {
  return `${budget.month}:${budget.category}`;
}

export function hasDuplicateBudget(
  budgets: readonly Budget[],
  candidate: Pick<Budget, "id" | "month" | "category">
): boolean {
  const candidateIdentity = getBudgetIdentity(candidate);

  return budgets.some(
    (budget) =>
      budget.id !== candidate.id &&
      getBudgetIdentity(budget) === candidateIdentity
  );
}

export function addBudget(
  budgets: readonly Budget[],
  budget: Budget
): Budget[] {
  if (!isValidBudget(budget)) {
    throw new TypeError("Cannot add an invalid budget");
  }

  if (
    budgets.some((existingBudget) =>
      existingBudget.id === budget.id
    ) ||
    hasDuplicateBudget(budgets, budget)
  ) {
    throw new Error(
      "A budget already exists for this category and month"
    );
  }

  return [...budgets, { ...budget }];
}

export function updateBudget(
  budgets: readonly Budget[],
  updatedBudget: Budget
): Budget[] {
  if (!isValidBudget(updatedBudget)) {
    throw new TypeError("Cannot update to an invalid budget");
  }

  if (!budgets.some((budget) => budget.id === updatedBudget.id)) {
    throw new Error("Cannot update a budget that does not exist");
  }

  if (hasDuplicateBudget(budgets, updatedBudget)) {
    throw new Error(
      "A budget already exists for this category and month"
    );
  }

  return budgets.map((budget) =>
    budget.id === updatedBudget.id
      ? { ...updatedBudget }
      : { ...budget }
  );
}

export function upsertBudget(
  budgets: readonly Budget[],
  budget: Budget
): Budget[] {
  if (!isValidBudget(budget)) {
    throw new TypeError("Cannot upsert an invalid budget");
  }

  const idIndex = budgets.findIndex(
    (existingBudget) => existingBudget.id === budget.id
  );

  if (idIndex !== -1) {
    if (hasDuplicateBudget(budgets, budget)) {
      throw new Error(
        "A budget already exists for this category and month"
      );
    }

    return budgets.map((existingBudget, index) =>
      index === idIndex ? { ...budget } : { ...existingBudget }
    );
  }

  const identity = getBudgetIdentity(budget);
  const identityIndex = budgets.findIndex(
    (existingBudget) =>
      getBudgetIdentity(existingBudget) === identity
  );

  if (identityIndex === -1) {
    return [...budgets, { ...budget }];
  }

  return budgets.map((existingBudget, index) =>
    index === identityIndex ? { ...budget } : { ...existingBudget }
  );
}

export function deleteBudget(
  budgets: readonly Budget[],
  budgetId: string
): Budget[] {
  return budgets
    .filter((budget) => budget.id !== budgetId)
    .map((budget) => ({ ...budget }));
}

function subtractMinorUnits(
  first: number,
  second: number
): number {
  const result = first - second;

  if (!Number.isSafeInteger(result)) {
    throw new RangeError(
      "Budget total exceeds the safe minor-unit range"
    );
  }

  return result;
}

function calculateUsagePercentage(
  spentMinor: number,
  limitMinor: number
): number | null {
  return limitMinor === 0
    ? null
    : (spentMinor / limitMinor) * 100;
}

export function getBudgetStatus(
  spentMinor: number,
  limitMinor: number
): BudgetStatus {
  if (spentMinor === 0) {
    return "unused";
  }

  if (spentMinor > limitMinor) {
    return "over-budget";
  }

  const usagePercentage = calculateUsagePercentage(
    spentMinor,
    limitMinor
  );

  return usagePercentage !== null &&
    usagePercentage >= BUDGET_NEAR_LIMIT_PERCENTAGE
    ? "near-limit"
    : "on-track";
}

function getMatchingBudgetTransactions(
  budget: Budget,
  transactions: readonly Transaction[]
): Transaction[] {
  return transactions.filter(
    (transaction) =>
      transaction.type === "expense" &&
      transaction.category === budget.category &&
      isTransactionDateInBudgetMonth(
        transaction.date,
        budget.month
      )
  );
}

export function calculateBudgetProgress(
  budget: Budget,
  transactions: readonly Transaction[]
): BudgetProgress {
  if (!isValidBudget(budget)) {
    throw new TypeError("Cannot calculate an invalid budget");
  }

  const matchingTransactions = getMatchingBudgetTransactions(
    budget,
    transactions
  );
  const spentMinor = matchingTransactions.reduce(
    (total, transaction) =>
      addMinorUnits(total, transaction.amountMinor),
    0
  );
  const remainingMinor = subtractMinorUnits(
    budget.limitMinor,
    spentMinor
  );

  return {
    budgetId: budget.id,
    month: budget.month,
    category: budget.category,
    limitMinor: budget.limitMinor,
    spentMinor,
    remainingMinor,
    usagePercentage: calculateUsagePercentage(
      spentMinor,
      budget.limitMinor
    ),
    status: getBudgetStatus(spentMinor, budget.limitMinor),
    transactionCount: matchingTransactions.length,
  };
}

export function calculateMonthlyBudgetSummary(
  budgets: readonly Budget[],
  transactions: readonly Transaction[],
  month: BudgetMonth
): MonthlyBudgetSummary {
  if (!isValidBudgetMonth(month)) {
    throw new RangeError("Cannot calculate an invalid budget month");
  }

  const monthlyBudgets = budgets.filter(
    (budget) => budget.month === month
  );
  const budgetedCategories = new Set<BudgetCategory>(
    monthlyBudgets.map((budget) => budget.category)
  );
  const progress = monthlyBudgets.map((budget) =>
    calculateBudgetProgress(budget, transactions)
  );

  const totalLimitMinor = progress.reduce(
    (total, item) => addMinorUnits(total, item.limitMinor),
    0
  );
  const totalSpentMinor = progress.reduce(
    (total, item) => addMinorUnits(total, item.spentMinor),
    0
  );
  const unbudgetedSpentMinor = transactions.reduce(
    (total, transaction) => {
      const isUnbudgetedExpense =
        transaction.type === "expense" &&
        isTransactionDateInBudgetMonth(
          transaction.date,
          month
        ) &&
        !budgetedCategories.has(
          transaction.category as BudgetCategory
        );

      return isUnbudgetedExpense
        ? addMinorUnits(total, transaction.amountMinor)
        : total;
    },
    0
  );

  return {
    month,
    totalLimitMinor,
    totalSpentMinor,
    totalRemainingMinor: subtractMinorUnits(
      totalLimitMinor,
      totalSpentMinor
    ),
    unbudgetedSpentMinor,
    usagePercentage: calculateUsagePercentage(
      totalSpentMinor,
      totalLimitMinor
    ),
    budgetedCategoryCount: monthlyBudgets.length,
    overBudgetCategoryCount: progress.filter(
      (item) => item.status === "over-budget"
    ).length,
  };
}
