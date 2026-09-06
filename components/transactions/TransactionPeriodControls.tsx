"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

import {
  formatTransactionMonthLabel,
} from "@/lib/transaction-period";

type TransactionPeriodControlsProps = {
  selectedMonth: Date;
  isCurrentMonth: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCurrent: () => void;
};

export default function TransactionPeriodControls({
  selectedMonth,
  isCurrentMonth,
  canGoNext,
  onPrevious,
  onNext,
  onCurrent,
}: TransactionPeriodControlsProps) {
  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/80 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <CalendarDays
              size={14}
              className="text-blue-400"
            />
            Analysis period
          </div>

          <p className="mt-2 text-lg font-semibold text-white">
            {formatTransactionMonthLabel(
              selectedMonth
            )}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Summary, spending intelligence and the trend window follow this month.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPrevious}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 text-zinc-300 transition hover:border-white/20 hover:text-white"
            aria-label="Previous month"
          >
            <ChevronLeft
              size={17}
            />
          </button>

          <button
            type="button"
            onClick={onCurrent}
            disabled={
              isCurrentMonth
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-4 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white disabled:cursor-default disabled:opacity-40"
          >
            <RotateCcw
              size={14}
            />
            Current month
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={
              !canGoNext
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 text-zinc-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next month"
          >
            <ChevronRight
              size={17}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
