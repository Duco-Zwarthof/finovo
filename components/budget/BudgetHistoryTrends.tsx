"use client";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatCompactCurrency,
  formatCurrency,
} from "@/lib/money";
import {
  amountMinorToEuroAmount,
} from "@/lib/transaction-amount";
import type {
  BudgetCategoryHistory,
  BudgetHistorySummary,
} from "@/lib/budget-history";

type BudgetHistoryTrendsProps = {
  history: BudgetHistorySummary;
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

function formatCompactMinor(
  amountMinor: number
) {
  return formatCompactCurrency(
    amountMinorToEuroAmount(
      amountMinor
    ) ?? 0
  );
}

function formatPercent(
  value: number | null,
  digits = 0
) {
  if (
    value === null
  ) {
    return "—";
  }

  return `${value.toFixed(
    digits
  )}%`;
}

function formatChange(
  value: number | null
) {
  if (
    value === null
  ) {
    return "No prior spend";
  }

  if (
    Math.abs(value) <
    0.05
  ) {
    return "No change";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(
    1
  )}%`;
}

function CategoryTrendCard({
  category,
  historyMonthCount,
}: {
  category: BudgetCategoryHistory;
  historyMonthCount: number;
}) {
  const isIncreasing =
    (
      category.spendingChangePercent ??
      0
    ) > 0;

  const ChangeIcon =
    isIncreasing
      ? TrendingUp
      : TrendingDown;

  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-white">
            {
              category.category
            }
          </h4>

          <p className="mt-1 text-xs text-zinc-600">
            Avg.{" "}
            {formatMinorCurrency(
              category.averageSpentMinor
            )}{" "}
            / month
          </p>
        </div>

        <div
          className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${
            isIncreasing
              ? "border-amber-500/20 bg-amber-500/[0.08] text-amber-300"
              : "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300"
          }`}
        >
          <ChangeIcon
            size={12}
          />
          {formatChange(
            category.spendingChangePercent
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-600">
            Current
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            {formatMinorCurrency(
              category.currentSpentMinor
            )}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-600">
            Over budget
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            {
              category.overBudgetMonthCount
            }
            /
            {
              category.budgetedMonthCount
            }{" "}
            budgeted months
          </p>
        </div>
      </div>

      {category.currentOverspendStreak >
        1 && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-xs font-medium text-red-300">
          {
            category.currentOverspendStreak
          }{" "}
          months in a row above budget
        </div>
      )}

      {category.budgetedMonthCount ===
        0 && (
        <p className="mt-4 text-xs text-zinc-600">
          Spending exists, but no budget was set during this {historyMonthCount}-month window.
        </p>
      )}
    </article>
  );
}

export default function BudgetHistoryTrends({
  history,
}: BudgetHistoryTrendsProps) {
  const chartData =
    history.months.map(
      (month) => ({
        month: month.label,
        Planned:
          month.plannedMinor,
        Actual:
          month.actualMinor,
      })
    );

  return (
    <section
      aria-labelledby="budget-history-title"
      className="mt-10 space-y-4"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-violet-400">
          History
        </p>

        <h2
          id="budget-history-title"
          className="mt-2 text-2xl font-bold tracking-tight text-white"
        >
          Budget history & trends
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Compare your plan with actual spending across the last{" "}
          {
            history.months.length
          }{" "}
          months and spot recurring pressure.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <BarChart3
              size={14}
              className="text-blue-400"
            />
            Avg. monthly spend
          </div>

          <p className="mt-3 text-xl font-bold text-white">
            {formatMinorCurrency(
              history.averageMonthlySpentMinor
            )}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Avg. plan:{" "}
            {formatMinorCurrency(
              history.averageMonthlyPlannedMinor
            )}
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <CheckCircle2
              size={14}
              className="text-emerald-400"
            />
            Budget accuracy
          </div>

          <p className="mt-3 text-xl font-bold text-white">
            {formatPercent(
              history.budgetAccuracyPercent
            )}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            How closely total spending matched your monthly plan
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <AlertTriangle
              size={14}
              className="text-amber-300"
            />
            Months over plan
          </div>

          <p className="mt-3 text-xl font-bold text-white">
            {
              history.monthsOverPlan
            }
            /
            {
              history.months.length
            }
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Months where total expenses exceeded planned limits
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <CheckCircle2
              size={14}
              className="text-violet-400"
            />
            Category adherence
          </div>

          <p className="mt-3 text-xl font-bold text-white">
            {formatPercent(
              history.categoryAdherencePercent
            )}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Share of budgeted category-months that stayed within limit
          </p>
        </article>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Plan vs actual
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Total budget limits compared with all recorded expenses
            </p>
          </div>

          <p className="text-xs text-zinc-600">
            Unbudgeted expenses are included in Actual
          </p>
        </div>

        <div className="mt-5 h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={chartData}
              margin={{
                top: 8,
                right: 8,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
                width={65}
                tickFormatter={(
                  value: number
                ) =>
                  formatCompactMinor(
                    value
                  )
                }
              />

              <Tooltip
                contentStyle={{
                  background:
                    "#09090b",
                  border:
                    "1px solid rgba(255,255,255,0.1)",
                  borderRadius:
                    "12px",
                }}
                formatter={(
                  value,
                  name
                ) => [
                  formatMinorCurrency(
                    Number(value)
                  ),
                  String(name),
                ]}
              />

              <Legend
                wrapperStyle={{
                  color: "#a1a1aa",
                  fontSize: 12,
                }}
              />

              <Line
                type="monotone"
                dataKey="Planned"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                }}
              />

              <Line
                type="monotone"
                dataKey="Actual"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Recurring budget pressure
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Categories that are currently above budget for consecutive months.
            </p>
          </div>
        </div>

        {history.recurringPressure.length >
        0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {history.recurringPressure.map(
              (category) => (
                <div
                  key={
                    category.category
                  }
                  className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      size={16}
                      className="text-red-400"
                    />

                    <p className="font-semibold text-white">
                      {
                        category.category
                      }
                    </p>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {
                      category.currentOverspendStreak
                    }{" "}
                    months in a row above budget. Current spend is{" "}
                    {formatMinorCurrency(
                      category.currentSpentMinor
                    )}
                    {category.currentLimitMinor !==
                    null
                      ? ` against a ${formatMinorCurrency(
                          category.currentLimitMinor
                        )} limit.`
                      : "."}
                  </p>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4">
            <p className="text-sm font-semibold text-emerald-300">
              No recurring overspending detected
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              No category is currently above budget for two consecutive months.
            </p>
          </div>
        )}
      </div>

      {history.categories.length >
        0 && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">
              Category trends
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Average spending and recent movement by category.
            </p>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {history.categories.map(
              (category) => (
                <CategoryTrendCard
                  key={
                    category.category
                  }
                  category={
                    category
                  }
                  historyMonthCount={
                    history.months.length
                  }
                />
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}
