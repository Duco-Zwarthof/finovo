"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useHasHydrated,
} from "@/hooks/useHasHydrated";

import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import Sidebar from "@/components/layout/Sidebar";
import StorageNotice from "@/components/shared/StorageNotice";
import TransactionCsvTools from "@/components/transactions/TransactionCsvTools";
import TransactionPeriodControls from "@/components/transactions/TransactionPeriodControls";
import TransactionsAnalytics from "@/components/transactions/TransactionsAnalytics";
import TransactionsHero from "@/components/transactions/TransactionsHero";
import TransactionsTrend from "@/components/transactions/TransactionsTrend";

import {
  canPersistTransactionMutation,
  createTransactionDataState,
  addTransactionToData,
  deleteTransactionFromData,
  getDisplayedTransactions,
  updateTransactionInData,
} from "@/lib/transaction-data";
import {
  mergeImportedTransactions,
} from "@/lib/transaction-csv";
import {
  calculateTransactionAnalytics,
} from "@/lib/transaction-analytics";
import {
  isSameTransactionMonth,
  isTransactionMonthAfter,
  normalizeTransactionMonth,
  shiftTransactionMonth,
} from "@/lib/transaction-period";
import {
  calculateTransactionTrends,
} from "@/lib/transaction-trends";
import {
  calculateTransactionWorkspaceSummary,
} from "@/lib/transaction-workspace";
import {
  readStoredTransactions,
  writeStoredTransactions,
  type StorageReadStatus,
  type StorageWriteResult,
} from "@/lib/storage";
import type {
  Transaction,
} from "@/lib/types";

type TransactionStorageHealth =
  | StorageReadStatus
  | "write-failed";

function getStorageMessage(
  status: TransactionStorageHealth
) {
  switch (status) {
    case "unavailable":
      return "Transaction storage is unavailable. Changes may be lost after reloading.";

    case "write-failed":
      return "Your changes are visible for this session, but they could not be saved.";

    case "invalid":
      return "Saved transaction data could not be read safely. The original stored value has not been overwritten.";

    case "recovered":
      return "Some saved transaction entries were invalid and were skipped while loading your history.";

    default:
      return null;
  }
}

function getWriteHealth(
  result: StorageWriteResult
): TransactionStorageHealth {
  if (
    result.status === "written" ||
    result.status === "removed"
  ) {
    return "valid";
  }

  if (
    result.status ===
    "unavailable"
  ) {
    return "unavailable";
  }

  return "write-failed";
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-[26rem] animate-pulse rounded-[2rem] border border-white/10 bg-zinc-900" />

      <div className="h-[42rem] animate-pulse rounded-3xl border border-white/10 bg-zinc-900" />
    </div>
  );
}

export default function TransactionsPage() {
  const hasHydrated =
    useHasHydrated();

  const [initialResult] =
    useState(() =>
      readStoredTransactions([])
    );

  const [
    transactionData,
    setTransactionData,
  ] = useState(() =>
    createTransactionDataState(
      initialResult
    )
  );

  const [
    storageHealth,
    setStorageHealth,
  ] =
    useState<TransactionStorageHealth>(
      initialResult.status
    );

  const [
    editingTransaction,
    setEditingTransaction,
  ] =
    useState<Transaction | null>(
      null
    );

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false);

  const transactions =
    getDisplayedTransactions(
      transactionData
    );

  const [currentMonth] =
    useState(() =>
      normalizeTransactionMonth(
        new Date()
      )
    );

  const [
    referenceDate,
    setReferenceDate,
  ] = useState(() =>
    normalizeTransactionMonth(
      new Date()
    )
  );

  const summary = useMemo(
    () =>
      calculateTransactionWorkspaceSummary(
        transactions,
        referenceDate
      ),
    [
      transactions,
      referenceDate,
    ]
  );

  const analytics = useMemo(
    () =>
      calculateTransactionAnalytics(
        transactions,
        referenceDate
      ),
    [
      transactions,
      referenceDate,
    ]
  );

  const trends = useMemo(
    () =>
      calculateTransactionTrends(
        transactions,
        referenceDate
      ),
    [
      transactions,
      referenceDate,
    ]
  );

  const isCurrentMonth =
    isSameTransactionMonth(
      referenceDate,
      currentMonth
    );

  const canGoNext =
    !isCurrentMonth &&
    !isTransactionMonthAfter(
      shiftTransactionMonth(
        referenceDate,
        1
      ),
      currentMonth
    );

  function showPreviousMonth() {
    setReferenceDate(
      (current) =>
        shiftTransactionMonth(
          current,
          -1
        )
    );
  }

  function showNextMonth() {
    setReferenceDate(
      (current) => {
        const next =
          shiftTransactionMonth(
            current,
            1
          );

        return isTransactionMonthAfter(
          next,
          currentMonth
        )
          ? current
          : next;
      }
    );
  }

  function showCurrentMonth() {
    setReferenceDate(
      currentMonth
    );
  }

  const isDemo =
    transactionData.source ===
    "demo";

  function persist(
    nextData: Extract<
      typeof transactionData,
      { source: "user" }
    >
  ) {
    if (
      !canPersistTransactionMutation(
        initialResult.status
      )
    ) {
      return;
    }

    setStorageHealth(
      getWriteHealth(
        writeStoredTransactions(
          nextData.transactions
        )
      )
    );
  }

  function openAddForm() {
    setEditingTransaction(null);
    setIsFormOpen(true);
  }

  function openEditForm(
    transaction: Transaction
  ) {
    setEditingTransaction(
      transaction
    );
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingTransaction(null);
    setIsFormOpen(false);
  }

  function handleSave(
    transaction: Transaction
  ) {
    let nextData: Extract<
      typeof transactionData,
      { source: "user" }
    >;

    if (editingTransaction) {
      const savedTransaction =
        isDemo
          ? {
              ...transaction,
              id: crypto.randomUUID(),
            }
          : transaction;

      nextData =
        updateTransactionInData(
          transactionData,
          savedTransaction
        );
    } else {
      nextData =
        addTransactionToData(
          transactionData,
          transaction
        );
    }

    setTransactionData(
      nextData
    );
    persist(nextData);
    closeForm();
  }

  function handleDelete(
    id: string
  ) {
    const nextData =
      deleteTransactionFromData(
        transactionData,
        id
      );

    setTransactionData(nextData);
    persist(nextData);

    if (
      editingTransaction?.id === id
    ) {
      closeForm();
    }
  }

  function handleCsvImport(
    importedTransactions: Transaction[]
  ) {
    const existingTransactions =
      transactionData.source ===
      "user"
        ? transactionData.transactions
        : [];

    const mergeResult =
      mergeImportedTransactions(
        existingTransactions,
        importedTransactions
      );

    const nextData = {
      source: "user" as const,
      transactions:
        mergeResult.transactions,
    };

    setTransactionData(
      nextData
    );
    persist(nextData);

    return {
      addedCount:
        mergeResult.addedCount,
      duplicateCount:
        mergeResult.duplicateCount,
    };
  }

  const exportableTransactions =
    transactionData.source ===
    "user"
      ? transactionData.transactions
      : [];

  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        {!hasHydrated ? (
          <TransactionsSkeleton />
        ) : (
          <>
            <TransactionsHero
              summary={summary}
              isDemo={isDemo}
              onAddTransaction={
                openAddForm
              }
            />

            <StorageNotice
              title="Transaction storage notice"
              message={getStorageMessage(
                storageHealth
              )}
            />

            <TransactionPeriodControls
              selectedMonth={
                referenceDate
              }
              isCurrentMonth={
                isCurrentMonth
              }
              canGoNext={
                canGoNext
              }
              onPrevious={
                showPreviousMonth
              }
              onNext={
                showNextMonth
              }
              onCurrent={
                showCurrentMonth
              }
            />

            <TransactionCsvTools
              transactions={
                exportableTransactions
              }
              onImport={
                handleCsvImport
              }
            />

            <TransactionsAnalytics
              analytics={analytics}
            />

            <TransactionsTrend
              trends={trends}
            />

            <div className="mt-8 min-h-[48rem]">
              <RecentTransactions
                transactions={
                  transactions
                }
                isDemo={isDemo}
                onEditTransaction={
                  openEditForm
                }
                onDeleteTransaction={
                  handleDelete
                }
              />
            </div>
          </>
        )}
      </section>

      {isFormOpen && (
        <AddTransactionModal
          transaction={
            editingTransaction ??
            undefined
          }
          isDemoTransaction={
            Boolean(
              editingTransaction &&
                isDemo
            )
          }
          onClose={closeForm}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
