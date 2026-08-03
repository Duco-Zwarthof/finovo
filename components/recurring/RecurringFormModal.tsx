"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  Trash2,
  X,
} from "lucide-react";

import {
  RECURRING_FREQUENCIES,
  type RecurringFrequency,
  type RecurringTransaction,
} from "@/lib/recurring-transaction-types";
import { isValidRecurringTransaction } from "@/lib/recurring-transactions";
import { CURRENCY_SYMBOL } from "@/lib/money";
import {
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
} from "@/lib/types";
import {
  amountMinorToEuroAmount,
  euroAmountToMinor,
} from "@/lib/transaction-amount";

type RecurringFormModalProps = {
  item?: RecurringTransaction;
  onClose: () => void;
  onSave: (
    item: RecurringTransaction
  ) => void;
  onDelete?: (itemId: string) => void;
};

const frequencyLabels: Record<
  RecurringFrequency,
  string
> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

function initialMoneyValue(amountMinor?: number) {
  if (amountMinor === undefined) {
    return "";
  }

  return String(
    amountMinorToEuroAmount(amountMinor) ?? ""
  );
}

export default function RecurringFormModal({
  item,
  onClose,
  onSave,
  onDelete,
}: RecurringFormModalProps) {
  const isEditing = Boolean(item);

  const [title, setTitle] = useState(
    item?.title ?? ""
  );
  const [category, setCategory] =
    useState<TransactionCategory>(
      TRANSACTION_CATEGORIES.includes(
        item?.category as TransactionCategory
      )
        ? (item?.category as TransactionCategory)
        : TRANSACTION_CATEGORIES[0]
    );
  const [amount, setAmount] = useState(
    initialMoneyValue(item?.amountMinor)
  );
  const [type, setType] = useState<
    "income" | "expense"
  >(item?.type ?? "expense");
  const [frequency, setFrequency] =
    useState<RecurringFrequency>(
      item?.frequency ?? "monthly"
    );
  const [startDate, setStartDate] =
    useState(item?.startDate ?? "");
  const [endDate, setEndDate] = useState(
    item?.endDate ?? ""
  );
  const [dayOfMonth, setDayOfMonth] =
    useState(
      item?.dayOfMonth
        ? String(item.dayOfMonth)
        : ""
    );
  const [isActive, setIsActive] =
    useState(item?.isActive ?? true);
  const [error, setError] = useState<
    string | null
  >(null);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const amountMinor =
      euroAmountToMinor(amount);

    const normalizedDay =
      frequency === "monthly"
        ? Number(dayOfMonth)
        : null;

    const savedItem:
      | RecurringTransaction
      | null =
      amountMinor === null
        ? null
        : {
            id:
              item?.id ??
              crypto.randomUUID(),
            title: title.trim(),
            category: category.trim(),
            amountMinor,
            type,
            frequency,
            startDate,
            endDate:
              endDate.trim() === ""
                ? null
                : endDate,
            dayOfMonth: normalizedDay,
            isActive,
          };

    if (
      !savedItem ||
      !isValidRecurringTransaction(
        savedItem
      )
    ) {
      setError(
        "Check all fields. Monthly items also need a valid day between 1 and 31."
      );
      return;
    }

    setError(null);
    onSave(savedItem);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-900 p-7 shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isEditing
                ? "Edit recurring transaction"
                : "Add recurring transaction"}
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Define how often this income or expense repeats.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Title"
              className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target
                    .value as TransactionCategory
                )
              }
              className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              {TRANSACTION_CATEGORIES.map(
                (transactionCategory) => (
                  <option
                    key={transactionCategory}
                    value={transactionCategory}
                  >
                    {transactionCategory}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value as
                    | "income"
                    | "expense"
                )
              }
              className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="income">
                Income
              </option>
              <option value="expense">
                Expense
              </option>
            </select>

            <div className="flex rounded-xl border border-white/10 bg-zinc-950 focus-within:border-blue-500">
              <span className="flex items-center border-r border-white/10 px-4 text-zinc-400">
                {CURRENCY_SYMBOL}
              </span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                placeholder="0.00"
                className="w-full rounded-r-xl bg-transparent px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <select
              value={frequency}
              onChange={(event) => {
                const nextFrequency =
                  event.target
                    .value as RecurringFrequency;

                setFrequency(nextFrequency);

                if (
                  nextFrequency !==
                  "monthly"
                ) {
                  setDayOfMonth("");
                }
              }}
              className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              {RECURRING_FREQUENCIES.map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {
                      frequencyLabels[
                        value
                      ]
                    }
                  </option>
                )
              )}
            </select>

            {frequency === "monthly" && (
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(event) =>
                  setDayOfMonth(
                    event.target.value
                  )
                }
                placeholder="Day of month"
                className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Start date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                End date (optional)
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(
                  event.target.checked
                )
              }
            />

            <span className="text-sm font-medium text-white">
              Active recurring transaction
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            {isEditing &&
              item &&
              onDelete && (
                <button
                  type="button"
                  onClick={() =>
                    onDelete(item.id)
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 size={17} />
                  Delete
                </button>
              )}

            <div className="flex flex-1 gap-3">
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
                  : "Add recurring"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
