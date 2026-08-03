import {
  ArrowDownRight,
  ArrowUpRight,
  Target,
} from "lucide-react";

import type { FinancialOverview } from "@/lib/net-worth-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type FinancialSignalsProps = {
  overview: FinancialOverview;
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function FinancialSignals({
  overview,
}: FinancialSignalsProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          Financial signals
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Current-month cash flow and progress toward your goals.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <ArrowUpRight size={18} />
          </div>

          <p className="mt-5 text-sm text-zinc-400">
            Monthly income
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {formatMinorCurrency(
              overview.monthlyIncomeMinor
            )}
          </p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <ArrowDownRight size={18} />
          </div>

          <p className="mt-5 text-sm text-zinc-400">
            Monthly expenses
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {formatMinorCurrency(
              overview.monthlyExpensesMinor
            )}
          </p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Target size={18} />
          </div>

          <p className="mt-5 text-sm text-zinc-400">
            Goal progress
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {overview.goalProgressPercentage === null
              ? "Not available"
              : `${Math.round(
                  overview.goalProgressPercentage * 10
                ) / 10}%`}
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            {formatMinorCurrency(
              overview.totalGoalProgressMinor
            )}{" "}
            of{" "}
            {formatMinorCurrency(
              overview.totalGoalTargetMinor
            )}
          </p>
        </article>
      </div>
    </section>
  );
}
