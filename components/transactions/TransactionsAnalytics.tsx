"use client";

import {
  BarChart3,
  Receipt,
  ShoppingBag,
  TrendingDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  TransactionAnalytics,
} from "@/lib/transaction-analytics";

type TransactionsAnalyticsProps = {
  analytics: TransactionAnalytics;
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

export default function TransactionsAnalytics({
  analytics,
}: TransactionsAnalyticsProps) {
  const categoryChartData =
    analytics.categoryBreakdown.map(
      (item) => ({
        category: item.category,
        amountMinor:
          item.amountMinor,
      })
    );

  return (
    <section className="mt-8 space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-400">
          Spending intelligence
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          This month at a glance
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <Receipt size={14} />
            Average expense
          </div>

          <p className="mt-3 text-xl font-bold text-white">
            {formatMinor(
              analytics.averageExpenseMinor
            )}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Across{" "}
            {
              analytics.expenseCount
            }{" "}
            expense
            {analytics.expenseCount ===
            1
              ? ""
              : "s"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <ShoppingBag
              size={14}
              className="text-violet-400"
            />
            Top category
          </div>

          <p className="mt-3 text-xl font-bold text-white">
            {analytics.topCategory
              ?.category ??
              "No expenses"}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            {analytics.topCategory
              ? `${analytics.topCategory.sharePercent.toFixed(
                  1
                )}% of expenses`
              : "Nothing recorded this month"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <TrendingDown
              size={14}
              className="text-red-400"
            />
            Largest expense
          </div>

          <p className="mt-3 truncate text-xl font-bold text-white">
            {analytics
              .largestExpense
              ?.title ??
              "No expenses"}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            {analytics
              .largestExpense
              ? formatMinor(
                  analytics
                    .largestExpense
                    .amountMinor
                )
              : "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <BarChart3
              size={14}
              className="text-blue-400"
            />
            Active categories
          </div>

          <p className="mt-3 text-xl font-bold text-white">
            {
              analytics
                .categoryBreakdown
                .length
            }
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Categories with spending
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-5 sm:p-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Spending by category
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Current calendar month
            </p>
          </div>

          {categoryChartData.length >
          0 ? (
            <div className="mt-5 h-72 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    categoryChartData
                  }
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
                    dataKey="category"
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
                    cursor={{
                      fill:
                        "rgba(255,255,255,0.04)",
                    }}
                    contentStyle={{
                      background:
                        "#09090b",
                      border:
                        "1px solid rgba(255,255,255,0.1)",
                      borderRadius:
                        "12px",
                    }}
                    formatter={(
                      value
                    ) => [
                      formatMinor(
                        Number(value)
                      ),
                      "Spent",
                    ]}
                  />

                  <Bar
                    dataKey="amountMinor"
                    fill="#3b82f6"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-5 flex h-72 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-zinc-950/40 px-6 text-center text-sm text-zinc-600">
              Add expenses this month to see category analytics.
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-white">
            Category breakdown
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Share of monthly expenses
          </p>

          {analytics
            .categoryBreakdown
            .length > 0 ? (
            <div className="mt-5 space-y-4">
              {analytics.categoryBreakdown.map(
                (category) => (
                  <div
                    key={
                      category.category
                    }
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-300">
                          {
                            category.category
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-zinc-600">
                          {
                            category.count
                          }{" "}
                          transaction
                          {category.count ===
                          1
                            ? ""
                            : "s"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {formatMinor(
                            category.amountMinor
                          )}
                        </p>

                        <p className="text-xs text-zinc-600">
                          {category.sharePercent.toFixed(
                            1
                          )}
                          %
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(
                            100,
                            category.sharePercent
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-zinc-950/40 px-4 py-8 text-center text-sm text-zinc-600">
              No expense categories to analyse yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
