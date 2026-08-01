"use client";

import { Plus, WalletCards } from "lucide-react";

import BudgetMonthSelector from "./BudgetMonthSelector";

import type { BudgetMonth } from "@/lib/budget-types";

type BudgetHeaderProps = {
  selectedMonth: BudgetMonth;
  onMonthChange: (month: BudgetMonth) => void;
  onAddBudget: () => void;
};

export default function BudgetHeader({
  selectedMonth,
  onMonthChange,
  onAddBudget,
}: BudgetHeaderProps) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-blue-400">
          <WalletCards size={17} />

          <span>Budget planning</span>
        </div>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Budget
        </h1>

        <p className="mt-3 max-w-2xl text-zinc-400">
          Set monthly spending limits, monitor your
          progress and see how much remains available.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <BudgetMonthSelector
          month={selectedMonth}
          onChange={onMonthChange}
        />

        <button
          type="button"
          onClick={onAddBudget}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          <Plus size={17} />

          Add budget
        </button>
      </div>
    </header>
  );
}