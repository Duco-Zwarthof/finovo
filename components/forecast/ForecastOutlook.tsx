import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
} from "lucide-react";

import type {
  ForecastHorizonSnapshot,
} from "@/lib/cashflow-forecast-analysis";
import {
  formatCurrency,
} from "@/lib/money";
import {
  minorUnitsToEuroAmount,
} from "@/lib/transaction-amount";

type ForecastOutlookProps = {
  snapshots: readonly ForecastHorizonSnapshot[];
};

function formatMinorCurrency(
  amountMinor: number
) {
  return formatCurrency(
    minorUnitsToEuroAmount(
      amountMinor
    ) ?? 0
  );
}

export default function ForecastOutlook({
  snapshots,
}: ForecastOutlookProps) {
  return (
    <section className="mt-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          30 / 60 / 90 day outlook
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          A quick view of your projected liquid balance at each planning horizon.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {snapshots.map(
          (snapshot) => {
            const isNegative =
              snapshot.projectedChangeMinor <
              0;

            const Icon =
              isNegative
                ? ArrowDownRight
                : ArrowUpRight;

            return (
              <article
                key={
                  snapshot.days
                }
                className="rounded-2xl border border-white/10 bg-zinc-900 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    <CalendarRange
                      size={14}
                      className="text-blue-400"
                    />
                    {
                      snapshot.days
                    }{" "}
                    days
                  </div>

                  <span className="text-xs text-zinc-600">
                    {
                      snapshot.eventCount
                    }{" "}
                    events
                  </span>
                </div>

                <p className="mt-4 text-2xl font-bold text-white">
                  {formatMinorCurrency(
                    snapshot.endingBalanceMinor
                  )}
                </p>

                <div
                  className={`mt-2 flex items-center gap-1.5 text-sm font-semibold ${
                    isNegative
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  <Icon
                    size={15}
                  />
                  {formatMinorCurrency(
                    snapshot.projectedChangeMinor
                  )}
                </div>
              </article>
            );
          }
        )}
      </div>
    </section>
  );
}
