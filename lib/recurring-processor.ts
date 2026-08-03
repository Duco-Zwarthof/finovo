import type { RecurringTransaction } from "./recurring-transaction-types";
import {
  generateRecurringOccurrences,
  isValidRecurringDate,
} from "./recurring-transactions";
import type {
  RecurringProcessorResult,
  SkippedRecurringOccurrence,
} from "./recurring-processor-types";
import {
  TRANSACTION_CATEGORIES,
  type Transaction,
  type TransactionCategory,
} from "./types";

function isTransactionCategory(
  value: string
): value is TransactionCategory {
  return TRANSACTION_CATEGORIES.some(
    (category) => category === value
  );
}

export function createRecurringTransactionId(
  recurringTransactionId: string,
  date: string
): string {
  return `recurring:${recurringTransactionId}:${date}`;
}

export function createTransactionFromRecurringOccurrence(
  item: RecurringTransaction,
  date: string
): Transaction | null {
  if (
    !isValidRecurringDate(date) ||
    !isTransactionCategory(item.category)
  ) {
    return null;
  }

  return {
    id: createRecurringTransactionId(
      item.id,
      date
    ),
    title: item.title,
    category: item.category,
    amountMinor: item.amountMinor,
    type: item.type,
    date,
  };
}

export function processDueRecurringTransactions(
  items: readonly RecurringTransaction[],
  existingTransactions: readonly Transaction[],
  throughDate: string
): RecurringProcessorResult {
  if (!isValidRecurringDate(throughDate)) {
    throw new RangeError(
      "Cannot process recurring transactions through an invalid date"
    );
  }

  const transactions = existingTransactions.map(
    (transaction) => ({ ...transaction })
  );

  const existingIds = new Set(
    transactions.map(
      (transaction) => transaction.id
    )
  );

  const createdTransactions: Transaction[] =
    [];

  const skippedOccurrences:
    SkippedRecurringOccurrence[] = [];

  for (const item of items) {
    if (!item.isActive) {
      continue;
    }

    const occurrences =
      generateRecurringOccurrences(
        item,
        item.startDate,
        throughDate
      );

    for (const occurrence of occurrences) {
      const transactionId =
        createRecurringTransactionId(
          occurrence.recurringTransactionId,
          occurrence.date
        );

      if (existingIds.has(transactionId)) {
        continue;
      }

      const transaction =
        createTransactionFromRecurringOccurrence(
          item,
          occurrence.date
        );

      if (!transaction) {
        skippedOccurrences.push({
          recurringTransactionId:
            occurrence.recurringTransactionId,
          date: occurrence.date,
          reason: "invalid-category",
        });
        continue;
      }

      existingIds.add(transaction.id);
      transactions.push(transaction);
      createdTransactions.push(transaction);
    }
  }

  transactions.sort(
    (first, second) =>
      second.date.localeCompare(first.date) ||
      first.id.localeCompare(second.id)
  );

  return {
    transactions,
    createdTransactions,
    skippedOccurrences,
  };
}
