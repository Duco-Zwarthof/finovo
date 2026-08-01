"use client";

import {
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import BudgetCategoryList from "@/components/budget/BudgetCategoryList";
import BudgetHeader from "@/components/budget/BudgetHeader";
import BudgetSummary from "@/components/budget/BudgetSummary";
import Sidebar from "@/components/layout/Sidebar";

import {
  calculateBudgetProgress,
  calculateMonthlyBudgetSummary,
} from "@/lib/budget";
import { formatBudgetMonth } from "@/lib/budget-month";
import { readStoredBudgets } from "@/lib/budget-storage";
import type {
  Budget,
  BudgetMonth,
  BudgetProgress,
} from "@/lib/budget-types";
import { readStoredTransactions } from "@/lib/storage";
import {
  createTransactionDataState,
  getDisplayedTransactions,
} from "@/lib/transaction-data";

function getBudgetStorageNotice(
  status: ReturnType<typeof readStoredBudgets>["status"]
) {
  switch (status) {
    case "unavailable":
      return "Budget storage is unavailable. Saved budgets may not be available in this browser.";

    case "unsupported":
      return "Your saved budget data uses an unsupported version and has not been changed.";

    case "invalid":
      return "Saved budget data could not be read. The original stored value has not been overwritten.";

    case "recovered":
      return "Some invalid saved budgets were ignored while valid budgets were recovered.";

    default:
      return null;
  }
}

function getTransactionStorageNotice(
  status: ReturnType<typeof readStoredTransactions>["status"]
) {
  switch (status) {
    case "unavailable":
      return "Transaction storage is unavailable. Spending comparisons may be incomplete.";

    case "invalid":
      return "Saved transaction data could not be read. The original stored value has not been overwritten.";

    case "recovered":
      return "Some invalid saved transactions were ignored while valid transactions were recovered.";

    default:
      return null;
  }
}

function subscribeToHydration() {
  return () => {};
}

function useHasHydrated() {
  return useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );
}

function BudgetPageSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mt-8 space-y-10"
    >
      <section>
        <div className="mb-4 space-y-2">
          <div className="h-5 w-40 animate-pulse rounded-lg bg-zinc-900" />
          <div className="h-4 w-72 animate-pulse rounded-lg bg-zinc-900" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-3xl border border-white/10 bg-zinc-900"
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 space-y-2">
          <div className="h-5 w-40 animate-pulse rounded-lg bg-zinc-900" />
          <div className="h-4 w-80 animate-pulse rounded-lg bg-zinc-900" />
        </div>

        <div className="h-72 animate-pulse rounded-3xl border border-white/10 bg-zinc-900" />
      </section>
    </div>
  );
}

export default function BudgetPage() {
  const hasHydrated = useHasHydrated();

  const [initialBudgetResult] = useState(() =>
    readStoredBudgets([])
  );

  const [budgets] = useState<Budget[]>(
    initialBudgetResult.value
  );

  const [initialTransactionResult] = useState(() =>
    readStoredTransactions([])
  );

  const [transactionData] = useState(() =>
    createTransactionDataState(initialTransactionResult)
  );

  const [selectedMonth, setSelectedMonth] =
    useState<BudgetMonth>(() =>
      formatBudgetMonth(new Date())
    );

  const transactions =
    getDisplayedTransactions(transactionData);

  const monthlyBudgets = useMemo(
    () =>
      budgets.filter(
        (budget) => budget.month === selectedMonth
      ),
    [budgets, selectedMonth]
  );

  const progress = useMemo<BudgetProgress[]>(
    () =>
      monthlyBudgets.map((budget) =>
        calculateBudgetProgress(
          budget,
          transactions
        )
      ),
    [monthlyBudgets, transactions]
  );

  const summary = useMemo(
    () =>
      calculateMonthlyBudgetSummary(
        budgets,
        transactions,
        selectedMonth
      ),
    [budgets, transactions, selectedMonth]
  );

  const budgetStorageNotice =
    getBudgetStorageNotice(initialBudgetResult.status);

  const transactionStorageNotice =
    getTransactionStorageNotice(
      initialTransactionResult.status
    );

  function handleAddBudget() {
    // Budget CRUD wordt in de volgende stap toegevoegd.
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        <BudgetHeader
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onAddBudget={handleAddBudget}
        />

        {!hasHydrated ? (
          <BudgetPageSkeleton />
        ) : (
          <>
            {transactionData.source === "demo" && (
              <aside className="mt-8 rounded-2xl border border-blue-500/25 bg-blue-500/[0.08] px-4 py-3">
                <p className="text-sm font-semibold text-blue-200">
                  Demo transactions
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-100/80">
                  Spending comparisons currently use example
                  transactions. No sample budgets are created or
                  saved.
                </p>
              </aside>
            )}

            {budgetStorageNotice && (
              <aside className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3">
                <p className="text-sm font-semibold text-amber-200">
                  Budget storage notice
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-100/75">
                  {budgetStorageNotice}
                </p>
              </aside>
            )}

            {transactionStorageNotice && (
              <aside className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3">
                <p className="text-sm font-semibold text-amber-200">
                  Transaction storage notice
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-100/75">
                  {transactionStorageNotice}
                </p>
              </aside>
            )}

            <div className="mt-8">
              <BudgetSummary summary={summary} />
            </div>

            <section
              aria-labelledby="category-budgets-title"
              className="mt-10"
            >
              <div className="mb-4">
                <h2
                  id="category-budgets-title"
                  className="text-lg font-semibold text-white"
                >
                  Category budgets
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Monitor each spending category against its monthly
                  limit.
                </p>
              </div>

              <BudgetCategoryList
                progress={progress}
                hasTransactions={transactions.length > 0}
              />
            </section>
          </>
        )}
      </section>
    </main>
  );
}