"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  TrendingDown,
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
  readScenarioSettings,
  writeScenarioSettings,
} from "@/lib/scenario-settings";
import {
  formatCompactCurrency,
  formatCurrency,
} from "@/lib/money";

const horizons = [1, 3, 5, 10] as const;

type ScenarioPlannerCardProps = {
  startingCashMinor: number;
  startingInvestmentsMinor: number;
};

function euroToMinor(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(value * 100)
  );
}

function formatMinor(valueMinor: number) {
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
  const [savedSettings] =
    useState(() =>
      readScenarioSettings()
    );

  const [extraIncome, setExtraIncome] =
    useState(
      savedSettings.extraIncomeEuro
    );
  const [extraExpenses, setExtraExpenses] =
    useState(
      savedSettings.extraExpensesEuro
    );
  const [extraInvesting, setExtraInvesting] =
    useState(
      savedSettings.extraInvestingEuro
    );
  const [years, setYears] =
    useState<(typeof horizons)[number]>(
      savedSettings.years
    );

  const [bearReturn, setBearReturn] =
    useState(
      savedSettings.bearReturn
    );
  const [baseReturn, setBaseReturn] =
    useState(
      savedSettings.baseReturn
    );
  const [bullReturn, setBullReturn] =
    useState(
      savedSettings.bullReturn
    );

  useEffect(() => {
    writeScenarioSettings({
      extraIncomeEuro: extraIncome,
      extraExpensesEuro:
        extraExpenses,
      extraInvestingEuro:
        extraInvesting,
      years,
      bearReturn,
      baseReturn,
      bullReturn,
    });
  }, [
    extraIncome,
    extraExpenses,
    extraInvesting,
    years,
    bearReturn,
    baseReturn,
    bullReturn,
  ]);

  const adjustments =
    useMemo<ScenarioAdjustment[]>(
      () => [
        {
          id: "income-change",
          type: "monthly-income",
          label: "Extra monthly income",
          amountMinor:
            euroToMinor(extraIncome),
        },
        {
          id: "expense-change",
          type: "monthly-expense",
          label: "Higher monthly expenses",
          amountMinor:
            euroToMinor(extraExpenses),
        },
        {
          id: "investment-change",
          type: "monthly-investment",
          label: "Extra monthly investing",
          amountMinor:
            euroToMinor(extraInvesting),
        },
      ],
      [
        extraIncome,
        extraExpenses,
        extraInvesting,
      ]
    );

  const months = years * 12;

  const bearProjection = useMemo(
    () =>
      calculateScenarioProjection(
        startingCashMinor,
        startingInvestmentsMinor,
        adjustments,
        months,
        {
          annualInvestmentReturnPercent:
            bearReturn,
        }
      ),
    [
      startingCashMinor,
      startingInvestmentsMinor,
      adjustments,
      months,
      bearReturn,
    ]
  );

  const baseProjection = useMemo(
    () =>
      calculateScenarioProjection(
        startingCashMinor,
        startingInvestmentsMinor,
        adjustments,
        months,
        {
          annualInvestmentReturnPercent:
            baseReturn,
        }
      ),
    [
      startingCashMinor,
      startingInvestmentsMinor,
      adjustments,
      months,
      baseReturn,
    ]
  );

  const bullProjection = useMemo(
    () =>
      calculateScenarioProjection(
        startingCashMinor,
        startingInvestmentsMinor,
        adjustments,
        months,
        {
          annualInvestmentReturnPercent:
            bullReturn,
        }
      ),
    [
      startingCashMinor,
      startingInvestmentsMinor,
      adjustments,
      months,
      bullReturn,
    ]
  );

  const zeroReturnProjection = useMemo(
    () =>
      calculateScenarioProjection(
        startingCashMinor,
        startingInvestmentsMinor,
        adjustments,
        months
      ),
    [
      startingCashMinor,
      startingInvestmentsMinor,
      adjustments,
      months,
    ]
  );

  const startingNetWorthMinor =
    startingCashMinor +
    startingInvestmentsMinor;

  const baseNetWorthChangeMinor =
    baseProjection.projectedNetWorthMinor -
    startingNetWorthMinor;

  const baseEstimatedGrowthMinor =
    baseProjection.projectedInvestmentsMinor -
    zeroReturnProjection.projectedInvestmentsMinor;

  const totalExtraInvestmentMinor =
    baseProjection.monthlyInvestmentContributionMinor *
    months;

  const chartData = useMemo(
    () =>
      baseProjection.points.map(
        (point, index) => ({
          month: point.month,
          bear:
            bearProjection.points[index]
              ?.projectedNetWorthMinor ??
            point.projectedNetWorthMinor,
          base:
            point.projectedNetWorthMinor,
          bull:
            bullProjection.points[index]
              ?.projectedNetWorthMinor ??
            point.projectedNetWorthMinor,
        })
      ),
    [
      baseProjection.points,
      bearProjection.points,
      bullProjection.points,
    ]
  );

  const lowestCashMinor =
    useMemo(
      () =>
        Math.min(
          ...baseProjection.points.map(
            (point) =>
              point.projectedCashMinor
          )
        ),
      [baseProjection.points]
    );

  const hasNegativeCash =
    lowestCashMinor < 0;

  const scenarioSpreadMinor =
    bullProjection.projectedNetWorthMinor -
    bearProjection.projectedNetWorthMinor;

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
              Explore the same plan under bear, base and bull return assumptions
              instead of relying on one single expected return.
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
              value={extraIncome}
              onChange={(event) =>
                setExtraIncome(
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
              value={extraExpenses}
              onChange={(event) =>
                setExtraExpenses(
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
              value={extraInvesting}
              onChange={(event) =>
                setExtraInvesting(
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

        <div className="mt-7">
          <p className="mb-3 text-sm font-medium text-zinc-400">
            Projection horizon
          </p>

          <div className="flex flex-wrap gap-2">
            {horizons.map((horizon) => {
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
            })}
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <label className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-4">
            <div className="flex items-center gap-2">
              <TrendingDown
                size={16}
                className="text-red-400"
              />
              <span className="text-sm font-semibold text-red-300">
                Bear
              </span>
            </div>

            <input
              min={0}
              max={100}
              step="0.5"
              type="number"
              value={bearReturn}
              onChange={(event) =>
                setBearReturn(
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        event.target.value
                      ) || 0
                    )
                  )
                )
              }
              className="mt-3 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-red-500"
            />

            <p className="mt-2 text-xs text-zinc-600">
              % annual return
            </p>
          </label>

          <label className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.03] p-4">
            <div className="flex items-center gap-2">
              <TrendingUp
                size={16}
                className="text-blue-400"
              />
              <span className="text-sm font-semibold text-blue-300">
                Base
              </span>
            </div>

            <input
              min={0}
              max={100}
              step="0.5"
              type="number"
              value={baseReturn}
              onChange={(event) =>
                setBaseReturn(
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        event.target.value
                      ) || 0
                    )
                  )
                )
              }
              className="mt-3 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-zinc-600">
              % annual return
            </p>
          </label>

          <label className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-4">
            <div className="flex items-center gap-2">
              <TrendingUp
                size={16}
                className="text-emerald-400"
              />
              <span className="text-sm font-semibold text-emerald-300">
                Bull
              </span>
            </div>

            <input
              min={0}
              max={100}
              step="0.5"
              type="number"
              value={bullReturn}
              onChange={(event) =>
                setBullReturn(
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        event.target.value
                      ) || 0
                    )
                  )
                )
              }
              className="mt-3 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
            />

            <p className="mt-2 text-xs text-zinc-600">
              % annual return
            </p>
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-red-500/15 bg-red-500/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-red-400">
            Bear outcome
          </p>

          <p className="mt-3 text-2xl font-bold text-white">
            {formatMinor(
              bearProjection.projectedNetWorthMinor
            )}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            {bearReturn}% annual return
          </p>
        </div>

        <div className="rounded-3xl border border-blue-500/20 bg-blue-500/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-blue-400">
            Base outcome
          </p>

          <p className="mt-3 text-2xl font-bold text-white">
            {formatMinor(
              baseProjection.projectedNetWorthMinor
            )}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            {baseReturn}% annual return
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-400">
            Bull outcome
          </p>

          <p className="mt-3 text-2xl font-bold text-white">
            {formatMinor(
              bullProjection.projectedNetWorthMinor
            )}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            {bullReturn}% annual return
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <WalletCards size={18} />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-zinc-600">
            Base ending cash
          </p>
          <p className="mt-2 text-xl font-bold text-white">
            {formatMinor(
              baseProjection.projectedCashMinor
            )}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <TrendingUp size={18} />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-zinc-600">
            Base investments
          </p>
          <p className="mt-2 text-xl font-bold text-white">
            {formatMinor(
              baseProjection.projectedInvestmentsMinor
            )}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Banknote size={18} />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-zinc-600">
            Base return growth
          </p>
          <p className="mt-2 text-xl font-bold text-emerald-400">
            {formatMinor(
              baseEstimatedGrowthMinor
            )}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
            Outcome spread
          </p>
          <p className="mt-3 text-xl font-bold text-white">
            {formatMinor(
              scenarioSpreadMinor
            )}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Difference between bear and bull.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
            Extra contributions
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {formatMinor(
              totalExtraInvestmentMinor
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.04] px-4 py-4">
          <p className="text-xs uppercase tracking-[0.12em] text-blue-400">
            Base net worth change
          </p>
          <p
            className={`mt-2 text-lg font-semibold ${
              baseNetWorthChangeMinor >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {formatMinor(
              baseNetWorthChangeMinor
            )}
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
              This plan runs cash below zero.
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-100/70">
              The lowest projected cash balance is{" "}
              {formatMinor(
                lowestCashMinor
              )}. Return assumptions do not fix a cash-flow shortfall.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Outcome range
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Three net-worth projections using your bear, base and bull
              assumptions. These are illustrations, not forecasts or guarantees.
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
                dataKey="bear"
                name="Bear"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="base"
                name="Base"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="bull"
                name="Bull"
                stroke="#10b981"
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
