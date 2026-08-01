"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  getNextBudgetMonth,
  getPreviousBudgetMonth,
  parseBudgetMonth,
} from "@/lib/budget-month";
import type { BudgetMonth } from "@/lib/budget-types";

type BudgetMonthSelectorProps = {
  month: BudgetMonth;
  onChange: (month: BudgetMonth) => void;
};

const monthLabelFormatter = new Intl.DateTimeFormat(
  "en-GB",
  {
    month: "long",
    year: "numeric",
  }
);

function formatMonthLabel(month: BudgetMonth) {
  const parsedMonth = parseBudgetMonth(month);

  if (!parsedMonth) {
    return month;
  }

  return monthLabelFormatter.format(
    new Date(
      parsedMonth.year,
      parsedMonth.monthIndex,
      1
    )
  );
}

export default function BudgetMonthSelector({
  month,
  onChange,
}: BudgetMonthSelectorProps) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900 p-1.5">
      <button
        type="button"
        onClick={() =>
          onChange(getPreviousBudgetMonth(month))
        }
        aria-label="Show previous month"
        className="rounded-xl p-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="min-w-40 px-3 text-center">
        <p className="text-sm font-semibold text-white">
          {formatMonthLabel(month)}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(getNextBudgetMonth(month))
        }
        aria-label="Show next month"
        className="rounded-xl p-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}