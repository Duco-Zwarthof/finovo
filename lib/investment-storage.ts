import type { InvestmentHolding } from "./investment-types";
import { isValidInvestmentHolding } from "./investments";
import type {
  StorageLike,
  StorageWriteResult,
} from "./storage";

export const INVESTMENT_STORAGE_KEY =
  "finovo-investments";
export const INVESTMENT_STORAGE_VERSION = 1 as const;

export type PersistedInvestmentDataV1 = {
  version: typeof INVESTMENT_STORAGE_VERSION;
  holdings: InvestmentHolding[];
};

export type InvestmentStorageReadStatus =
  | "missing"
  | "valid"
  | "invalid"
  | "unsupported"
  | "unavailable";

export type InvestmentStorageReadResult = {
  value: InvestmentHolding[];
  status: InvestmentStorageReadStatus;
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

function cloneHoldings(
  holdings: readonly InvestmentHolding[]
): InvestmentHolding[] {
  return holdings.map((holding) => ({
    ...holding,
  }));
}

export function createPersistedInvestmentDataV1(
  holdings: readonly InvestmentHolding[]
): PersistedInvestmentDataV1 {
  const holdingIds = new Set<string>();

  for (const holding of holdings) {
    if (
      !isValidInvestmentHolding(holding) ||
      holdingIds.has(holding.id)
    ) {
      throw new TypeError(
        "Cannot persist invalid or duplicate investment holdings"
      );
    }

    holdingIds.add(holding.id);
  }

  return {
    version: INVESTMENT_STORAGE_VERSION,
    holdings: cloneHoldings(holdings),
  };
}

export function validatePersistedInvestmentDataV1(
  value: unknown
): InvestmentHolding[] | null {
  if (
    !isRecord(value) ||
    value.version !== INVESTMENT_STORAGE_VERSION ||
    !Array.isArray(value.holdings)
  ) {
    return null;
  }

  const holdings: InvestmentHolding[] = [];
  const holdingIds = new Set<string>();

  for (const entry of value.holdings) {
    if (
      !isValidInvestmentHolding(entry) ||
      holdingIds.has(entry.id)
    ) {
      return null;
    }

    holdingIds.add(entry.id);
    holdings.push({ ...entry });
  }

  return holdings;
}

export function readStoredInvestments(
  fallback: readonly InvestmentHolding[] = [],
  storage: StorageLike | null = getBrowserStorage()
): InvestmentStorageReadResult {
  const fallbackValue = () =>
    cloneHoldings(fallback);

  if (!storage) {
    return {
      value: fallbackValue(),
      status: "unavailable",
    };
  }

  let storedValue: string | null;

  try {
    storedValue = storage.getItem(
      INVESTMENT_STORAGE_KEY
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
    parsedValue.version !== INVESTMENT_STORAGE_VERSION
  ) {
    return {
      value: fallbackValue(),
      status: "unsupported",
    };
  }

  const holdings =
    validatePersistedInvestmentDataV1(parsedValue);

  if (!holdings) {
    return {
      value: fallbackValue(),
      status: "invalid",
    };
  }

  return {
    value: holdings,
    status: "valid",
  };
}

export function writeStoredInvestments(
  holdings: readonly InvestmentHolding[],
  storage: StorageLike | null = getBrowserStorage()
): StorageWriteResult {
  if (!storage) {
    return { status: "unavailable" };
  }

  let persistedData: PersistedInvestmentDataV1;

  try {
    persistedData =
      createPersistedInvestmentDataV1(holdings);
  } catch {
    return { status: "failed" };
  }

  try {
    storage.setItem(
      INVESTMENT_STORAGE_KEY,
      JSON.stringify(persistedData)
    );

    return { status: "written" };
  } catch {
    return { status: "failed" };
  }
}
