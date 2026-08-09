import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
} from "lucide-react";

import type { CashflowForecast } from "@/lib/cashflow-forecast-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type ForecastHeroProps = {
  forecast: CashflowForecast;
  horizonDays: number;
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function ForecastHero({
  forecast,
  horizonDays,
}: ForecastHeroProps) {
  const isNegative =
    forecast.projectedChangeMinor < 0;
  const ChangeIcon = isNegative
    ? ArrowDownRight
    : ArrowUpRight;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 px-6 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.2),transparent_68%)]" />

      <div className="relative grid gap-8 xl:grid-cols-[1.3fr_1fr] xl:items-end">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <CalendarRange size={17} />
            <span>Cashflow forecast</span>
          </div>

          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            See where your cash could be heading next.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Forecasts use your liquid account balances and active recurring
            income and expenses. They are planning estimates, not guaranteed outcomes.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Starting balance
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {formatMinorCurrency(
                forecast.startingBalanceMinor
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Expected in {horizonDays}d
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {formatMinorCurrency(
                forecast.endingBalanceMinor
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Projected change
            </p>

            <div
              className={`mt-3 flex items-center gap-2 text-2xl font-bold tracking-tight ${
                isNegative
                  ? "text-red-400"
                  : "text-emerald-400"
              }`}
            >
              <ChangeIcon size={20} />
              <span>
                {formatMinorCurrency(
                  forecast.projectedChangeMinor
                )}
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
