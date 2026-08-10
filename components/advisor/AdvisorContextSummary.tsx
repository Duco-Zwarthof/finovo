import {
  CircleGauge,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import type { AdvisorContext } from "@/lib/advisor-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type AdvisorContextSummaryProps = {
  context: AdvisorContext;
};

function formatMinorCurrency(
  amountMinor: number
) {
  return formatCurrency(
    amountMinorToEuroAmount(
      amountMinor
    ) ?? 0
  );
}

export default function AdvisorContextSummary({
  context,
}: AdvisorContextSummaryProps) {
  return (
    <aside className="grid gap-4 lg:grid-cols-3">
      <article className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          <WalletCards size={15} />
          Liquid assets
        </div>

        <p className="mt-3 text-2xl font-bold text-white">
          {formatMinorCurrency(
            context.liquidAssetsMinor
          )}
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Monthly surplus{" "}
          {formatMinorCurrency(
            context.monthlySurplusMinor
          )}
        </p>
      </article>

      <article className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          <TrendingUp size={15} />
          Lowest forecast
        </div>

        <p className="mt-3 text-2xl font-bold text-white">
          {formatMinorCurrency(
            context.forecastLowestBalanceMinor
          )}
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          On{" "}
          {
            context.forecastLowestBalanceDate
          }
        </p>
      </article>

      <article className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          <CircleGauge size={15} />
          Financial health
        </div>

        <p className="mt-3 text-2xl font-bold text-white">
          {
            context.financialHealthScore
          }{" "}
          / 100
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Goal progress{" "}
          {context.goalProgressPercentage ===
          null
            ? "not available"
            : `${Math.round(
                context.goalProgressPercentage *
                  10
              ) / 10}%`}
        </p>
      </article>
    </aside>
  );
}
