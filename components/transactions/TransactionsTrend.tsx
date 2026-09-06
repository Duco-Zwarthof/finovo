"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Equal,
  Gauge,
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
  minorUnitsToEuroAmount,
} from "@/lib/transaction-amount";
import type {
  TransactionTrendSummary,
} from "@/lib/transaction-trends";

type TransactionsTrendProps = {
  trends: TransactionTrendSummary;
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

function formatCompactMinor(
  amountMinor: number
) {
  return formatCompactCurrency(
    minorUnitsToEuroAmount(
      amountMinor
    ) ?? 0
  );
}

function formatPercentChange(
  value: number | null
) {
  if (value === null) {
    return "New this month";
  }

  if (value === 0) {
    return "No change";
  }

  const prefix =
    value > 0 ? "+" : "";

  return `${prefix}${value.toFixed(
    1
  )}%`;
}

function ChangeIcon({
  value,
}: {
  value: number | null;
}) {
  if (
    value === null ||
    value === 0
  ) {
    return (
      <Equal
        size={14}
        className="text-zinc-500"
      />
    );
  }

  return value > 0 ? (
    <ArrowUpRight
      size={14}
      className="text-amber-400"
    />
  ) : (
    <ArrowDownRight
      size={14}
      className="text-emerald-400"
    />
  );
}

export default function TransactionsTrend({
  trends,
}: TransactionsTrendProps) {
  const chartData =
    trends.months.map(
      (month) => ({
        month: month.label,
        Income:
          month.incomeMinor,
        Expenses:
          month.expensesMinor,
        Surplus:
          month.surplusMinor,
      })
    );

  return (
    <section className="mt-8 space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-violet-400">
          Financial trend
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Six-month cash flow
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          See how income, expenses and surplus are developing over time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <ChangeIcon
              value={
                trends.expenseChangePercent
              }
            />
            Expenses vs last month
          </div>

          <p className="mt-3 text-xl font-bold text-white">
            {formatPercentChange(
              trends.expenseChangePercent
            )}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Current:{" "}
            {formatMinor(
              trends.current
                .expensesMinor
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <ArrowUpRight
              size={14}
              className="text-blue-400"
            />
            Income vs last month
          </div>

          <p className="mt-3 text-xl font-bold text-white">
            {formatPercentChange(
              trends.incomeChangePercent
            )}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Current:{" "}
            {formatMinor(
              trends.current
                .incomeMinor
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <Gauge
              size={14}
              className="text-emerald-400"
            />
            Surplus change
          </div>

          <p
            className={`mt-3 text-xl font-bold ${
              trends.surplusChangeMinor >=
              0
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {trends.surplusChangeMinor >
            0
              ? "+"
              : ""}
            {formatMinor(
              trends.surplusChangeMinor
            )}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Avg. monthly expenses:{" "}
            {formatMinor(
              trends.averageMonthlyExpensesMinor
            )}
          </p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Income vs expenses
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Rolling six-month overview
            </p>
          </div>

          <p className="text-xs text-zinc-600">
            Includes months with no recorded activity
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
                  formatMinor(
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
                dataKey="Income"
                stroke="#22c55e"
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
                dataKey="Expenses"
                stroke="#ef4444"
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
                dataKey="Surplus"
                stroke="#3b82f6"
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
    </section>
  );
}
