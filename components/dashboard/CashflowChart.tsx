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

const cashflowData = [
  { month: "Feb", income: 2750, expenses: 1840 },
  { month: "Mar", income: 2900, expenses: 2010 },
  { month: "Apr", income: 3100, expenses: 1930 },
  { month: "May", income: 3050, expenses: 2210 },
  { month: "Jun", income: 3200, expenses: 2070 },
  { month: "Jul", income: 3150, expenses: 1982 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CashflowChart() {
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
            tickFormatter={(value) => `£${value / 1000}k`}
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