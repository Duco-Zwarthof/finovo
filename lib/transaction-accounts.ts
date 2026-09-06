import type {
  Account,
} from "./account-types";
import type {
  Transaction,
} from "./types";

export function getTransactionAccount(
  transaction: Transaction,
  accounts: readonly Account[]
) {
  if (!transaction.accountId) {
    return null;
  }

  return (
    accounts.find(
      (account) =>
        account.id ===
        transaction.accountId
    ) ?? null
  );
}

export function getTransactionAccountLabel(
  transaction: Transaction,
  accounts: readonly Account[]
) {
  if (!transaction.accountId) {
    return "Unassigned";
  }

  return (
    getTransactionAccount(
      transaction,
      accounts
    )?.name ??
    "Unknown account"
  );
}

export function assignTransactionAccount(
  transaction: Transaction,
  accountId:
    | string
    | null
    | undefined
): Transaction {
  const normalizedAccountId =
    accountId?.trim() ?? "";

  if (
    normalizedAccountId.length === 0
  ) {
    return {
      id: transaction.id,
      title: transaction.title,
      amountMinor:
        transaction.amountMinor,
      type: transaction.type,
      category:
        transaction.category,
      date: transaction.date,
    };
  }

  return {
    ...transaction,
    accountId:
      normalizedAccountId,
  };
}

export function assignAccountToTransactions(
  transactions: readonly Transaction[],
  accountId:
    | string
    | null
    | undefined
) {
  return transactions.map(
    (transaction) =>
      assignTransactionAccount(
        transaction,
        accountId
      )
  );
}

export function countTransactionsForAccount(
  transactions: readonly Transaction[],
  accountId: string
) {
  return transactions.filter(
    (transaction) =>
      transaction.accountId ===
      accountId
  ).length;
}
