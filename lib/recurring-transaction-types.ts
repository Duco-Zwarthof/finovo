import type { TransactionType } from "./types";

export const RECURRING_FREQUENCIES = [
  "weekly",
  "monthly",
  "yearly",
] as const;

export type RecurringFrequency =
  (typeof RECURRING_FREQUENCIES)[number];

export type RecurringTransaction = {
  id: string;
  title: string;
  category: string;
  amountMinor: number;
  type: TransactionType;
  frequency: RecurringFrequency;
  startDate: string;
  endDate: string | null;
  dayOfMonth: number | null;
  isActive: boolean;
};

export type RecurringOccurrence = {
  recurringTransactionId: string;
  date: string;
};
