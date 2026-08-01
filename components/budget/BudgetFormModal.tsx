"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import {
  Trash2,
  X,
} from "lucide-react";

import {
  hasDuplicateBudget,
  isValidBudgetLimitMinor,
} from "@/lib/budget";
import {
  isValidBudgetMonth,
} from "@/lib/budget-month";
import {
  BUDGET_CATEGORIES,
  type Budget,
  type BudgetCategory,
  type BudgetMonth,
} from "@/lib/budget-types";
import { CURRENCY_SYMBOL } from "@/lib/money";
import {
  amountMinorToEuroAmount,
  euroAmountToMinor,
} from "@/lib/transaction-amount";

type BudgetFormModalProps = {
  budgets: readonly Budget[];
  selectedMonth: BudgetMonth;
  budget?: Budget;
  onClose: () => void;
  onSave: (budget: Budget) => void;
  onDelete?: (budgetId: string) => void;
};

type ValidationErrors = {
  category?: string;
  limit?: string;
  month?: string;
  duplicate?: string;
};

function getInitialLimitValue(
  budget?: Budget
): string {
  if (!budget) {
    return "";
  }

  const euroAmount = amountMinorToEuroAmount(
    budget.limitMinor
  );

  return euroAmount === null
    ? ""
    : String(euroAmount);
}

export default function BudgetFormModal({
  budgets,
  selectedMonth,
  budget,
  onClose,
  onSave,
  onDelete,
}: BudgetFormModalProps) {
  const isEditing = Boolean(budget);

  const [category, setCategory] =
    useState<BudgetCategory>(
      budget?.category ?? BUDGET_CATEGORIES[0]
    );

  const [limit, setLimit] = useState(
    getInitialLimitValue(budget)
  );

  const [month, setMonth] =
    useState<BudgetMonth>(
      budget?.month ?? selectedMonth
    );

  const [errors, setErrors] =
    useState<ValidationErrors>({});

  const title = isEditing
    ? "Edit budget"
    : "Add budget";

  const description = isEditing
    ? "Update this category’s monthly spending limit."
    : "Create a monthly spending limit for one category.";

  const canDelete =
    isEditing &&
    budget &&
    Boolean(onDelete);

  const duplicateBudget = useMemo(() => {
    const candidate: Pick<
      Budget,
      "id" | "month" | "category"
    > = {
      id: budget?.id ?? "",
      month,
      category,
    };

    return hasDuplicateBudget(
      budgets,
      candidate
    );
  }, [
    budget?.id,
    budgets,
    category,
    month,
  ]);

  function validateForm() {
    const nextErrors: ValidationErrors = {};

    if (!BUDGET_CATEGORIES.includes(category)) {
      nextErrors.category =
        "Choose a valid budget category.";
    }

    if (!isValidBudgetMonth(month)) {
      nextErrors.month =
        "Choose a valid calendar month.";
    }

    const limitMinor = euroAmountToMinor(limit);

    if (
      limitMinor === null ||
      !isValidBudgetLimitMinor(limitMinor)
    ) {
      nextErrors.limit =
        "Enter an amount greater than €0.00 with no more than two decimal places.";
    }

    if (duplicateBudget) {
      nextErrors.duplicate =
        "A budget already exists for this category and month.";
    }

    setErrors(nextErrors);

    return {
      isValid:
        Object.keys(nextErrors).length === 0,
      limitMinor,
    };
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validation = validateForm();

    if (
      !validation.isValid ||
      validation.limitMinor === null
    ) {
      return;
    }

    const savedBudget: Budget = {
      id: budget?.id ?? crypto.randomUUID(),
      month,
      category,
      limitMinor: validation.limitMinor,
    };

    onSave(savedBudget);
  }

  function handleDelete() {
    if (
      !budget ||
      !onDelete
    ) {
      return;
    }

    onDelete(budget.id);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-form-title"
        aria-describedby="budget-form-description"
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900 p-7 shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="budget-form-title"
              className="text-2xl font-bold text-white"
            >
              {title}
            </h2>

            <p
              id="budget-form-description"
              className="mt-1 text-sm leading-6 text-zinc-400"
            >
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close budget form"
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
              htmlFor="budget-category"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Category
            </label>

            <select
              id="budget-category"
              value={category}
              onChange={(event) => {
                setCategory(
                  event.target
                    .value as BudgetCategory
                );

                setErrors((current) => ({
                  ...current,
                  category: undefined,
                  duplicate: undefined,
                }));
              }}
              aria-invalid={
                Boolean(errors.category)
              }
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            >
              {BUDGET_CATEGORIES.map(
                (categoryOption) => (
                  <option
                    key={categoryOption}
                    value={categoryOption}
                  >
                    {categoryOption}
                  </option>
                )
              )}
            </select>

            {errors.category && (
              <p className="mt-2 text-sm text-red-400">
                {errors.category}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="budget-limit"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Monthly limit
            </label>

            <div
              className={`flex rounded-xl border bg-zinc-950 transition focus-within:border-blue-500 ${
                errors.limit
                  ? "border-red-500/60"
                  : "border-white/10"
              }`}
            >
              <span className="flex items-center border-r border-white/10 px-4 text-zinc-400">
                {CURRENCY_SYMBOL}
              </span>

              <input
                id="budget-limit"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={limit}
                onChange={(event) => {
                  setLimit(event.target.value);

                  setErrors((current) => ({
                    ...current,
                    limit: undefined,
                  }));
                }}
                placeholder="0.00"
                required
                aria-invalid={Boolean(errors.limit)}
                className="w-full rounded-r-xl bg-transparent px-4 py-3 text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            {errors.limit && (
              <p className="mt-2 text-sm text-red-400">
                {errors.limit}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="budget-month"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Month
            </label>

            <input
              id="budget-month"
              type="month"
              value={month}
              onChange={(event) => {
                setMonth(event.target.value);

                setErrors((current) => ({
                  ...current,
                  month: undefined,
                  duplicate: undefined,
                }));
              }}
              required
              aria-invalid={Boolean(errors.month)}
              className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 ${
                errors.month
                  ? "border-red-500/60"
                  : "border-white/10"
              }`}
            />

            {errors.month && (
              <p className="mt-2 text-sm text-red-400">
                {errors.month}
              </p>
            )}
          </div>

          {errors.duplicate && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300"
            >
              {errors.duplicate}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            {canDelete && (
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
                  : "Add budget"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}