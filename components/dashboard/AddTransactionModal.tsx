"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

import { formatLocalDate, parseLocalDate } from "@/lib/date";
import { CURRENCY_SYMBOL } from "@/lib/money";
import {
  amountMinorToEuroAmount,
  euroAmountToMinor,
} from "@/lib/transaction-amount";
import type {
  Account,
} from "@/lib/account-types";
import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from "@/lib/types";

export type TransactionSaveFeedback =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

type AddTransactionModalProps = {
  onClose: () => void;
  onSave: (
    transaction: Transaction
  ) =>
    | void
    | TransactionSaveFeedback;
  transaction?: Transaction;
  isDemoTransaction?: boolean;
  accounts?: readonly Account[];
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

function getInitialAmountValue(
  transaction?: Transaction
): string {
  if (!transaction) {
    return "";
  }

  const euroAmount = amountMinorToEuroAmount(
    transaction.amountMinor
  );

  return euroAmount === null ? "" : String(euroAmount);
}

export default function AddTransactionModal({
  onClose,
  onSave,
  transaction,
  isDemoTransaction = false,
  accounts,
}: AddTransactionModalProps) {
  const isEditing = Boolean(transaction);

  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "expense"
  );

  const [title, setTitle] = useState(
    transaction?.title ?? ""
  );

  const [amount, setAmount] = useState(
    getInitialAmountValue(transaction)
  );

  const [category, setCategory] =
    useState<TransactionCategory>(
      transaction?.category ?? "Groceries"
    );

  const [date, setDate] = useState(
    transaction?.date ?? formatLocalDate(new Date())
  );

  const [
    accountId,
    setAccountId,
  ] = useState(
    transaction?.accountId ?? ""
  );

  const [
    affectsAccountBalance,
    setAffectsAccountBalance,
  ] = useState(
    transaction?.affectsAccountBalance ??
      false
  );

  const [
    saveError,
    setSaveError,
  ] = useState<string | null>(
    null
  );

  const accountOptions =
    accounts ?? [];

  const hasUnknownAccount =
    accountId.length > 0 &&
    !accountOptions.some(
      (account) =>
        account.id === accountId
    );

  const isBalanceSyncedEditLocked =
    Boolean(
      transaction?.affectsAccountBalance &&
        accounts === undefined
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
    setSaveError(null);

    if (
      isBalanceSyncedEditLocked
    ) {
      setSaveError(
        "Open this transaction from the Transactions page to edit it safely, because it is synced to an account balance."
      );
      return;
    }

    const amountMinor = euroAmountToMinor(amount);

    if (
      !title.trim() ||
      amountMinor === null ||
      !parseLocalDate(date)
    ) {
      return;
    }

    const savedTransaction: Transaction = {
      id: transaction?.id ?? crypto.randomUUID(),
      title: title.trim(),
      amountMinor,
      type,
      category,
      date,
      ...(accountId
        ? {
            accountId,
          }
        : {}),
      ...(accountId &&
      affectsAccountBalance
        ? {
            affectsAccountBalance:
              true,
          }
        : {}),
    };

    const result =
      onSave(savedTransaction);

    if (
      result &&
      result.ok === false
    ) {
      setSaveError(
        result.error
      );
    }
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
              {isDemoTransaction
                ? "Use sample transaction"
                : isEditing
                  ? "Edit transaction"
                  : "Add transaction"}
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              {isDemoTransaction
                ? "Saving this example creates one real transaction and removes the demo data."
                : isEditing
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

          {accounts !== undefined && (
          <div>
            <label
              htmlFor="transaction-account"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Account
            </label>

            <select
              id="transaction-account"
              value={accountId}
              onChange={(event) => {
                const nextAccountId =
                  event.target.value;

                setAccountId(
                  nextAccountId
                );

                if (
                  !nextAccountId
                ) {
                  setAffectsAccountBalance(
                    false
                  );
                } else if (
                  !isEditing
                ) {
                  setAffectsAccountBalance(
                    true
                  );
                }

                setSaveError(
                  null
                );
              }}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="">
                Unassigned
              </option>

              {hasUnknownAccount && (
                <option
                  value={accountId}
                >
                  Unknown account
                </option>
              )}

              {accountOptions.map(
                (account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.name}
                  </option>
                )
              )}
            </select>

            <p className="mt-2 text-xs leading-5 text-zinc-600">
              {accountOptions.length > 0
                ? "Link this transaction to one of your Finovo accounts."
                : "Create an account on the Accounts page to link transactions."}
            </p>

            {accountId && (
              <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <input
                  type="checkbox"
                  checked={
                    affectsAccountBalance
                  }
                  onChange={(event) => {
                    setAffectsAccountBalance(
                      event.target.checked
                    );
                    setSaveError(
                      null
                    );
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-zinc-950 text-blue-600"
                />

                <span>
                  <span className="block text-xs font-semibold text-zinc-300">
                    Update current account balance
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-zinc-600">
                    When enabled, this income or expense is applied to the selected account balance. Existing and imported history stays unchanged unless explicitly enabled.
                  </span>
                </span>
              </label>
            )}
          </div>
          )}

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

          {isBalanceSyncedEditLocked && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-3 py-2.5 text-xs leading-5 text-amber-300">
              This transaction is synced to an account balance. Edit it from the Transactions page so Finovo can safely reverse and reapply the balance effect.
            </div>
          )}

          {saveError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2.5 text-xs leading-5 text-red-300">
              {saveError}
            </div>
          )}

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
              disabled={
                isBalanceSyncedEditLocked
              }
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isEditing
                ? isDemoTransaction
                  ? "Save as my transaction"
                  : "Save changes"
                : "Save transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}