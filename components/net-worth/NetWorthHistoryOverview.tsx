import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";

import type {
  NetWorthHistorySummary,
  NetWorthSnapshot,
} from "@/lib/net-worth-history-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type NetWorthHistoryOverviewProps = {
  snapshots: readonly NetWorthSnapshot[];
  summary: NetWorthHistorySummary;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function NetWorthHistoryOverview({
  snapshots,
  summary,
}: NetWorthHistoryOverviewProps) {
  const isNegative = summary.changeMinor < 0;
  const ChangeIcon = isNegative
    ? ArrowDownRight
    : ArrowUpRight;

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Net worth history
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Finovo stores one local snapshot per day and updates today&apos;s
            snapshot when your included account balances change.
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
          <CalendarDays size={20} />
        </div>
      </div>

      {snapshots.length < 2 ||
      !summary.firstSnapshot ||
      !summary.latestSnapshot ||
      !summary.highestSnapshot ||
      !summary.lowestSnapshot ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
          <p className="text-sm font-semibold text-white">
            First snapshot saved
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Return on another day to start seeing changes, highs and lows.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-500">
                Change since {formatDate(summary.firstSnapshot.date)}
              </p>

              <p
                className={`mt-2 text-3xl font-bold tracking-tight ${
                  isNegative
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                {formatMinorCurrency(summary.changeMinor)}
              </p>
            </div>

            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                isNegative
                  ? "bg-red-500/10 text-red-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              <ChangeIcon size={16} />
              {formatPercentage(summary.changePercentage)}
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl bg-white/[0.03] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">
                Latest
              </p>

              <p className="mt-2 font-semibold text-white">
                {formatMinorCurrency(
                  summary.latestSnapshot.netWorthMinor
                )}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {formatDate(summary.latestSnapshot.date)}
              </p>
            </article>

            <article className="rounded-2xl bg-white/[0.03] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">
                Highest
              </p>

              <p className="mt-2 font-semibold text-white">
                {formatMinorCurrency(
                  summary.highestSnapshot.netWorthMinor
                )}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {formatDate(summary.highestSnapshot.date)}
              </p>
            </article>

            <article className="rounded-2xl bg-white/[0.03] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">
                Lowest
              </p>

              <p className="mt-2 font-semibold text-white">
                {formatMinorCurrency(
                  summary.lowestSnapshot.netWorthMinor
                )}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {formatDate(summary.lowestSnapshot.date)}
              </p>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
