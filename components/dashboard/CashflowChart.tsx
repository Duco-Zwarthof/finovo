"use client";

import { useMemo, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/finance";

type CashflowChartProps = {
  transactions: Transaction[];
};

type ViewMode = "monthly" | "quarterly";

type PeriodDataPoint = {
  period: string;
  fullPeriod: string;
  income: number;
  expenses: number;
};

type TooltipPayloadItem = {
  name: string;
  value: number;
  color: string;
};

type CustomTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
};

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
});

const fullMonthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});

function parseTransactionDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function createMonthlyCashflowData(
  transactions: Transaction[],
  monthCount: number
): PeriodDataPoint[] {
  const now = new Date();

  const months = Array.from(
    { length: monthCount },
    (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - monthCount + 1 + index,
        1
      );

      return {
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        period: monthFormatter.format(date),
        fullPeriod: fullMonthFormatter.format(date),
        income: 0,
        expenses: 0,
      };
    }
  );

  transactions.forEach((transaction) => {
    const transactionDate = parseTransactionDate(
      transaction.date
    );

    const matchingMonth = months.find(
      (month) =>
        month.year === transactionDate.getFullYear() &&
        month.monthIndex === transactionDate.getMonth()
    );

    if (!matchingMonth) {
      return;
    }

    if (transaction.type === "income") {
      matchingMonth.income += transaction.amount;
    } else {
      matchingMonth.expenses += transaction.amount;
    }
  });

  return months.map((month) => ({
    period: month.period,
    fullPeriod: month.fullPeriod,
    income: month.income,
    expenses: month.expenses,
  }));
}

function createQuarterlyCashflowData(
  transactions: Transaction[],
  selectedYear: number
): PeriodDataPoint[] {
  const quarters = [
    {
      quarter: 1,
      period: "Q1",
      fullPeriod: `Quarter 1, ${selectedYear}`,
      income: 0,
      expenses: 0,
    },
    {
      quarter: 2,
      period: "Q2",
      fullPeriod: `Quarter 2, ${selectedYear}`,
      income: 0,
      expenses: 0,
    },
    {
      quarter: 3,
      period: "Q3",
      fullPeriod: `Quarter 3, ${selectedYear}`,
      income: 0,
      expenses: 0,
    },
    {
      quarter: 4,
      period: "Q4",
      fullPeriod: `Quarter 4, ${selectedYear}`,
      income: 0,
      expenses: 0,
    },
  ];

  transactions.forEach((transaction) => {
    const transactionDate = parseTransactionDate(
      transaction.date
    );

    if (transactionDate.getFullYear() !== selectedYear) {
      return;
    }

    const quarterNumber =
      Math.floor(transactionDate.getMonth() / 3) + 1;

    const matchingQuarter = quarters.find(
      (quarter) => quarter.quarter === quarterNumber
    );

    if (!matchingQuarter) {
      return;
    }

    if (transaction.type === "income") {
      matchingQuarter.income += transaction.amount;
    } else {
      matchingQuarter.expenses += transaction.amount;
    }
  });

  return quarters.map((quarter) => ({
    period: quarter.period,
    fullPeriod: quarter.fullPeriod,
    income: quarter.income,
    expenses: quarter.expenses,
  }));
}

function getAvailableYears(
  transactions: Transaction[]
): number[] {
  const transactionYears = transactions.map(
    (transaction) =>
      parseTransactionDate(transaction.date).getFullYear()
  );

  const currentYear = new Date().getFullYear();

  return Array.from(
    new Set([...transactionYears, currentYear])
  ).sort((a, b) => b - a);
}

function formatAxisValue(value: number) {
  if (value >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(1)}m`;
  }

  if (value >= 1000) {
    const thousands = value / 1000;

    return `£${
      Number.isInteger(thousands)
        ? thousands
        : thousands.toFixed(1)
    }k`;
  }

  return `£${value}`;
}

function CustomTooltip({
  active,
  label,
  payload,
}: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="min-w-48 rounded-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl">
      <p className="mb-3 text-sm font-semibold text-white">
        {label}
      </p>

      <div className="space-y-3">
        {payload.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-6"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />

              <span className="text-sm text-zinc-400">
                {item.name}
              </span>
            </div>

            <span className="text-sm font-semibold text-white">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CashflowChart({
  transactions,
}: CashflowChartProps) {
  const currentYear = new Date().getFullYear();

  const [viewMode, setViewMode] =
    useState<ViewMode>("monthly");

  const [monthCount, setMonthCount] = useState(6);

  const [selectedYear, setSelectedYear] =
    useState(currentYear);

  const availableYears = useMemo(
    () => getAvailableYears(transactions),
    [transactions]
  );

  const cashflowData =
    viewMode === "monthly"
      ? createMonthlyCashflowData(
          transactions,
          monthCount
        )
      : createQuarterlyCashflowData(
          transactions,
          selectedYear
        );

  const hasCashflowData = cashflowData.some(
    (period) =>
      period.income > 0 || period.expenses > 0
  );

  const compactChart =
    viewMode === "monthly" && monthCount >= 9;

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

            <span className="text-sm text-zinc-400">
              Income
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />

            <span className="text-sm text-zinc-400">
              Expenses
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-zinc-700 bg-zinc-800 p-1">
            <button
              type="button"
              onClick={() => setViewMode("monthly")}
              className={`rounded-lg px-3 py-1 text-sm transition ${
                viewMode === "monthly"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setViewMode("quarterly")}
              className={`rounded-lg px-3 py-1 text-sm transition ${
                viewMode === "quarterly"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Quarterly
            </button>
          </div>

          {viewMode === "monthly" ? (
            <label>
              <span className="sr-only">
                Number of months
              </span>

              <select
                value={monthCount}
                onChange={(event) =>
                  setMonthCount(
                    Number(event.target.value)
                  )
                }
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 outline-none transition hover:border-zinc-600 focus:border-blue-500"
              >
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={9}>9 months</option>
                <option value={12}>12 months</option>
              </select>
            </label>
          ) : (
            <label>
              <span className="sr-only">
                Select year
              </span>

              <select
                value={selectedYear}
                onChange={(event) =>
                  setSelectedYear(
                    Number(event.target.value)
                  )
                }
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 outline-none transition hover:border-zinc-600 focus:border-blue-500"
              >
                {availableYears.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      {!hasCashflowData ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 text-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10">
            <span className="text-xl">📊</span>
          </div>

          <p className="mt-4 font-semibold text-white">
            No cash flow data
          </p>

          <p className="mt-1 max-w-xs text-sm leading-6 text-zinc-500">
            There are no income or expense transactions
            for this selected period.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart
              data={cashflowData}
              barGap={compactChart ? 3 : 8}
              barCategoryGap={
                compactChart ? "18%" : "28%"
              }
              margin={{
                top: 8,
                right: 8,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="incomeGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#3b82f6"
                  />

                  <stop
                    offset="100%"
                    stopColor="#1d4ed8"
                  />
                </linearGradient>

                <linearGradient
                  id="expenseGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#71717a"
                  />

                  <stop
                    offset="100%"
                    stopColor="#3f3f46"
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 6"
                vertical={false}
                stroke="rgba(255,255,255,0.06)"
              />

              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                interval={
                  viewMode === "monthly" &&
                  monthCount === 12
                    ? 1
                    : 0
                }
                tick={{
                  fill: "#71717a",
                  fontSize: 12,
                }}
                dy={8}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#71717a",
                  fontSize: 12,
                }}
                tickFormatter={formatAxisValue}
                width={56}
              />

              <Tooltip
                cursor={{
                  fill: "rgba(255,255,255,0.025)",
                  radius: 12,
                }}
                labelFormatter={(
                  label,
                  payload
                ) =>
                  payload?.[0]?.payload
                    ?.fullPeriod ?? label
                }
                content={<CustomTooltip />}
              />

              <Bar
                dataKey="income"
                name="Income"
                fill="url(#incomeGradient)"
                radius={[8, 8, 3, 3]}
                maxBarSize={
                  compactChart ? 26 : 42
                }
              />

              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="url(#expenseGradient)"
                radius={[8, 8, 3, 3]}
                maxBarSize={
                  compactChart ? 26 : 42
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}