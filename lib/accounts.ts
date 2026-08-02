import type {
  Account,
  AccountType,
} from "./account-types";
import { isValidAmountMinor } from "./transaction-amount";

export function isAccountType(
  value: unknown
): value is AccountType {
  return (
    value === "checking" ||
    value === "savings" ||
    value === "investment" ||
    value === "cash"
  );
}

export function isValidAccount(
  value: unknown
): value is Account {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const account = value as Record<string, unknown>;

  return (
    typeof account.id === "string" &&
    account.id.trim().length > 0 &&
    typeof account.name === "string" &&
    account.name.trim().length > 0 &&
    isAccountType(account.type) &&
    isValidAmountMinor(account.balanceMinor) &&
    typeof account.includedInNetWorth ===
      "boolean"
  );
}

export function addAccount(
  accounts: readonly Account[],
  account: Account
): Account[] {
  if (!isValidAccount(account)) {
    throw new TypeError(
      "Cannot add an invalid account"
    );
  }

  if (
    accounts.some(
      (existing) => existing.id === account.id
    )
  ) {
    throw new Error(
      "Account already exists"
    );
  }

  return [...accounts, { ...account }];
}

export function updateAccount(
  accounts: readonly Account[],
  account: Account
): Account[] {
  if (!isValidAccount(account)) {
    throw new TypeError(
      "Cannot update an invalid account"
    );
  }

  return accounts.map((existing) =>
    existing.id === account.id
      ? { ...account }
      : { ...existing }
  );
}

export function deleteAccount(
  accounts: readonly Account[],
  accountId: string
): Account[] {
  return accounts.filter(
    (account) => account.id !== accountId
  );
}

export function calculateNetWorthMinor(
  accounts: readonly Account[]
): number {
  return accounts.reduce((total, account) => {
    if (!account.includedInNetWorth) {
      return total;
    }

    return total + account.balanceMinor;
  }, 0);
}