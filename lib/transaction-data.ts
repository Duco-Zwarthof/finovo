import { sampleTransactions } from "./sample-transactions";
import type {
  StorageReadResult,
  WidgetId,
} from "./storage";
import type { Transaction } from "./types";

type DemoTransactionDataState = {
  source: "demo";
};

type UserTransactionDataState = {
  source: "user";
  transactions: Transaction[];
};

export type TransactionDataState =
  | DemoTransactionDataState
  | UserTransactionDataState;

export type DashboardWidgetDataSource =
  | "demo"
  | "user"
  | "sample";

const staticSampleWidgetIds: readonly WidgetId[] = [
  "netWorth",
  "savingsGoal",
];

function isExactSampleTransaction(
  transaction: Transaction
) {
  return sampleTransactions.some(
    (sampleTransaction) =>
      sampleTransaction.id === transaction.id &&
      sampleTransaction.title === transaction.title &&
      sampleTransaction.amount === transaction.amount &&
      sampleTransaction.type === transaction.type &&
      sampleTransaction.category === transaction.category &&
      sampleTransaction.date === transaction.date
  );
}

function createUserState(
  transactions: readonly Transaction[]
): UserTransactionDataState {
  return {
    source: "user",
    transactions: transactions.map((transaction) => ({
      ...transaction,
    })),
  };
}

export function createTransactionDataState(
  storedTransactions: StorageReadResult<Transaction[]>
): TransactionDataState {
  if (storedTransactions.status === "missing") {
    return { source: "demo" };
  }

  if (
    storedTransactions.status === "invalid" ||
    storedTransactions.status === "unavailable"
  ) {
    return createUserState([]);
  }

  const userTransactions =
    storedTransactions.value.filter(
      (transaction) =>
        !isExactSampleTransaction(transaction)
    );

  if (
    storedTransactions.value.length > 0 &&
    userTransactions.length === 0
  ) {
    return { source: "demo" };
  }

  return createUserState(userTransactions);
}

export function getDisplayedTransactions(
  state: TransactionDataState
): Transaction[] {
  return state.source === "demo"
    ? sampleTransactions
    : state.transactions;
}

export function addTransactionToData(
  state: TransactionDataState,
  transaction: Transaction
): UserTransactionDataState {
  const existingTransactions =
    state.source === "user" ? state.transactions : [];

  return createUserState([
    transaction,
    ...existingTransactions,
  ]);
}

export function updateTransactionInData(
  state: TransactionDataState,
  updatedTransaction: Transaction
): UserTransactionDataState {
  if (state.source === "demo") {
    return createUserState([updatedTransaction]);
  }

  return createUserState(
    state.transactions.map((transaction) =>
      transaction.id === updatedTransaction.id
        ? updatedTransaction
        : transaction
    )
  );
}

export function deleteTransactionFromData(
  state: TransactionDataState,
  id: string
): UserTransactionDataState {
  if (state.source === "demo") {
    return createUserState([]);
  }

  return createUserState(
    state.transactions.filter(
      (transaction) => transaction.id !== id
    )
  );
}

export function getDashboardWidgetDataSource(
  widgetId: WidgetId,
  state: TransactionDataState
): DashboardWidgetDataSource {
  if (staticSampleWidgetIds.includes(widgetId)) {
    return "sample";
  }

  return state.source;
}
