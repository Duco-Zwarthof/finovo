import type { Transaction } from "./types";

export type RecurringProcessorSkipReason =
  | "invalid-category";

export type SkippedRecurringOccurrence = {
  recurringTransactionId: string;
  date: string;
  reason: RecurringProcessorSkipReason;
};

export type RecurringProcessorResult = {
  transactions: Transaction[];
  createdTransactions: Transaction[];
  skippedOccurrences: SkippedRecurringOccurrence[];
};
