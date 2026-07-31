import type {
  Layout,
  LayoutItem,
  ResponsiveLayouts,
} from "react-grid-layout";

import { parseLocalDate } from "./date";
import {
  amountMinorToEuroAmount,
  euroAmountToMinor,
} from "./transaction-amount";
import {
  TRANSACTION_STORAGE_VERSION,
  TRANSACTION_STORAGE_VERSION_V1,
  createPersistedTransactionDataV2,
} from "./persisted-transactions";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
  type Transaction,
  type TransactionCategory,
  type TransactionType,
} from "./types";

export const STORAGE_KEYS = {
  transactions: "finovo-transactions",
  widgetSettings: "finovo-dashboard-widgets",
  layouts: "finovo-dashboard-layouts-v2",
} as const;

export const WIDGET_IDS = [
  "netWorth",
  "monthlyIncome",
  "monthlyExpenses",
  "monthlySavings",
  "cashflow",
  "savingsGoal",
  "recentTransactions",
] as const;

export type WidgetId = (typeof WIDGET_IDS)[number];

export type DashboardBreakpoint =
  | "lg"
  | "md"
  | "sm"
  | "xs";

export type DashboardLayouts =
  ResponsiveLayouts<DashboardBreakpoint>;

export type WidgetSettings = Record<WidgetId, boolean>;

export type StorageLike = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export type StorageReadStatus =
  | "missing"
  | "valid"
  | "recovered"
  | "invalid"
  | "unavailable";

export type StorageReadResult<T> = {
  value: T;
  status: StorageReadStatus;
};

export type StorageWriteStatus =
  | "written"
  | "removed"
  | "unavailable"
  | "failed";

export type StorageWriteResult = {
  status: StorageWriteStatus;
};

export type StorageValidationResult<T> = {
  value: T;
  recovered: boolean;
};

type StoredLayoutItem = Pick<
  LayoutItem,
  "i" | "x" | "y" | "w" | "h"
>;

type StorageKey =
  (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

const DASHBOARD_BREAKPOINTS: DashboardBreakpoint[] = [
  "lg",
  "md",
  "sm",
  "xs",
];

const DASHBOARD_COLUMNS: Record<
  DashboardBreakpoint,
  number
> = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
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

function isInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value)
  );
}

function isTransactionType(
  value: unknown
): value is TransactionType {
  return TRANSACTION_TYPES.some(
    (transactionType) => transactionType === value
  );
}

function isTransactionCategory(
  value: unknown
): value is TransactionCategory {
  return TRANSACTION_CATEGORIES.some(
    (category) => category === value
  );
}

function parsePersistedTransactionV1(
  value: unknown
): Transaction | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, title, amount, type, category, date } =
    value;
  const amountMinor =
    typeof amount === "number"
      ? euroAmountToMinor(amount)
      : null;

  if (
    typeof id !== "string" ||
    id.trim().length === 0 ||
    typeof title !== "string" ||
    title.trim().length === 0 ||
    typeof amount !== "number" ||
    amountMinor === null ||
    !isTransactionType(type) ||
    !isTransactionCategory(category) ||
    typeof date !== "string" ||
    !parseLocalDate(date)
  ) {
    return null;
  }

  return {
    id,
    title,
    amount,
    amountMinor,
    type,
    category,
    date,
  };
}

function parsePersistedTransactionV2(
  value: unknown
): Transaction | null {
  if (!isRecord(value)) {
    return null;
  }

  const {
    id,
    title,
    amountMinor,
    type,
    category,
    date,
  } = value;
  const amount =
    typeof amountMinor === "number"
      ? amountMinorToEuroAmount(amountMinor)
      : null;

  if (
    typeof id !== "string" ||
    id.trim().length === 0 ||
    typeof title !== "string" ||
    title.trim().length === 0 ||
    typeof amountMinor !== "number" ||
    amount === null ||
    !isTransactionType(type) ||
    !isTransactionCategory(category) ||
    typeof date !== "string" ||
    !parseLocalDate(date)
  ) {
    return null;
  }

  return {
    id,
    title,
    amount,
    amountMinor,
    type,
    category,
    date,
  };
}

function validateTransactionArray(
  value: unknown,
  parseEntry: (entry: unknown) => Transaction | null
): StorageValidationResult<Transaction[]> | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const transactions: Transaction[] = [];
  const transactionIds = new Set<string>();
  let recovered = false;

  value.forEach((entry) => {
    const transaction = parseEntry(entry);

    if (
      !transaction ||
      transactionIds.has(transaction.id)
    ) {
      recovered = true;
      return;
    }

    transactionIds.add(transaction.id);
    transactions.push(transaction);
  });

  return {
    value: transactions,
    recovered,
  };
}

export function validateStoredTransactions(
  value: unknown
): StorageValidationResult<Transaction[]> | null {
  return validateTransactionArray(
    value,
    parsePersistedTransactionV1
  );
}

export function validatePersistedTransactionDataV1(
  value: unknown
): StorageValidationResult<Transaction[]> | null {
  if (
    !isRecord(value) ||
    value.version !== TRANSACTION_STORAGE_VERSION_V1
  ) {
    return null;
  }

  return validateStoredTransactions(value.transactions);
}

export function validatePersistedTransactionDataV2(
  value: unknown
): StorageValidationResult<Transaction[]> | null {
  if (
    !isRecord(value) ||
    value.version !== TRANSACTION_STORAGE_VERSION
  ) {
    return null;
  }

  return validateTransactionArray(
    value.transactions,
    parsePersistedTransactionV2
  );
}

function validateReadableTransactionData(
  value: unknown
): StorageValidationResult<Transaction[]> | null {
  if (Array.isArray(value)) {
    return validateStoredTransactions(value);
  }

  if (
    isRecord(value) &&
    value.version === TRANSACTION_STORAGE_VERSION_V1
  ) {
    return validatePersistedTransactionDataV1(value);
  }

  return validatePersistedTransactionDataV2(value);
}

export function validateStoredWidgetSettings(
  value: unknown,
  defaults: WidgetSettings
): StorageValidationResult<WidgetSettings> | null {
  if (!isRecord(value)) {
    return null;
  }

  const settings = { ...defaults };
  let recovered = Object.keys(value).some(
    (key) => !WIDGET_IDS.includes(key as WidgetId)
  );

  WIDGET_IDS.forEach((widgetId) => {
    if (typeof value[widgetId] === "boolean") {
      settings[widgetId] = value[widgetId];
      return;
    }

    recovered = true;
  });

  return {
    value: settings,
    recovered,
  };
}

function cloneLayout(layout: Layout | undefined): Layout {
  return (layout ?? []).map((item) => ({ ...item }));
}

function cloneDashboardLayouts(
  layouts: DashboardLayouts
): DashboardLayouts {
  return {
    lg: cloneLayout(layouts.lg),
    md: cloneLayout(layouts.md),
    sm: cloneLayout(layouts.sm),
    xs: cloneLayout(layouts.xs),
  };
}

function isWidgetId(value: unknown): value is WidgetId {
  return (
    typeof value === "string" &&
    WIDGET_IDS.includes(value as WidgetId)
  );
}

function isValidLayoutItem(
  value: unknown,
  fallback: LayoutItem,
  columns: number
): value is StoredLayoutItem {
  if (!isRecord(value) || value.i !== fallback.i) {
    return false;
  }

  if (
    !isInteger(value.x) ||
    !isInteger(value.y) ||
    !isInteger(value.w) ||
    !isInteger(value.h) ||
    value.x < 0 ||
    value.y < 0 ||
    value.w <= 0 ||
    value.h <= 0 ||
    value.x + value.w > columns ||
    (fallback.minW !== undefined &&
      value.w < fallback.minW) ||
    (fallback.minH !== undefined &&
      value.h < fallback.minH) ||
    (fallback.maxW !== undefined &&
      value.w > fallback.maxW) ||
    (fallback.maxH !== undefined &&
      value.h > fallback.maxH)
  ) {
    return false;
  }

  return true;
}

function validateBreakpointLayout(
  value: unknown,
  defaults: Layout,
  columns: number
): StorageValidationResult<Layout> {
  if (!Array.isArray(value)) {
    return {
      value: cloneLayout(defaults),
      recovered: true,
    };
  }

  const defaultsById = new Map(
    defaults.map((item) => [item.i, item])
  );
  const layout: LayoutItem[] = [];
  const foundWidgetIds = new Set<WidgetId>();
  let recovered = false;

  value.forEach((entry) => {
    const widgetId =
      isRecord(entry) && isWidgetId(entry.i)
        ? entry.i
        : null;
    const fallback = widgetId
      ? defaultsById.get(widgetId)
      : undefined;

    if (
      !widgetId ||
      !fallback ||
      foundWidgetIds.has(widgetId) ||
      !isValidLayoutItem(entry, fallback, columns)
    ) {
      recovered = true;
      return;
    }

    foundWidgetIds.add(widgetId);
    layout.push({
      ...fallback,
      x: entry.x,
      y: entry.y,
      w: entry.w,
      h: entry.h,
    });
  });

  defaults.forEach((fallback) => {
    if (!isWidgetId(fallback.i)) {
      return;
    }

    if (!foundWidgetIds.has(fallback.i)) {
      layout.push({ ...fallback });
      recovered = true;
    }
  });

  return {
    value: layout,
    recovered,
  };
}

export function validateStoredDashboardLayouts(
  value: unknown,
  defaults: DashboardLayouts
): StorageValidationResult<DashboardLayouts> | null {
  if (!isRecord(value)) {
    return null;
  }

  const layouts: DashboardLayouts = {};
  let recovered = Object.keys(value).some(
    (key) =>
      !DASHBOARD_BREAKPOINTS.includes(
        key as DashboardBreakpoint
      )
  );

  DASHBOARD_BREAKPOINTS.forEach((breakpoint) => {
    const result = validateBreakpointLayout(
      value[breakpoint],
      defaults[breakpoint] ?? [],
      DASHBOARD_COLUMNS[breakpoint]
    );

    layouts[breakpoint] = result.value;
    recovered ||= result.recovered;
  });

  return {
    value: layouts,
    recovered,
  };
}

function readStoredJson<T>(
  key: StorageKey,
  createFallback: () => T,
  validate: (
    value: unknown
  ) => StorageValidationResult<T> | null,
  storage: StorageLike | null
): StorageReadResult<T> {
  if (!storage) {
    return {
      value: createFallback(),
      status: "unavailable",
    };
  }

  let storedValue: string | null;

  try {
    storedValue = storage.getItem(key);
  } catch {
    return {
      value: createFallback(),
      status: "unavailable",
    };
  }

  if (storedValue === null) {
    return {
      value: createFallback(),
      status: "missing",
    };
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(storedValue) as unknown;
  } catch {
    return {
      value: createFallback(),
      status: "invalid",
    };
  }

  const result = validate(parsedValue);

  if (!result) {
    return {
      value: createFallback(),
      status: "invalid",
    };
  }

  return {
    value: result.value,
    status: result.recovered ? "recovered" : "valid",
  };
}

function writeStoredJson(
  key: StorageKey,
  value: unknown,
  storage: StorageLike | null
): StorageWriteResult {
  if (!storage) {
    return { status: "unavailable" };
  }

  try {
    storage.setItem(key, JSON.stringify(value));
    return { status: "written" };
  } catch {
    return { status: "failed" };
  }
}

export function readStoredTransactions(
  fallback: readonly Transaction[],
  storage: StorageLike | null = getBrowserStorage()
): StorageReadResult<Transaction[]> {
  return readStoredJson(
    STORAGE_KEYS.transactions,
    () => fallback.map((transaction) => ({ ...transaction })),
    validateReadableTransactionData,
    storage
  );
}

export function writeStoredTransactions(
  transactions: readonly Transaction[],
  storage: StorageLike | null = getBrowserStorage()
): StorageWriteResult {
  return writeStoredJson(
    STORAGE_KEYS.transactions,
    createPersistedTransactionDataV2(transactions),
    storage
  );
}

export function readStoredWidgetSettings(
  defaults: WidgetSettings,
  storage: StorageLike | null = getBrowserStorage()
): StorageReadResult<WidgetSettings> {
  return readStoredJson(
    STORAGE_KEYS.widgetSettings,
    () => ({ ...defaults }),
    (value) =>
      validateStoredWidgetSettings(value, defaults),
    storage
  );
}

export function writeStoredWidgetSettings(
  settings: WidgetSettings,
  storage: StorageLike | null = getBrowserStorage()
): StorageWriteResult {
  return writeStoredJson(
    STORAGE_KEYS.widgetSettings,
    settings,
    storage
  );
}

export function readStoredDashboardLayouts(
  defaults: DashboardLayouts,
  storage: StorageLike | null = getBrowserStorage()
): StorageReadResult<DashboardLayouts> {
  return readStoredJson(
    STORAGE_KEYS.layouts,
    () => cloneDashboardLayouts(defaults),
    (value) =>
      validateStoredDashboardLayouts(value, defaults),
    storage
  );
}

export function writeStoredDashboardLayouts(
  layouts: DashboardLayouts,
  storage: StorageLike | null = getBrowserStorage()
): StorageWriteResult {
  return writeStoredJson(
    STORAGE_KEYS.layouts,
    layouts,
    storage
  );
}

export function removeStoredValue(
  key: StorageKey,
  storage: StorageLike | null = getBrowserStorage()
): StorageWriteResult {
  if (!storage) {
    return { status: "unavailable" };
  }

  try {
    storage.removeItem(key);
    return { status: "removed" };
  } catch {
    return { status: "failed" };
  }
}

function mergeLayoutPreservingMissingItems(
  current: Layout | undefined,
  next: Layout | undefined
): Layout {
  if (!next) {
    return current ?? [];
  }

  if (!current) {
    return next;
  }

  const nextById = new Map(
    next.map((item) => [item.i, item])
  );
  const currentIds = new Set(
    current.map((item) => item.i)
  );

  return [
    ...current.map(
      (item) => nextById.get(item.i) ?? item
    ),
    ...next.filter((item) => !currentIds.has(item.i)),
  ];
}

export function mergeDashboardLayoutsPreservingHidden(
  current: DashboardLayouts,
  next: DashboardLayouts
): DashboardLayouts {
  return {
    lg: mergeLayoutPreservingMissingItems(
      current.lg,
      next.lg
    ),
    md: mergeLayoutPreservingMissingItems(
      current.md,
      next.md
    ),
    sm: mergeLayoutPreservingMissingItems(
      current.sm,
      next.sm
    ),
    xs: mergeLayoutPreservingMissingItems(
      current.xs,
      next.xs
    ),
  };
}
