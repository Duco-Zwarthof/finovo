import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";

import type { CashflowForecastEvent } from "@/lib/cashflow-forecast-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type UpcomingPaymentsProps = {
  events: readonly CashflowForecastEvent[];
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(
    new Date(`${value}T00:00:00Z`)
  );
}

export default function UpcomingPayments({
  events,
}: UpcomingPaymentsProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Upcoming payments
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Active recurring income and expenses inside the selected forecast period.
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
          <CalendarDays size={20} />
        </div>
      </div>

      {events.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
          <p className="text-sm font-semibold text-white">
            Nothing scheduled
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            There are no active recurring transactions in this forecast window.
          </p>
        </div>
      ) : (
        <div className="mt-7 divide-y divide-white/10">
          {events.map((event) => {
            const isIncome =
              event.type === "income";
            const Icon = isIncome
              ? ArrowUpRight
              : ArrowDownRight;

            return (
              <article
                key={event.id}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isIncome
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {event.title}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {event.category} ·{" "}
                    {formatDate(event.date)}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      isIncome
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatMinorCurrency(
                      event.amountMinor
                    )}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Balance{" "}
                    {formatMinorCurrency(
                      event.balanceAfterMinor
                    )}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
