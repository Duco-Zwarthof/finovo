import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";
import type {
  BudgetProgress,
  BudgetStatus,
} from "@/lib/budget-types";

import BudgetProgressBar from "./BudgetProgressBar";

type BudgetCategoryCardProps = {
  progress: BudgetProgress;
  onEdit?: (budgetId: string) => void;
};

const statusLabels: Record<BudgetStatus, string> = {
  unused: "Unused",
  "on-track": "On track",
  "near-limit": "Near limit",
  "over-budget": "Over budget",
};

const statusStyles: Record<BudgetStatus, string> = {
  unused: "bg-zinc-800 text-zinc-400",
  "on-track": "bg-emerald-500/10 text-emerald-400",
  "near-limit": "bg-amber-500/10 text-amber-300",
  "over-budget": "bg-red-500/10 text-red-400",
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function BudgetCategoryCard({
  progress,
  onEdit,
}: BudgetCategoryCardProps) {
  const content = (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">
              {progress.category}
            </h3>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[progress.status]}`}
            >
              {statusLabels[progress.status]}
            </span>
          </div>

          <p className="mt-1 text-sm text-zinc-500">
            {progress.transactionCount}{" "}
            {progress.transactionCount === 1
              ? "expense"
              : "expenses"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-left md:min-w-[26rem] md:text-right">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-600">
              Spent
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {formatMinorCurrency(progress.spentMinor)}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-600">
              Limit
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {formatMinorCurrency(progress.limitMinor)}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-600">
              Remaining
            </p>

            <p
              className={`mt-1 text-sm font-semibold ${
                progress.remainingMinor < 0
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
              {formatMinorCurrency(progress.remainingMinor)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <BudgetProgressBar
          percentage={progress.usagePercentage}
          status={progress.status}
        />
      </div>
    </>
  );

  if (!onEdit) {
    return (
      <article className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
        {content}
      </article>
    );
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-zinc-900 p-5 transition hover:border-blue-500/25 hover:bg-zinc-900/90">
      <button
        type="button"
        onClick={() => onEdit(progress.budgetId)}
        aria-label={`Edit ${progress.category} budget`}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-900"
      >
        {content}
      </button>
    </article>
  );
}