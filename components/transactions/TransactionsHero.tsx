"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import {
  formatCurrency,
} from "@/lib/money";
import {
  minorUnitsToEuroAmount,
} from "@/lib/transaction-amount";
import type {
  TransactionWorkspaceSummary,
} from "@/lib/transaction-workspace";

type TransactionsHeroProps = {
  summary: TransactionWorkspaceSummary;
  isDemo: boolean;
  onAddTransaction: () => void;
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

export default function TransactionsHero({
  summary,
  isDemo,
  onAddTransaction,
}: TransactionsHeroProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-zinc-900 p-6 sm:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <ReceiptText size={17} />
            Transaction workspace
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your financial activity.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Add, edit, search and filter income and expenses from one place.
            The monthly summary updates automatically from your transaction history.
          </p>

          {isDemo && (
            <div className="mt-4 inline-flex rounded-full border border-amber-500/20 bg-amber-500/[0.07] px-3 py-1.5 text-xs font-semibold text-amber-300">
              Showing sample data
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={
            onAddTransaction
          }
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
        >
          <Plus size={17} />
          Add transaction
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <ArrowUpRight
              size={14}
              className="text-emerald-400"
            />
            Monthly income
          </div>

          <p className="mt-3 text-xl font-bold text-emerald-400">
            {formatMinor(
              summary.incomeMinor
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <ArrowDownRight
              size={14}
              className="text-red-400"
            />
            Monthly expenses
          </div>

          <p className="mt-3 text-xl font-bold text-red-400">
            {formatMinor(
              summary.expensesMinor
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <WalletCards
              size={14}
              className="text-blue-400"
            />
            Monthly surplus
          </div>

          <p
            className={`mt-3 text-xl font-bold ${
              summary.surplusMinor >= 0
                ? "text-blue-300"
                : "text-red-400"
            }`}
          >
            {formatMinor(
              summary.surplusMinor
            )}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            {summary.surplusRate ===
            null
              ? "No income recorded this month"
              : `${summary.surplusRate.toFixed(
                  1
                )}% of income`}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <ReceiptText
              size={14}
              className="text-violet-400"
            />
            Transactions
          </div>

          <p className="mt-3 text-xl font-bold text-white">
            {
              summary.currentMonthCount
            }
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            {summary.totalCount} total
          </p>
        </div>
      </div>
    </section>
  );
}
