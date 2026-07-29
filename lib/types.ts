export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "Salary"
  | "Housing"
  | "Groceries"
  | "Transport"
  | "Entertainment"
  | "Subscriptions"
  | "Investments"
  | "Other";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
};