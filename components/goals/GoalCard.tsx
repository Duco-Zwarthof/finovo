import {
  CalendarDays,
  CirclePause,
  CircleCheckBig,
  Target,
} from "lucide-react";

import type {
  Goal,
  GoalStatus,
} from "@/lib/goal-types";
import { calculateGoalProgress } from "@/lib/goals";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type GoalCardProps = {
  goal: Goal;
  onEdit?: (goalId: string) => void;
};

const statusLabels: Record<GoalStatus, string> = {
  active: "Active",
  completed: "Completed",
  paused: "Paused",
};

const statusStyles: Record<GoalStatus, string> = {
  active: "bg-blue-500/10 text-blue-300",
  completed: "bg-emerald-500/10 text-emerald-400",
  paused: "bg-amber-500/10 text-amber-300",
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

function formatGoalDate(value: string | null) {
  if (!value) {
    return "No target date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(`${value}T00:00:00Z`)
  );
}

export default function GoalCard({
  goal,
  onEdit,
}: GoalCardProps) {
  const progress = calculateGoalProgress(goal);

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            {goal.status === "completed" ? (
              <CircleCheckBig size={22} />
            ) : goal.status === "paused" ? (
              <CirclePause size={22} />
            ) : (
              <Target size={22} />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-white">
              {goal.name}
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              {formatMinorCurrency(goal.currentAmountMinor)}
              {" "}of{" "}
              {formatMinorCurrency(goal.targetAmountMinor)}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[goal.status]}`}
        >
          {statusLabels[goal.status]}
        </span>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-zinc-400">
            Progress
          </p>

          <p className="text-sm font-semibold text-white">
            {Math.round(progress.progressPercentage * 10) / 10}%
          </p>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
            style={{
              width: `${progress.progressPercentage}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">
            Remaining
          </p>

          <p className="mt-2 text-sm font-semibold text-white">
            {formatMinorCurrency(progress.remainingAmountMinor)}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">
            <CalendarDays size={14} />
            <span>Target</span>
          </div>

          <p className="mt-2 text-sm font-semibold text-white">
            {formatGoalDate(goal.targetDate)}
          </p>
        </div>
      </div>

      {progress.requiredMonthlyContributionMinor !== null && (
        <p className="mt-5 rounded-2xl bg-white/[0.03] px-4 py-3 text-sm leading-6 text-zinc-400">
          About{" "}
          <span className="font-semibold text-white">
            {formatMinorCurrency(
              progress.requiredMonthlyContributionMinor
            )}
          </span>{" "}
          per month is needed to reach this target on time.
        </p>
      )}
    </>
  );

  if (!onEdit) {
    return (
      <article className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
        {content}
      </article>
    );
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-zinc-900 p-6 transition hover:border-blue-500/25 hover:bg-zinc-900/90">
      <button
        type="button"
        onClick={() => onEdit(goal.id)}
        aria-label={`Edit ${goal.name}`}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-900"
      >
        {content}
      </button>
    </article>
  );
}
