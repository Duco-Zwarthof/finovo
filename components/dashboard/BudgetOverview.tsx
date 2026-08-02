import DashboardPanel from "./DashboardPanel";

import { formatCurrency } from "@/lib/money";
import type { MonthlyBudgetSummary } from "@/lib/budget-types";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type BudgetOverviewProps = {
  summary: MonthlyBudgetSummary;
  activeBudgets: number;
  onOpenBudget?: () => void;
};

function formatMinorCurrency(
  amountMinor: number
) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function BudgetOverview({
  summary,
  activeBudgets,
  onOpenBudget,
}: BudgetOverviewProps) {
  const percentage =
    summary.usagePercentage ?? 0;

  return (
    <DashboardPanel
      title="Monthly Budget"
      description="Current month's spending"
    >
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            Remaining
          </p>

          <h2 className="mt-1 text-3xl font-bold text-white">
            {formatMinorCurrency(
              summary.totalRemainingMinor
            )}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            {activeBudgets} active budget
            {activeBudgets === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-zinc-400">
              Used
            </span>

            <span className="font-medium text-white">
              {percentage.toFixed(0)}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{
                width: `${Math.min(
                  percentage,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {onOpenBudget && (
          <button
            type="button"
            onClick={onOpenBudget}
            className="mt-8 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-blue-500 hover:bg-blue-500/10"
          >
            View Budget →
          </button>
        )}
      </div>
    </DashboardPanel>
  );
}