"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from "@/lib/types";
import { formatLocalDate, parseLocalDate } from "@/lib/date";
import { CURRENCY_SYMBOL } from "@/lib/money";

type AddTransactionModalProps = {
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  transaction?: Transaction;
};

const incomeCategories: TransactionCategory[] = [
  "Salary",
  "Investments",
  "Other",
];

const expenseCategories: TransactionCategory[] = [
  "Housing",
  "Groceries",
  "Transport",
  "Entertainment",
  "Subscriptions",
  "Investments",
  "Other",
];

export default function AddTransactionModal({
  onClose,
  onSave,
  transaction,
}: AddTransactionModalProps) {
  const isEditing = Boolean(transaction);

  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "expense"
  );

  const [title, setTitle] = useState(
    transaction?.title ?? ""
  );

  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : ""
  );

  const [category, setCategory] =
    useState<TransactionCategory>(
      transaction?.category ?? "Groceries"
    );

  const [date, setDate] = useState(
    transaction?.date ??
      formatLocalDate(new Date())
  );

  const categories =
    type === "income"
      ? incomeCategories
      : expenseCategories;

  function selectType(newType: TransactionType) {
    setType(newType);

    const availableCategories =
      newType === "income"
        ? incomeCategories
        : expenseCategories;

    if (!availableCategories.includes(category)) {
      setCategory(
        newType === "income" ? "Salary" : "Groceries"
      );
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (
      !title.trim() ||
      numericAmount <= 0 ||
      !parseLocalDate(date)
    ) {
      return;
    }

    const savedTransaction: Transaction = {
      id: transaction?.id ?? crypto.randomUUID(),
      title: title.trim(),
      amount: numericAmount,
      type,
      category,
      date,
    };

    onSave(savedTransaction);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900 p-7 shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {isEditing
                ? "Edit transaction"
                : "Add transaction"}
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              {isEditing
                ? "Update the transaction details."
                : "Record new income or an expense."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          <div className="grid grid-cols-2 rounded-xl bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => selectType("income")}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                type === "income"
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Income
            </button>

            <button
              type="button"
              onClick={() => selectType("expense")}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                type === "expense"
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Expense
            </button>
          </div>

          <div>
            <label
              htmlFor="transaction-title"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Title
            </label>

            <input
              id="transaction-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder={
                type === "income"
                  ? "For example: Monthly salary"
                  : "For example: Groceries"
              }
              required
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="transaction-amount"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Amount
            </label>

            <div className="flex rounded-xl border border-white/10 bg-zinc-950 focus-within:border-blue-500">
              <span className="flex items-center border-r border-white/10 px-4 text-zinc-400">
                {CURRENCY_SYMBOL}
              </span>

              <input
                id="transaction-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="0.00"
                required
                className="w-full rounded-r-xl bg-transparent px-4 py-3 outline-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="transaction-category"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Category
            </label>

            <select
              id="transaction-category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target
                    .value as TransactionCategory
                )
              }
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              {categories.map((categoryOption) => (
                <option
                  key={categoryOption}
                  value={categoryOption}
                >
                  {categoryOption}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="transaction-date"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Date
            </label>

            <input
              id="transaction-date"
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              required
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              {isEditing
                ? "Save changes"
                : "Save transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
