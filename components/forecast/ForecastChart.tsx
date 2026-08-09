"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CashflowForecastPoint } from "@/lib/cashflow-forecast-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type ForecastChartProps = {
  points: readonly CashflowForecastPoint[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(
    new Date(`${value}T00:00:00Z`)
  );
}

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

function formatAxisCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function ForecastChart({
  points,
}: ForecastChartProps) {
  const data = points.map((point) => ({
    date: point.date,
    label: formatDate(point.date),
    balanceMinor: point.balanceMinor,
    balanceEuro:
      amountMinorToEuroAmount(
        point.balanceMinor
      ) ?? 0,
  }));

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Projected balance
        </h2>

        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Your expected liquid balance after each upcoming recurring transaction.
        </p>
      </div>

      {data.length < 2 ? (
        <div className="mt-8 flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
          <div>
            <p className="text-sm font-semibold text-white">
              No forecast events yet
            </p>

            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Add active recurring income or expenses within this period to build a forecast curve.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={data}
              margin={{
                top: 8,
                right: 8,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="forecastGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="rgb(37 99 235)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="rgb(37 99 235)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.06)"
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                minTickGap={24}
                tick={{
                  fill: "rgb(113 113 122)",
                  fontSize: 12,
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={formatAxisCurrency}
                tick={{
                  fill: "rgb(113 113 122)",
                  fontSize: 12,
                }}
              />

              <Tooltip
                cursor={{
                  stroke: "rgba(96,165,250,0.35)",
                  strokeWidth: 1,
                }}
                contentStyle={{
                  background: "rgb(9 9 11)",
                  border:
                    "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "14px",
                  boxShadow:
                    "0 18px 50px rgba(0,0,0,0.35)",
                }}
                labelStyle={{
                  color: "rgb(161 161 170)",
                  marginBottom: "6px",
                }}
                formatter={(
                  _value,
                  _name,
                  item
                ) => [
                  formatMinorCurrency(
                    item.payload.balanceMinor
                  ),
                  "Projected balance",
                ]}
              />

              <Area
                type="stepAfter"
                dataKey="balanceEuro"
                stroke="rgb(59 130 246)"
                strokeWidth={3}
                fill="url(#forecastGradient)"
                activeDot={{
                  r: 5,
                  fill: "rgb(59 130 246)",
                  stroke: "rgb(9 9 11)",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
