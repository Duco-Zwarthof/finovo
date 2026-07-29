"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

type CashflowDataPoint = {
  month: string;
  income: number;
  expenses: number;
};

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
});

function createCashflowData(
  transactions: Transaction[]
): CashflowDataPoint[] {
  const now = new Date();

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - 5 + index,
      1
    );

    return {
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      label: monthFormatter.format(date),
      income: 0,
      expenses: 0,
    };
  });

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);

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
    month: month.label,
    income: month.income,
    expenses: month.expenses,
  }));
}

export default function CashflowChart({
  transactions,
}: CashflowChartProps) {
  const cashflowData = createCashflowData(transactions);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={cashflowData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="rgba(255,255,255,0.08)"
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickFormatter={(value) => {
              const amount = Number(value);

              if (amount >= 1000) {
                return `£${amount / 1000}k`;
              }

              return `£${amount}`;
            }}
          />

          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "#18181b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            }}
            labelStyle={{ color: "#ffffff" }}
            formatter={(value) => [
              formatCurrency(Number(value)),
              undefined,
            ]}
          />

          <Legend
            iconType="circle"
            wrapperStyle={{
              fontSize: "12px",
              color: "#a1a1aa",
              paddingTop: "12px",
            }}
          />

          <Bar
            dataKey="income"
            name="Income"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
          />

          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="#52525b"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}