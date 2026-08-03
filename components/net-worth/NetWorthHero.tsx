import {
  Landmark,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import type { FinancialOverview } from "@/lib/net-worth-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type NetWorthHeroProps = {
  overview: FinancialOverview;
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function NetWorthHero({
  overview,
}: NetWorthHeroProps) {
  const surplusIsNegative =
    overview.monthlySurplusMinor < 0;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 px-6 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.2),transparent_68%)]" />

      <div className="relative grid gap-8 xl:grid-cols-[1.25fr_1fr] xl:items-end">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <Landmark size={17} />
            <span>Financial position</span>
          </div>

          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            See your complete financial position in one place.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Net worth combines the accounts you explicitly include,
            while portfolio, goal and cash-flow data provide additional context.
          </p>

          <div className="mt-8">
            <p className="text-sm font-medium text-zinc-500">
              Total net worth
            </p>

            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {formatMinorCurrency(overview.netWorthMinor)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              <WalletCards size={14} />
              <span>Liquid assets</span>
            </div>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {formatMinorCurrency(
                overview.liquidAssetsMinor
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              <TrendingUp size={14} />
              <span>Investments</span>
            </div>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {formatMinorCurrency(
                overview.investmentAssetsMinor
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Monthly surplus
            </p>

            <p
              className={`mt-3 text-2xl font-bold tracking-tight ${
                surplusIsNegative
                  ? "text-red-400"
                  : "text-emerald-400"
              }`}
            >
              {formatMinorCurrency(
                overview.monthlySurplusMinor
              )}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
