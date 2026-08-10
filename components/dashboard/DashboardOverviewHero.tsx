import {
  ArrowDownRight,
  ArrowUpRight,
  CircleGauge,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type DashboardOverviewHeroProps = {
  netWorthMinor: number;
  monthlySurplusMinor: number;
  financialHealthScore: number | null;
  forecastEndingBalanceMinor: number | null;
  forecastDays?: number;
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function DashboardOverviewHero({
  netWorthMinor,
  monthlySurplusMinor,
  financialHealthScore,
  forecastEndingBalanceMinor,
  forecastDays = 30,
}: DashboardOverviewHeroProps) {
  const surplusIsNegative =
    monthlySurplusMinor < 0;

  const SurplusIcon = surplusIsNegative
    ? ArrowDownRight
    : ArrowUpRight;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 px-6 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative grid gap-8 xl:grid-cols-[1.2fr_1fr] xl:items-end">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <Sparkles size={17} />
            <span>Financial overview</span>
          </div>

          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Your financial picture, at a glance.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Track your current position, monthly momentum and near-term outlook
            without leaving the dashboard.
          </p>

          <div className="mt-8">
            <p className="text-sm font-medium text-zinc-500">
              Net worth
            </p>

            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {formatMinorCurrency(netWorthMinor)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              <WalletCards size={14} />
              <span>Monthly surplus</span>
            </div>

            <div
              className={`mt-3 flex items-center gap-2 text-2xl font-bold tracking-tight ${
                surplusIsNegative
                  ? "text-red-400"
                  : "text-emerald-400"
              }`}
            >
              <SurplusIcon size={19} />

              <span>
                {formatMinorCurrency(
                  monthlySurplusMinor
                )}
              </span>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              <CircleGauge size={14} />
              <span>Health score</span>
            </div>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {financialHealthScore === null
                ? "—"
                : `${financialHealthScore} / 100`}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              <TrendingUp size={14} />
              <span>{forecastDays}d forecast</span>
            </div>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {forecastEndingBalanceMinor === null
                ? "—"
                : formatMinorCurrency(
                    forecastEndingBalanceMinor
                  )}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
