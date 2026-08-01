import { amountMinorToEuroAmount } from "./transaction-amount";
import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from "./types";

export const TRANSACTION_STORAGE_VERSION_V1 = 1 as const;
export const TRANSACTION_STORAGE_VERSION = 2 as const;

export type PersistedTransactionV1 = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
};

export type PersistedTransactionDataV1 = {
  version: typeof TRANSACTION_STORAGE_VERSION_V1;
  transactions: PersistedTransactionV1[];
};

export type PersistedTransactionV2 = {
  id: string;
  title: string;
  amountMinor: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
};

export type PersistedTransactionDataV2 = {
  version: typeof TRANSACTION_STORAGE_VERSION;
  transactions: PersistedTransactionV2[];
};

/**
 * Creates the legacy V1 persisted format.
 *
 * This helper exists only for backwards-compatibility tests and legacy
 * storage behavior. Decimal euro values must not re-enter the domain model.
 */
export function createPersistedTransactionDataV1(
  transactions: readonly Transaction[]
): PersistedTransactionDataV1 {
  return {
    version: TRANSACTION_STORAGE_VERSION_V1,
    transactions: transactions.map((transaction) => {
      const amount = amountMinorToEuroAmount(
        transaction.amountMinor
      );

      if (amount === null) {
        throw new RangeError(
          `Transaction "${transaction.id}" has an invalid amountMinor value.`
        );
      }

      return {
        id: transaction.id,
        title: transaction.title,
        amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
      };
    }),
  };
}

export function createPersistedTransactionDataV2(
  transactions: readonly Transaction[]
): PersistedTransactionDataV2 {
  return {
    version: TRANSACTION_STORAGE_VERSION,
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      title: transaction.title,
      amountMinor: transaction.amountMinor,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    })),
  };
}