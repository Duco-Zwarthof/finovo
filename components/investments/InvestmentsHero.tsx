import { Plus, TrendingUp } from "lucide-react";

import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type InvestmentsHeroProps = {
  portfolioValueMinor: number;
  investedMinor: number;
  gainMinor: number;
  gainPercentage: number | null;
  onAddHolding: () => void;
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

function formatPercentage(value: number | null) {
  if (value === null) {
    return "Not available";
  }

  const rounded = Math.round(value * 10) / 10;
  const prefix = rounded > 0 ? "+" : "";

  return `${prefix}${rounded}%`;
}

export default function InvestmentsHero({
  portfolioValueMinor,
  investedMinor,
  gainMinor,
  gainPercentage,
  onAddHolding,
}: InvestmentsHeroProps) {
  const isNegative = gainMinor < 0;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 px-6 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.2),transparent_68%)]" />

      <div className="relative grid gap-8 xl:grid-cols-[1.25fr_1fr] xl:items-end">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <TrendingUp size={17} />
            <span>Portfolio tracking</span>
          </div>

          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Track your investments and long-term growth.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Add ETFs, stocks, crypto and other holdings to monitor
            value, invested capital and unrealized performance.
          </p>

          <button
            type="button"
            onClick={onAddHolding}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            <Plus size={17} />
            Add holding
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Portfolio value
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {formatMinorCurrency(portfolioValueMinor)}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Invested
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {formatMinorCurrency(investedMinor)}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Unrealized return
            </p>

            <p
              className={`mt-3 text-2xl font-bold tracking-tight ${
                isNegative
                  ? "text-red-400"
                  : "text-emerald-400"
              }`}
            >
              {formatMinorCurrency(gainMinor)}
            </p>

            <p
              className={`mt-1 text-sm font-semibold ${
                isNegative
                  ? "text-red-400"
                  : "text-emerald-400"
              }`}
            >
              {formatPercentage(gainPercentage)}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
