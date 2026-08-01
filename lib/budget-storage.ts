import { getBudgetIdentity, isValidBudget } from "./budget";
import type { Budget } from "./budget-types";
import type {
  StorageLike,
  StorageWriteResult,
} from "./storage";

export const BUDGET_STORAGE_KEY = "finovo-budgets";
export const BUDGET_STORAGE_VERSION = 1 as const;

export type PersistedBudgetV1 = {
  id: string;
  month: string;
  category: Budget["category"];
  limitMinor: number;
};

export type PersistedBudgetDataV1 = {
  version: typeof BUDGET_STORAGE_VERSION;
  budgets: PersistedBudgetV1[];
};

export type BudgetStorageReadStatus =
  | "missing"
  | "valid"
  | "recovered"
  | "invalid"
  | "unsupported"
  | "unavailable";

export type BudgetStorageReadResult = {
  value: Budget[];
  status: BudgetStorageReadStatus;
};

export type BudgetStorageValidationResult = {
  value: Budget[];
  recovered: boolean;
};

function getBrowserStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function cloneBudgets(
  budgets: readonly Budget[]
): Budget[] {
  return budgets.map((budget) => ({ ...budget }));
}

function parsePersistedBudgetV1(
  value: unknown
): Budget | null {
  if (!isRecord(value)) {
    return null;
  }

  const budget: Budget = {
    id: typeof value.id === "string" ? value.id : "",
    month:
      typeof value.month === "string" ? value.month : "",
    category: value.category as Budget["category"],
    limitMinor:
      typeof value.limitMinor === "number"
        ? value.limitMinor
        : Number.NaN,
  };

  return isValidBudget(budget) ? budget : null;
}

export function validatePersistedBudgetDataV1(
  value: unknown
): BudgetStorageValidationResult | null {
  if (
    !isRecord(value) ||
    value.version !== BUDGET_STORAGE_VERSION ||
    !Array.isArray(value.budgets)
  ) {
    return null;
  }

  const budgets: Budget[] = [];
  const budgetIds = new Set<string>();
  const budgetIdentities = new Set<string>();
  let recovered = false;

  value.budgets.forEach((entry) => {
    const budget = parsePersistedBudgetV1(entry);

    if (!budget) {
      recovered = true;
      return;
    }

    const identity = getBudgetIdentity(budget);

    if (
      budgetIds.has(budget.id) ||
      budgetIdentities.has(identity)
    ) {
      recovered = true;
      return;
    }

    budgetIds.add(budget.id);
    budgetIdentities.add(identity);
    budgets.push({ ...budget });
  });

  return {
    value: budgets,
    recovered,
  };
}

export function createPersistedBudgetDataV1(
  budgets: readonly Budget[]
): PersistedBudgetDataV1 {
  const validation = validatePersistedBudgetDataV1({
    version: BUDGET_STORAGE_VERSION,
    budgets,
  });

  if (
    !validation ||
    validation.recovered ||
    validation.value.length !== budgets.length
  ) {
    throw new TypeError(
      "Cannot persist invalid or duplicate budgets"
    );
  }

  return {
    version: BUDGET_STORAGE_VERSION,
    budgets: validation.value.map((budget) => ({
      id: budget.id,
      month: budget.month,
      category: budget.category,
      limitMinor: budget.limitMinor,
    })),
  };
}

export function readStoredBudgets(
  fallback: readonly Budget[] = [],
  storage: StorageLike | null = getBrowserStorage()
): BudgetStorageReadResult {
  const fallbackValue = () => cloneBudgets(fallback);

  if (!storage) {
    return {
      value: fallbackValue(),
      status: "unavailable",
    };
  }

  let storedValue: string | null;

  try {
    storedValue = storage.getItem(BUDGET_STORAGE_KEY);
  } catch {
    return {
      value: fallbackValue(),
      status: "unavailable",
    };
  }

  if (storedValue === null) {
    return {
      value: fallbackValue(),
      status: "missing",
    };
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(storedValue) as unknown;
  } catch {
    return {
      value: fallbackValue(),
      status: "invalid",
    };
  }

  if (
    isRecord(parsedValue) &&
    "version" in parsedValue &&
    parsedValue.version !== BUDGET_STORAGE_VERSION
  ) {
    return {
      value: fallbackValue(),
      status: "unsupported",
    };
  }

  const result = validatePersistedBudgetDataV1(parsedValue);

  if (!result) {
    return {
      value: fallbackValue(),
      status: "invalid",
    };
  }

  return {
    value: result.value,
    status: result.recovered ? "recovered" : "valid",
  };
}

export function writeStoredBudgets(
  budgets: readonly Budget[],
  storage: StorageLike | null = getBrowserStorage()
): StorageWriteResult {
  if (!storage) {
    return { status: "unavailable" };
  }

  let persistedData: PersistedBudgetDataV1;

  try {
    persistedData = createPersistedBudgetDataV1(budgets);
  } catch {
    return { status: "failed" };
  }

  try {
    storage.setItem(
      BUDGET_STORAGE_KEY,
      JSON.stringify(persistedData)
    );
    return { status: "written" };
  } catch {
    return { status: "failed" };
  }
}
