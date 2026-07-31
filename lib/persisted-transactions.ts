import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from "./types";

export const TRANSACTION_STORAGE_VERSION = 1 as const;

export type PersistedTransactionV1 = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
};

export type PersistedTransactionDataV1 = {
  version: typeof TRANSACTION_STORAGE_VERSION;
  transactions: PersistedTransactionV1[];
};

export function createPersistedTransactionDataV1(
  transactions: readonly Transaction[]
): PersistedTransactionDataV1 {
  return {
    version: TRANSACTION_STORAGE_VERSION,
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    })),
  };
}
