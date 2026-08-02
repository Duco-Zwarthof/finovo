import { Target } from "lucide-react";

import type { Goal } from "@/lib/goal-types";
import { calculateGoalProgress } from "@/lib/goals";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type GoalOverviewProps = {
  goal: Goal | null;
  size: {
    width: number;
    height: number;
  };
  onOpenGoals: () => void;
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function GoalOverview({
  goal,
  size,
  onOpenGoals,
}: GoalOverviewProps) {
  if (!goal) {
    return (
      <button
        type="button"
        onClick={onOpenGoals}
        className="flex h-full w-full flex-col items-center justify-center rounded-2xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
          <Target size={21} />
        </div>

        <p className="mt-4 font-semibold text-white">
          No savings goal yet
        </p>

        <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
          Add a goal to track progress directly from your dashboard.
        </p>

        <span className="mt-4 text-sm font-semibold text-blue-400">
          Open Goals
        </span>
      </button>
    );
  }

  const progress = calculateGoalProgress(goal);
  const roundedPercentage =
    Math.round(progress.progressPercentage * 10) / 10;

  return (
    <button
      type="button"
      onClick={onOpenGoals}
      aria-label={`Open ${goal.name} goal`}
      className="flex h-full w-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {goal.name}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {formatMinorCurrency(goal.currentAmountMinor)}
            {" "}of{" "}
            {formatMinorCurrency(goal.targetAmountMinor)}
          </p>
        </div>

        <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300">
          {roundedPercentage}%
        </span>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
          style={{
            width: `${progress.progressPercentage}%`,
          }}
        />
      </div>

      <div className="mt-auto pt-5">
        <p className="text-sm text-zinc-400">
          {formatMinorCurrency(
            progress.remainingAmountMinor
          )}{" "}
          remaining
        </p>

        {size.height >= 5 &&
          progress.requiredMonthlyContributionMinor !== null && (
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              About{" "}
              <span className="font-semibold text-zinc-300">
                {formatMinorCurrency(
                  progress.requiredMonthlyContributionMinor
                )}
              </span>{" "}
              per month is needed to reach the target on time.
            </p>
          )}
      </div>
    </button>
  );
}
