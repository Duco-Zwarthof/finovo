import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  Gauge,
  Landmark,
  Repeat2,
  ShieldAlert,
  WalletCards,
} from "lucide-react";

import type {
  DashboardFinancialOverview,
  DashboardFinancialStatus,
} from "@/lib/dashboard-financial-overview";
import {
  formatCurrency,
} from "@/lib/money";
import {
  minorUnitsToEuroAmount,
} from "@/lib/transaction-amount";

type DashboardFinancialOverviewProps = {
  overview: DashboardFinancialOverview;
};

const statusLabel: Record<
  DashboardFinancialStatus,
  string
> = {
  strong: "Strong",
  stable: "Stable",
  watch: "Watch",
  risk: "Risk",
};

const statusStyle: Record<
  DashboardFinancialStatus,
  string
> = {
  strong:
    "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300",
  stable:
    "border-blue-500/20 bg-blue-500/[0.08] text-blue-300",
  watch:
    "border-amber-500/20 bg-amber-500/[0.08] text-amber-300",
  risk:
    "border-red-500/20 bg-red-500/[0.08] text-red-300",
};

function formatMinor(
  amountMinor: number
) {
  return formatCurrency(
    minorUnitsToEuroAmount(
      amountMinor
    ) ?? 0
  );
}

function formatSignedMinor(
  amountMinor: number
) {
  const sign =
    amountMinor > 0
      ? "+"
      : amountMinor < 0
        ? "-"
        : "";

  return `${sign}${formatMinor(
    Math.abs(amountMinor)
  )}`;
}

function formatPercent(
  value: number | null
) {
  if (
    value === null
  ) {
    return "—";
  }

  return `${Math.round(
    value
  )}%`;
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return "No upcoming item";
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
    }
  ).format(
    new Date(
      year,
      month - 1,
      day
    )
  );
}

export default function DashboardFinancialOverview({
  overview,
}: DashboardFinancialOverviewProps) {
  return (
    <section
      aria-labelledby="financial-command-center-title"
      className="mb-10"
    >
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900">
        <div className="flex flex-col gap-5 border-b border-white/10 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-400">
                Financial command center
              </p>

              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusStyle[overview.status]}`}
              >
                {
                  statusLabel[
                    overview.status
                  ]
                }
              </span>
            </div>

            <h2
              id="financial-command-center-title"
              className="mt-2 text-2xl font-bold tracking-tight text-white"
            >
              {
                overview.headline
              }
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
              Accounts, this month&apos;s spending, budget health and the next 30 days in one place.
            </p>
          </div>

          <Link
            href={
              overview.focusHref
            }
            className="inline-flex h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            {
              overview.focusLabel
            }
            <ArrowRight
              size={15}
            />
          </Link>
        </div>

        <div className="grid gap-px bg-white/10 lg:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/accounts"
            className="bg-zinc-900 p-5 transition hover:bg-zinc-800/80"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
              <Landmark
                size={14}
                className="text-emerald-400"
              />
              Cash position
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {formatMinor(
                overview.liquidBalanceMinor
              )}
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Net worth{" "}
              {formatMinor(
                overview.netWorthMinor
              )}{" "}
              ·{" "}
              {
                overview.includedAccountCount
              }{" "}
              included{" "}
              {overview.includedAccountCount ===
              1
                ? "account"
                : "accounts"}
            </p>
          </Link>

          <Link
            href="/transactions"
            className="bg-zinc-900 p-5 transition hover:bg-zinc-800/80"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
              <CircleDollarSign
                size={14}
                className="text-blue-400"
              />
              This month
            </div>

            <p
              className={`mt-3 text-2xl font-bold ${
                overview.monthlySurplusMinor <
                0
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
              {formatSignedMinor(
                overview.monthlySurplusMinor
              )}
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              {formatMinor(
                overview.monthlyIncomeMinor
              )}{" "}
              income ·{" "}
              {formatMinor(
                overview.monthlyExpensesMinor
              )}{" "}
              spent ·{" "}
              {formatPercent(
                overview.surplusRate
              )}{" "}
              surplus rate
            </p>
          </Link>

          <Link
            href="/budget"
            className="bg-zinc-900 p-5 transition hover:bg-zinc-800/80"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
              <Gauge
                size={14}
                className="text-amber-300"
              />
              Budget
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {formatPercent(
                overview.budgetUsagePercentage
              )}
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              {formatMinor(
                overview.budgetActualMinor
              )}{" "}
              actual of{" "}
              {formatMinor(
                overview.budgetPlannedMinor
              )}{" "}
              planned
            </p>
          </Link>

          <Link
            href="/forecast"
            className="bg-zinc-900 p-5 transition hover:bg-zinc-800/80"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
              <WalletCards
                size={14}
                className="text-violet-300"
              />
              Next 30 days
            </div>

            <p
              className={`mt-3 text-2xl font-bold ${
                overview.forecastEndingBalanceMinor <
                0
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
              {formatMinor(
                overview.forecastEndingBalanceMinor
              )}
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Projected change{" "}
              <span
                className={
                  overview.forecastChangeMinor <
                  0
                    ? "text-amber-300"
                    : "text-emerald-400"
                }
              >
                {formatSignedMinor(
                  overview.forecastChangeMinor
                )}
              </span>
            </p>
          </Link>
        </div>

        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2">
              <Repeat2
                size={15}
                className="text-violet-300"
              />

              <p className="text-sm font-semibold text-white">
                Recurring coverage
              </p>
            </div>

            <p className="mt-3 text-xl font-bold text-white">
              {formatPercent(
                overview.recurringCoveragePercentage
              )}
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              {
                overview.assignedRecurringCount
              }{" "}
              assigned ·{" "}
              {
                overview.unassignedRecurringCount
              }{" "}
              unassigned ·{" "}
              {
                overview.activeRecurringCount
              }{" "}
              active total
            </p>

            <Link
              href="/recurring"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200"
            >
              Manage recurring
              <ArrowRight
                size={12}
              />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2">
              <CalendarClock
                size={15}
                className="text-blue-400"
              />

              <p className="text-sm font-semibold text-white">
                Next recurring item
              </p>
            </div>

            <p className="mt-3 truncate text-sm font-semibold text-white">
              {
                overview.nextRecurringTitle ??
                "Nothing scheduled"
              }
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              {formatDate(
                overview.nextRecurringDate
              )}
              {overview.nextRecurringAmountMinor !==
              null
                ? ` · ${
                    overview.nextRecurringType ===
                    "income"
                      ? "+"
                      : "-"
                  }${formatMinor(
                    overview.nextRecurringAmountMinor
                  )}`
                : ""}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert
                size={15}
                className={
                  overview.forecastRiskAccountCount >
                  0
                    ? "text-red-400"
                    : "text-emerald-400"
                }
              />

              <p className="text-sm font-semibold text-white">
                Forecast safety
              </p>
            </div>

            <p className="mt-3 text-xl font-bold text-white">
              {
                overview.forecastRiskAccountCount
              }{" "}
              {overview.forecastRiskAccountCount ===
              1
                ? "account"
                : "accounts"}
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              {overview.forecastRiskAccountCount >
              0
                ? "Projected to fall below zero in the forecast window."
                : "No liquid account is projected below zero."}
            </p>
          </div>
        </div>

        <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-2">
          <div className="bg-zinc-900 px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-600">
              Recurring inflow · next 30 days
            </p>

            <p className="mt-1 text-sm font-semibold text-emerald-400">
              +{formatMinor(
                overview.forecastRecurringIncomeMinor
              )}
            </p>
          </div>

          <div className="bg-zinc-900 px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-600">
              Recurring outflow · next 30 days
            </p>

            <p className="mt-1 text-sm font-semibold text-red-400">
              -{formatMinor(
                overview.forecastRecurringExpensesMinor
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
