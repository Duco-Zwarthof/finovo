import type { Transaction } from "./types";

export const TRANSACTION_STORAGE_VERSION = 1 as const;

export type PersistedTransactionDataV1 = {
  version: typeof TRANSACTION_STORAGE_VERSION;
  transactions: Transaction[];
};

export function createPersistedTransactionDataV1(
  transactions: readonly Transaction[]
): PersistedTransactionDataV1 {
  return {
    version: TRANSACTION_STORAGE_VERSION,
    transactions: transactions.map((transaction) => ({
      ...transaction,
    })),
  };
}
