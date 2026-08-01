export const TRANSACTION_TYPES = [
  "income",
  "expense",
] as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_CATEGORIES = [
  "Salary",
  "Housing",
  "Groceries",
  "Transport",
  "Entertainment",
  "Subscriptions",
  "Investments",
  "Other",
] as const;

export type TransactionCategory =
  (typeof TRANSACTION_CATEGORIES)[number];

export type Transaction = {
  id: string;
  title: string;
  amountMinor: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
};