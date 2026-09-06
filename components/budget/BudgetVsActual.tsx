import {
  ArrowDownRight,
  ArrowUpRight,
  CircleGauge,
  EqualApproximately,
  TriangleAlert,
} from "lucide-react";

import {
  formatBudgetMonthLabel,
} from "@/lib/budget-month-label";
import {
  formatCurrency,
} from "@/lib/money";
import {
  amountMinorToEuroAmount,
} from "@/lib/transaction-amount";
import type {
  BudgetActualInsight,
  BudgetActualStatus,
} from "@/lib/budget-actual";

type BudgetVsActualProps = {
  insight: BudgetActualInsight;
};

const statusLabel: Record<
  BudgetActualStatus,
  string
> = {
  "no-budget": "No plan",
  "on-track": "On track",
  "near-limit": "Near limit",
  "over-budget": "Over budget",
};

const statusStyle: Record<
  BudgetActualStatus,
  string
> = {
  "no-budget":
    "border-zinc-700 bg-zinc-800/70 text-zinc-300",
  "on-track":
    "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300",
  "near-limit":
    "border-amber-500/20 bg-amber-500/[0.08] text-amber-300",
  "over-budget":
    "border-red-500/20 bg-red-500/[0.08] text-red-300",
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

function formatPercentage(
  value: number | null
) {
  if (
    value === null
  ) {
    return "—";
  }

  const rounded =
    Math.round(value);

  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

export default function BudgetVsActual({
  insight,
}: BudgetVsActualProps) {
  const progressWidth =
    insight.usagePercentage ===
    null
      ? 0
      : Math.min(
          100,
          Math.max(
            0,
            insight.usagePercentage
          )
        );

  const isOver =
    insight.varianceMinor <
    0;

  const changeIsUp =
    (
      insight.monthOverMonthChangePercent ??
      0
    ) > 0;

  const ChangeIcon =
    changeIsUp
      ? ArrowUpRight
      : ArrowDownRight;

  return (
    <section
      aria-labelledby="budget-vs-actual-title"
      className="mt-10"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="budget-vs-actual-title"
            className="text-lg font-semibold text-white"
          >
            Budget vs actual
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            See how your complete monthly spending compares with the plan.
          </p>
        </div>

        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle[insight.status]}`}
        >
          {
            statusLabel[
              insight.status
            ]
          }
        </span>
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-600">
              Planned
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {formatMinorCurrency(
                insight.plannedMinor
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-600">
              Actual spending
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {formatMinorCurrency(
                insight.actualSpentMinor
              )}
            </p>

            {insight.unbudgetedSpentMinor >
              0 && (
              <p className="mt-1 text-xs text-amber-300">
                {formatMinorCurrency(
                  insight.unbudgetedSpentMinor
                )}{" "}
                unbudgeted
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-600">
              Variance
            </p>

            <p
              className={`mt-2 text-2xl font-bold ${
                isOver
                  ? "text-red-400"
                  : "text-emerald-400"
              }`}
            >
              {isOver
                ? "-"
                : "+"}
              {formatMinorCurrency(
                Math.abs(
                  insight.varianceMinor
                )
              )}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              {isOver
                ? "above plan"
                : "still within plan"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-600">
              vs previous month
            </p>

            <div className="mt-2 flex items-center gap-2">
              {insight.monthOverMonthChangePercent ===
              null ? (
                <EqualApproximately
                  size={19}
                  className="text-zinc-500"
                />
              ) : (
                <ChangeIcon
                  size={19}
                  className={
                    changeIsUp
                      ? "text-amber-300"
                      : "text-emerald-400"
                  }
                />
              )}

              <p className="text-2xl font-bold text-white">
                {formatPercentage(
                  insight.monthOverMonthChangePercent
                )}
              </p>
            </div>

            <p className="mt-1 text-xs text-zinc-600">
              {formatBudgetMonthLabel(
                insight.previousMonth
              )}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between gap-4 text-xs">
            <span className="font-medium text-zinc-500">
              Overall budget usage
            </span>

            <span className="font-semibold text-zinc-300">
              {insight.usagePercentage ===
              null
                ? "—"
                : `${Math.round(
                    insight.usagePercentage
                  )}%`}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all ${
                insight.status ===
                "over-budget"
                  ? "bg-red-500"
                  : insight.status ===
                      "near-limit"
                    ? "bg-amber-400"
                    : "bg-emerald-500"
              }`}
              style={{
                width: `${progressWidth}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2">
              <TriangleAlert
                size={16}
                className="text-red-400"
              />

              <p className="text-sm font-semibold text-white">
                Budget pressure
              </p>
            </div>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {insight.overBudgetCategoryCount >
              0
                ? `${insight.overBudgetCategoryCount} ${
                    insight.overBudgetCategoryCount ===
                    1
                      ? "category is"
                      : "categories are"
                  } over budget.`
                : insight.nearLimitCategoryCount >
                    0
                  ? `${insight.nearLimitCategoryCount} ${
                      insight.nearLimitCategoryCount ===
                      1
                        ? "category is"
                        : "categories are"
                    } close to the limit.`
                  : "No budget category is currently under pressure."}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2">
              <CircleGauge
                size={16}
                className="text-amber-300"
              />

              <p className="text-sm font-semibold text-white">
                Largest overrun
              </p>
            </div>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {insight.largestOverrun
                ? `${insight.largestOverrun.category} is ${formatMinorCurrency(
                    Math.abs(
                      insight.largestOverrun
                        .varianceMinor
                    )
                  )} above its monthly limit.`
                : "No category is above its monthly limit."}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2">
              <ArrowDownRight
                size={16}
                className="text-emerald-400"
              />

              <p className="text-sm font-semibold text-white">
                Largest buffer
              </p>
            </div>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {insight.largestBuffer
                ? `${insight.largestBuffer.category} still has ${formatMinorCurrency(
                    insight.largestBuffer
                      .varianceMinor
                  )} available.`
                : "There is no remaining category buffer yet."}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
