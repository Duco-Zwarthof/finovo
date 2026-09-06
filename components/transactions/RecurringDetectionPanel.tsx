"use client";

import Link from "next/link";
import {
  CalendarClock,
  ChevronRight,
  Repeat2,
  Sparkles,
} from "lucide-react";

import {
  formatCurrency,
} from "@/lib/money";
import {
  amountMinorToEuroAmount,
} from "@/lib/transaction-amount";
import {
  detectRecurringTransactions,
} from "@/lib/recurring-detection";
import type {
  Transaction,
} from "@/lib/types";

type RecurringDetectionPanelProps = {
  transactions:
    readonly Transaction[];
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

function formatExpectedDate(
  value: string
) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
    }
  ).format(date);
}

export default function RecurringDetectionPanel({
  transactions,
}: RecurringDetectionPanelProps) {
  const candidates =
    detectRecurringTransactions(
      transactions
    );

  if (
    transactions.length <
    3
  ) {
    return null;
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.08] via-zinc-900 to-zinc-900 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
            <Sparkles
              size={14}
            />
            Smart detection
          </div>

          <h2 className="mt-2 text-lg font-semibold text-white">
            Possible recurring transactions
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
            Finovo checks your local transaction history for stable monthly patterns. Nothing is converted automatically.
          </p>
        </div>

        <Link
          href="/recurring"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/[0.08] px-4 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/[0.13]"
        >
          Review recurring
          <ChevronRight
            size={14}
          />
        </Link>
      </div>

      {candidates.length >
      0 ? (
        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {candidates
            .slice(0, 6)
            .map(
              (candidate) => (
                <article
                  key={
                    candidate.id
                  }
                  className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Repeat2
                          size={15}
                          className="shrink-0 text-violet-300"
                        />

                        <p className="truncate text-sm font-semibold text-white">
                          {
                            candidate.title
                          }
                        </p>
                      </div>

                      <p className="mt-1 text-xs text-zinc-600">
                        {
                          candidate.occurrences
                        }{" "}
                        monthly matches ·{" "}
                        {
                          candidate.category
                        }
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        candidate.confidence ===
                        "high"
                          ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300"
                          : "border-amber-500/20 bg-amber-500/[0.07] text-amber-300"
                      }`}
                    >
                      {
                        candidate.confidence
                      }
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-600">
                        Average
                      </p>

                      <p
                        className={`mt-1 text-sm font-semibold ${
                          candidate.type ===
                          "income"
                            ? "text-emerald-400"
                            : "text-white"
                        }`}
                      >
                        {candidate.type ===
                        "income"
                          ? "+"
                          : "-"}
                        {formatMinorCurrency(
                          candidate.averageAmountMinor
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-600">
                        Next expected
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
                        <CalendarClock
                          size={13}
                          className="text-zinc-500"
                        />
                        {formatExpectedDate(
                          candidate.nextExpectedDate
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )
            )}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
          <p className="text-sm font-semibold text-zinc-300">
            No strong monthly patterns yet
          </p>

          <p className="mt-1 text-sm leading-6 text-zinc-600">
            After you import a few months of bank history, Finovo can start spotting likely subscriptions, salary and other repeating payments.
          </p>
        </div>
      )}

      {candidates.length >
        6 && (
        <p className="mt-3 text-xs text-zinc-600">
          Showing the 6 strongest of{" "}
          {
            candidates.length
          }{" "}
          detected patterns.
        </p>
      )}
    </section>
  );
}
