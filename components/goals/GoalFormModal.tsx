"use client";

import { FormEvent, useState } from "react";
import { Trash2, X } from "lucide-react";

import {
  GOAL_STATUSES,
  type Goal,
  type GoalStatus,
} from "@/lib/goal-types";
import { isValidGoal } from "@/lib/goals";
import { CURRENCY_SYMBOL } from "@/lib/money";
import {
  amountMinorToEuroAmount,
  euroAmountToMinor,
} from "@/lib/transaction-amount";

type GoalFormModalProps = {
  goal?: Goal;
  onClose: () => void;
  onSave: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
};

type ValidationErrors = {
  name?: string;
  targetAmount?: string;
  currentAmount?: string;
  targetDate?: string;
};

const statusLabels: Record<GoalStatus, string> = {
  active: "Active",
  completed: "Completed",
  paused: "Paused",
};

function initialMoneyValue(amountMinor?: number) {
  if (amountMinor === undefined) {
    return "";
  }

  const euroAmount =
    amountMinorToEuroAmount(amountMinor);

  return euroAmount === null
    ? ""
    : String(euroAmount);
}

export default function GoalFormModal({
  goal,
  onClose,
  onSave,
  onDelete,
}: GoalFormModalProps) {
  const isEditing = Boolean(goal);

  const [name, setName] = useState(
    goal?.name ?? ""
  );

  const [targetAmount, setTargetAmount] =
    useState(
      initialMoneyValue(goal?.targetAmountMinor)
    );

  const [currentAmount, setCurrentAmount] =
    useState(
      initialMoneyValue(goal?.currentAmountMinor)
    );

  const [targetDate, setTargetDate] = useState(
    goal?.targetDate ?? ""
  );

  const [status, setStatus] = useState<GoalStatus>(
    goal?.status ?? "active"
  );

  const [errors, setErrors] =
    useState<ValidationErrors>({});

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const nextErrors: ValidationErrors = {};
    const targetAmountMinor =
      euroAmountToMinor(targetAmount);
    const currentAmountMinor =
      euroAmountToMinor(
        currentAmount.trim() === ""
          ? "0"
          : currentAmount
      );

    if (!name.trim()) {
      nextErrors.name = "Enter a goal name.";
    }

    if (
      targetAmountMinor === null ||
      targetAmountMinor <= 0
    ) {
      nextErrors.targetAmount =
        "Enter a target amount greater than zero.";
    }

    if (
      currentAmountMinor === null ||
      currentAmountMinor < 0
    ) {
      nextErrors.currentAmount =
        "Enter a valid current amount.";
    }

    const normalizedTargetDate =
      targetDate.trim() === ""
        ? null
        : targetDate;

    const savedGoal: Goal | null =
      targetAmountMinor !== null &&
      currentAmountMinor !== null
        ? {
            id: goal?.id ?? crypto.randomUUID(),
            name: name.trim(),
            targetAmountMinor,
            currentAmountMinor,
            targetDate: normalizedTargetDate,
            status,
          }
        : null;

    if (
      savedGoal &&
      !isValidGoal(savedGoal)
    ) {
      if (normalizedTargetDate !== null) {
        nextErrors.targetDate =
          "Choose a valid target date.";
      }
    }

    setErrors(nextErrors);

    if (
      Object.keys(nextErrors).length > 0 ||
      !savedGoal ||
      !isValidGoal(savedGoal)
    ) {
      return;
    }

    onSave(savedGoal);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-form-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-900 p-7 shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="goal-form-title"
              className="text-2xl font-bold text-white"
            >
              {isEditing
                ? "Edit goal"
                : "Add goal"}
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-400">
              Define a target and track the progress you have already made.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close goal form"
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
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
              htmlFor="goal-name"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Goal name
            </label>

            <input
              id="goal-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="House deposit"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
            />

            {errors.name && (
              <p className="mt-2 text-sm text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="goal-target-amount"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Target amount
              </label>

              <div className="flex rounded-xl border border-white/10 bg-zinc-950 focus-within:border-blue-500">
                <span className="flex items-center border-r border-white/10 px-4 text-zinc-400">
                  {CURRENCY_SYMBOL}
                </span>

                <input
                  id="goal-target-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={targetAmount}
                  onChange={(event) =>
                    setTargetAmount(
                      event.target.value
                    )
                  }
                  placeholder="30000.00"
                  className="w-full rounded-r-xl bg-transparent px-4 py-3 text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              {errors.targetAmount && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.targetAmount}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="goal-current-amount"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Current amount
              </label>

              <div className="flex rounded-xl border border-white/10 bg-zinc-950 focus-within:border-blue-500">
                <span className="flex items-center border-r border-white/10 px-4 text-zinc-400">
                  {CURRENCY_SYMBOL}
                </span>

                <input
                  id="goal-current-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentAmount}
                  onChange={(event) =>
                    setCurrentAmount(
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                  className="w-full rounded-r-xl bg-transparent px-4 py-3 text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              {errors.currentAmount && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.currentAmount}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="goal-target-date"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Target date
              </label>

              <input
                id="goal-target-date"
                type="date"
                value={targetDate}
                onChange={(event) =>
                  setTargetDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              {errors.targetDate && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.targetDate}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="goal-status"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Status
              </label>

              <select
                id="goal-status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as GoalStatus
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                {GOAL_STATUSES.map((goalStatus) => (
                  <option
                    key={goalStatus}
                    value={goalStatus}
                  >
                    {statusLabels[goalStatus]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            {isEditing && goal && onDelete && (
              <button
                type="button"
                onClick={() =>
                  onDelete(goal.id)
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
                  : "Add goal"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
