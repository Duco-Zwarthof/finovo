import type { Account } from "./account-types";
import { isValidAccount } from "./accounts";
import type {
  StorageLike,
  StorageWriteResult,
} from "./storage";

export const ACCOUNT_STORAGE_KEY = "finovo-accounts";
export const ACCOUNT_STORAGE_VERSION = 1 as const;

export type PersistedAccountData = {
  version: typeof ACCOUNT_STORAGE_VERSION;
  accounts: Account[];
};

export type AccountStorageReadStatus =
  | "missing"
  | "valid"
  | "invalid"
  | "unsupported"
  | "unavailable";

export type AccountStorageReadResult = {
  value: Account[];
  status: AccountStorageReadStatus;
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

function cloneAccounts(
  accounts: readonly Account[]
): Account[] {
  return accounts.map((account) => ({ ...account }));
}

export function createPersistedAccountData(
  accounts: readonly Account[]
): PersistedAccountData {
  const accountIds = new Set<string>();

  for (const account of accounts) {
    if (
      !isValidAccount(account) ||
      accountIds.has(account.id)
    ) {
      throw new TypeError(
        "Cannot persist invalid or duplicate accounts"
      );
    }

    accountIds.add(account.id);
  }

  return {
    version: ACCOUNT_STORAGE_VERSION,
    accounts: cloneAccounts(accounts),
  };
}

export function validatePersistedAccountData(
  value: unknown
): Account[] | null {
  if (
    !isRecord(value) ||
    value.version !== ACCOUNT_STORAGE_VERSION ||
    !Array.isArray(value.accounts)
  ) {
    return null;
  }

  const accounts: Account[] = [];
  const accountIds = new Set<string>();

  for (const entry of value.accounts) {
    if (
      !isValidAccount(entry) ||
      accountIds.has(entry.id)
    ) {
      return null;
    }

    accountIds.add(entry.id);
    accounts.push({ ...entry });
  }

  return accounts;
}

export function readStoredAccounts(
  fallback: readonly Account[] = [],
  storage: StorageLike | null = getBrowserStorage()
): AccountStorageReadResult {
  const fallbackValue = () => cloneAccounts(fallback);

  if (!storage) {
    return {
      value: fallbackValue(),
      status: "unavailable",
    };
  }

  let storedValue: string | null;

  try {
    storedValue = storage.getItem(ACCOUNT_STORAGE_KEY);
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
    parsedValue.version !== ACCOUNT_STORAGE_VERSION
  ) {
    return {
      value: fallbackValue(),
      status: "unsupported",
    };
  }

  const accounts =
    validatePersistedAccountData(parsedValue);

  if (!accounts) {
    return {
      value: fallbackValue(),
      status: "invalid",
    };
  }

  return {
    value: accounts,
    status: "valid",
  };
}

export function writeStoredAccounts(
  accounts: readonly Account[],
  storage: StorageLike | null = getBrowserStorage()
): StorageWriteResult {
  if (!storage) {
    return { status: "unavailable" };
  }

  let persistedData: PersistedAccountData;

  try {
    persistedData =
      createPersistedAccountData(accounts);
  } catch {
    return { status: "failed" };
  }

  try {
    storage.setItem(
      ACCOUNT_STORAGE_KEY,
      JSON.stringify(persistedData)
    );

    return { status: "written" };
  } catch {
    return { status: "failed" };
  }
}
