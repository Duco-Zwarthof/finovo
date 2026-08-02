"use client";

import { FormEvent, useState } from "react";
import { Trash2, X } from "lucide-react";

import {
  ACCOUNT_TYPES,
  type Account,
  type AccountType,
} from "@/lib/account-types";
import { isValidAccount } from "@/lib/accounts";
import { CURRENCY_SYMBOL } from "@/lib/money";
import {
  amountMinorToEuroAmount,
  euroAmountToMinor,
} from "@/lib/transaction-amount";

type AccountFormModalProps = {
  account?: Account;
  onClose: () => void;
  onSave: (account: Account) => void;
  onDelete?: (accountId: string) => void;
};

type ValidationErrors = {
  name?: string;
  type?: string;
  balance?: string;
};

const accountTypeLabels: Record<AccountType, string> = {
  checking: "Checking account",
  savings: "Savings account",
  investment: "Investment account",
  cash: "Cash",
};

function getInitialBalanceValue(account?: Account) {
  if (!account) {
    return "";
  }

  const euroAmount = amountMinorToEuroAmount(
    account.balanceMinor
  );

  return euroAmount === null ? "" : String(euroAmount);
}

export default function AccountFormModal({
  account,
  onClose,
  onSave,
  onDelete,
}: AccountFormModalProps) {
  const isEditing = Boolean(account);

  const [name, setName] = useState(
    account?.name ?? ""
  );

  const [type, setType] = useState<AccountType>(
    account?.type ?? "checking"
  );

  const [balance, setBalance] = useState(
    getInitialBalanceValue(account)
  );

  const [includedInNetWorth, setIncludedInNetWorth] =
    useState(
      account?.includedInNetWorth ?? true
    );

  const [errors, setErrors] =
    useState<ValidationErrors>({});

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const nextErrors: ValidationErrors = {};
    const balanceMinor =
      euroAmountToMinor(balance);

    if (!name.trim()) {
      nextErrors.name =
        "Enter an account name.";
    }

    if (!ACCOUNT_TYPES.includes(type)) {
      nextErrors.type =
        "Choose a valid account type.";
    }

    if (balanceMinor === null) {
      nextErrors.balance =
        "Enter a valid amount with no more than two decimal places.";
    }

    setErrors(nextErrors);

    if (
      Object.keys(nextErrors).length > 0 ||
      balanceMinor === null
    ) {
      return;
    }

    const savedAccount: Account = {
      id: account?.id ?? crypto.randomUUID(),
      name: name.trim(),
      type,
      balanceMinor,
      includedInNetWorth,
    };

    if (!isValidAccount(savedAccount)) {
      setErrors({
        balance:
          "The account could not be saved with these values.",
      });
      return;
    }

    onSave(savedAccount);
  }

  function handleDelete() {
    if (!account || !onDelete) {
      return;
    }

    onDelete(account.id);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-form-title"
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900 p-7 shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="account-form-title"
              className="text-2xl font-bold text-white"
            >
              {isEditing
                ? "Edit account"
                : "Add account"}
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-400">
              {isEditing
                ? "Update this account’s details and balance."
                : "Add an account to include it in your financial overview."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close account form"
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          <div>
            <label
              htmlFor="account-name"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Account name
            </label>

            <input
              id="account-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);

                setErrors((current) => ({
                  ...current,
                  name: undefined,
                }));
              }}
              placeholder="For example: Rabobank Savings"
              aria-invalid={Boolean(errors.name)}
              className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500 ${
                errors.name
                  ? "border-red-500/60"
                  : "border-white/10"
              }`}
            />

            {errors.name && (
              <p className="mt-2 text-sm text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="account-type"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Account type
            </label>

            <select
              id="account-type"
              value={type}
              onChange={(event) => {
                setType(
                  event.target.value as AccountType
                );

                setErrors((current) => ({
                  ...current,
                  type: undefined,
                }));
              }}
              aria-invalid={Boolean(errors.type)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            >
              {ACCOUNT_TYPES.map((accountType) => (
                <option
                  key={accountType}
                  value={accountType}
                >
                  {accountTypeLabels[accountType]}
                </option>
              ))}
            </select>

            {errors.type && (
              <p className="mt-2 text-sm text-red-400">
                {errors.type}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="account-balance"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Current balance
            </label>

            <div
              className={`flex rounded-xl border bg-zinc-950 transition focus-within:border-blue-500 ${
                errors.balance
                  ? "border-red-500/60"
                  : "border-white/10"
              }`}
            >
              <span className="flex items-center border-r border-white/10 px-4 text-zinc-400">
                {CURRENCY_SYMBOL}
              </span>

              <input
                id="account-balance"
                type="number"
                step="0.01"
                inputMode="decimal"
                value={balance}
                onChange={(event) => {
                  setBalance(event.target.value);

                  setErrors((current) => ({
                    ...current,
                    balance: undefined,
                  }));
                }}
                placeholder="0.00"
                required
                aria-invalid={Boolean(errors.balance)}
                className="w-full rounded-r-xl bg-transparent px-4 py-3 text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            {errors.balance && (
              <p className="mt-2 text-sm text-red-400">
                {errors.balance}
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <input
              type="checkbox"
              checked={includedInNetWorth}
              onChange={(event) =>
                setIncludedInNetWorth(
                  event.target.checked
                )
              }
              className="mt-1 h-4 w-4 rounded border-white/20 bg-zinc-950 text-blue-600"
            />

            <span>
              <span className="block text-sm font-semibold text-white">
                Include in net worth
              </span>

              <span className="mt-1 block text-sm leading-6 text-zinc-500">
                Turn this off for accounts you do not
                want included in your total financial position.
              </span>
            </span>
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            {isEditing && onDelete && account && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <Trash2 size={17} />
                Delete
              </button>
            )}

            <div className="flex flex-1 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                {isEditing
                  ? "Save changes"
                  : "Add account"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}