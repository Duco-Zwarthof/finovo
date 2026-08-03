import type {
  RecurringTransaction,
} from "./recurring-transaction-types";
import {
  isValidRecurringTransaction,
} from "./recurring-transactions";
import type {
  StorageLike,
  StorageWriteResult,
} from "./storage";

export const RECURRING_TRANSACTION_STORAGE_KEY =
  "finovo-recurring-transactions";

export const RECURRING_TRANSACTION_STORAGE_VERSION =
  1 as const;

export type PersistedRecurringTransactionDataV1 = {
  version:
    typeof RECURRING_TRANSACTION_STORAGE_VERSION;
  items: RecurringTransaction[];
};

export type RecurringTransactionStorageReadStatus =
  | "missing"
  | "valid"
  | "invalid"
  | "unsupported"
  | "unavailable";

export type RecurringTransactionStorageReadResult = {
  value: RecurringTransaction[];
  status:
    RecurringTransactionStorageReadStatus;
};

function getBrowserStorage():
  | StorageLike
  | null {
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

function cloneItems(
  items: readonly RecurringTransaction[]
): RecurringTransaction[] {
  return items.map((item) => ({
    ...item,
  }));
}

export function createPersistedRecurringTransactionDataV1(
  items: readonly RecurringTransaction[]
): PersistedRecurringTransactionDataV1 {
  const ids = new Set<string>();

  for (const item of items) {
    if (
      !isValidRecurringTransaction(item) ||
      ids.has(item.id)
    ) {
      throw new TypeError(
        "Cannot persist invalid or duplicate recurring transactions"
      );
    }

    ids.add(item.id);
  }

  return {
    version:
      RECURRING_TRANSACTION_STORAGE_VERSION,
    items: cloneItems(items),
  };
}

export function validatePersistedRecurringTransactionDataV1(
  value: unknown
): RecurringTransaction[] | null {
  if (
    !isRecord(value) ||
    value.version !==
      RECURRING_TRANSACTION_STORAGE_VERSION ||
    !Array.isArray(value.items)
  ) {
    return null;
  }

  const items: RecurringTransaction[] = [];
  const ids = new Set<string>();

  for (const entry of value.items) {
    if (
      !isValidRecurringTransaction(entry) ||
      ids.has(entry.id)
    ) {
      return null;
    }

    ids.add(entry.id);
    items.push({ ...entry });
  }

  return items;
}

export function readStoredRecurringTransactions(
  fallback: readonly RecurringTransaction[] = [],
  storage: StorageLike | null =
    getBrowserStorage()
): RecurringTransactionStorageReadResult {
  const fallbackValue = () =>
    cloneItems(fallback);

  if (!storage) {
    return {
      value: fallbackValue(),
      status: "unavailable",
    };
  }

  let storedValue: string | null;

  try {
    storedValue = storage.getItem(
      RECURRING_TRANSACTION_STORAGE_KEY
    );
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
    parsedValue = JSON.parse(
      storedValue
    ) as unknown;
  } catch {
    return {
      value: fallbackValue(),
      status: "invalid",
    };
  }

  if (
    isRecord(parsedValue) &&
    "version" in parsedValue &&
    parsedValue.version !==
      RECURRING_TRANSACTION_STORAGE_VERSION
  ) {
    return {
      value: fallbackValue(),
      status: "unsupported",
    };
  }

  const items =
    validatePersistedRecurringTransactionDataV1(
      parsedValue
    );

  if (!items) {
    return {
      value: fallbackValue(),
      status: "invalid",
    };
  }

  return {
    value: items,
    status: "valid",
  };
}

export function writeStoredRecurringTransactions(
  items: readonly RecurringTransaction[],
  storage: StorageLike | null =
    getBrowserStorage()
): StorageWriteResult {
  if (!storage) {
    return { status: "unavailable" };
  }

  let persistedData:
    PersistedRecurringTransactionDataV1;

  try {
    persistedData =
      createPersistedRecurringTransactionDataV1(
        items
      );
  } catch {
    return { status: "failed" };
  }

  try {
    storage.setItem(
      RECURRING_TRANSACTION_STORAGE_KEY,
      JSON.stringify(persistedData)
    );

    return { status: "written" };
  } catch {
    return { status: "failed" };
  }
}
