"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  calculateScenarioProjection,
} from "@/lib/scenario-planner";
import type {
  ScenarioAdjustment,
} from "@/lib/scenario-planner-types";
import {
  formatCompactCurrency,
  formatCurrency,
} from "@/lib/money";

const horizons = [1, 3, 5, 10] as const;

type ScenarioPlannerCardProps = {
  startingCashMinor: number;
  startingInvestmentsMinor: number;
};

function euroToMinor(
  value: number
) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(value * 100)
  );
}

function formatMinor(
  valueMinor: number
) {
  return formatCurrency(
    valueMinor / 100
  );
}

function formatCompactMinor(
  valueMinor: number
) {
  return formatCompactCurrency(
    valueMinor / 100
  );
}

export default function ScenarioPlannerCard({
  startingCashMinor,
  startingInvestmentsMinor,
}: ScenarioPlannerCardProps) {
  const [salary, setSalary] =
    useState(300);
  const [expenses, setExpenses] =
    useState(150);
  const [invest, setInvest] =
    useState(250);
  const [years, setYears] =
    useState<(typeof horizons)[number]>(5);

  const adjustments =
    useMemo<ScenarioAdjustment[]>(
      () => [
        {
          id: "income-change",
          type: "monthly-income",
          label: "Extra monthly income",
          amountMinor:
            euroToMinor(salary),
        },
        {
          id: "expense-change",
          type: "monthly-expense",
          label: "Higher monthly expenses",
          amountMinor:
            euroToMinor(expenses),
        },
        {
          id: "investment-change",
          type: "monthly-investment",
          label: "Extra monthly investing",
          amountMinor:
            euroToMinor(invest),
        },
      ],
      [
        salary,
        expenses,
        invest,
      ]
    );

  const projection = useMemo(
    () =>
      calculateScenarioProjection(
        startingCashMinor,
        startingInvestmentsMinor,
        adjustments,
        years * 12
      ),
    [
      startingCashMinor,
      startingInvestmentsMinor,
      adjustments,
      years,
    ]
  );

  const startingNetWorthMinor =
    startingCashMinor +
    startingInvestmentsMinor;

  const netWorthChangeMinor =
    projection.projectedNetWorthMinor -
    startingNetWorthMinor;

  const chartData = useMemo(
    () =>
      projection.points.map(
        (point) => ({
          month: point.month,
          cash:
            point.projectedCashMinor,
          investments:
            point.projectedInvestmentsMinor,
          netWorth:
            point.projectedNetWorthMinor,
        })
      ),
    [projection.points]
  );

  const lowestCashMinor =
    useMemo(
      () =>
        Math.min(
          ...projection.points.map(
            (point) =>
              point.projectedCashMinor
          )
        ),
      [projection.points]
    );

  const hasNegativeCash =
    lowestCashMinor < 0;

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-6 sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-400">
              What-if planning
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Scenario planner
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Test how changes to income, expenses and monthly investing could
              affect your current cash and investment balances over time.
            </p>
          </div>

          <div className="grid min-w-full gap-3 sm:grid-cols-2 xl:min-w-[30rem]">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
                Starting cash
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatMinor(
                  startingCashMinor
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
                Starting investments
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatMinor(
                  startingInvestmentsMinor
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">
              Extra income (€ / month)
            </span>

            <input
              min={0}
              step="10"
              type="number"
              value={salary}
              onChange={(event) =>
                setSalary(
                  Math.max(
                    0,
                    Number(
                      event.target.value
                    ) || 0
                  )
                )
              }
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-blue-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-400">
              Higher expenses (€ / month)
            </span>

            <input
              min={0}
              step="10"
              type="number"
              value={expenses}
              onChange={(event) =>
                setExpenses(
                  Math.max(
                    0,
                    Number(
                      event.target.value
                    ) || 0
                  )
                )
              }
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-blue-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-400">
              Extra investing (€ / month)
            </span>

            <input
              min={0}
              step="10"
              type="number"
              value={invest}
              onChange={(event) =>
                setInvest(
                  Math.max(
                    0,
                    Number(
                      event.target.value
                    ) || 0
                  )
                )
              }
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-blue-500"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {horizons.map(
            (horizon) => {
              const isActive =
                years === horizon;

              return (
                <button
                  key={horizon}
                  type="button"
                  onClick={() =>
                    setYears(horizon)
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "border border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {horizon} year
                  {horizon > 1
                    ? "s"
                    : ""}
                </button>
              );
            }
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <WalletCards size={18} />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-zinc-600">
            Ending cash
          </p>
          <p className="mt-2 text-xl font-bold text-white">
            {formatMinor(
              projection.projectedCashMinor
            )}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <TrendingUp size={18} />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-zinc-600">
            Ending investments
          </p>
          <p className="mt-2 text-xl font-bold text-white">
            {formatMinor(
              projection.projectedInvestmentsMinor
            )}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
            Ending net worth
          </p>
          <p className="mt-3 text-xl font-bold text-white">
            {formatMinor(
              projection.projectedNetWorthMinor
            )}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            After {years} year
            {years > 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
            Net worth change
          </p>
          <p
            className={`mt-3 text-xl font-bold ${
              netWorthChangeMinor >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {formatMinor(
              netWorthChangeMinor
            )}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Investing moves cash into investments, so it does not increase
            net worth by itself.
          </p>
        </div>
      </div>

      {hasNegativeCash && (
        <div className="flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-4">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-amber-400"
          />
          <div>
            <p className="text-sm font-semibold text-amber-200">
              This scenario runs cash below zero.
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-100/70">
              The lowest projected cash balance is{" "}
              {formatMinor(
                lowestCashMinor
              )}. Consider reducing extra investing or expenses.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Projected balances
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              A straight-line projection of this scenario. Investment returns
              are intentionally not assumed yet.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            Now
            <ArrowRight size={14} />
            {years}y
          </div>
        </div>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={chartData}
              margin={{
                top: 8,
                right: 8,
                bottom: 0,
                left: 0,
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
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(
                  month: number
                ) =>
                  month === 0
                    ? "Now"
                    : `${Math.round(
                        month / 12
                      )}y`
                }
                minTickGap={32}
              />

              <YAxis
                tick={{
                  fill: "#71717a",
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={false}
                width={70}
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
                  stroke:
                    "rgba(255,255,255,0.12)",
                }}
                contentStyle={{
                  background:
                    "#09090b",
                  border:
                    "1px solid rgba(255,255,255,0.1)",
                  borderRadius:
                    "12px",
                }}
                labelFormatter={(
                  month
                ) =>
                  `Month ${month}`
                }
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

              <Line
                type="monotone"
                dataKey="netWorth"
                name="Net worth"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="cash"
                name="Cash"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="investments"
                name="Investments"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
