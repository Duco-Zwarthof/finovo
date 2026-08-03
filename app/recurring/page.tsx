"use client";

import { useEffect, useState } from "react";

import { useHasHydrated } from "@/hooks/useHasHydrated";

import Sidebar from "@/components/layout/Sidebar";
import RecurringEmptyState from "@/components/recurring/RecurringEmptyState";
import RecurringFormModal from "@/components/recurring/RecurringFormModal";
import RecurringHero from "@/components/recurring/RecurringHero";
import RecurringList from "@/components/recurring/RecurringList";
import StorageNotice from "@/components/shared/StorageNotice";

import {
  readStoredRecurringTransactions,
  writeStoredRecurringTransactions,
  type RecurringTransactionStorageReadStatus,
} from "@/lib/recurring-transaction-storage";
import type { RecurringTransaction } from "@/lib/recurring-transaction-types";
import {
  addRecurringTransaction,
  deleteRecurringTransaction,
  updateRecurringTransaction,
} from "@/lib/recurring-transactions";
import {
  processDueRecurringTransactions,
} from "@/lib/recurring-processor";
import {
  readStoredTransactions,
  writeStoredTransactions,
  type StorageWriteResult,
} from "@/lib/storage";

type StorageHealth =
  | RecurringTransactionStorageReadStatus
  | "write-failed";

function getStorageMessage(
  status: StorageHealth
) {
  if (status === "unavailable") {
    return "Recurring transaction storage is unavailable. Changes may be lost after reloading.";
  }

  if (status === "write-failed") {
    return "Changes are visible for this session but could not be saved.";
  }

  if (
    status === "invalid" ||
    status === "unsupported"
  ) {
    return "Saved recurring transaction data could not be read safely.";
  }

  return null;
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWriteHealth(
  result: StorageWriteResult
): StorageHealth {
  if (result.status === "written") {
    return "valid";
  }

  if (result.status === "unavailable") {
    return "unavailable";
  }

  return "write-failed";
}

export default function RecurringPage() {
  const hasHydrated = useHasHydrated();

  const [initialResult] = useState(() =>
    readStoredRecurringTransactions([])
  );

  const [items, setItems] = useState<
    RecurringTransaction[]
  >(initialResult.value);

  const [storageHealth, setStorageHealth] =
    useState<StorageHealth>(
      initialResult.status
    );

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState<RecurringTransaction | null>(
      null
    );

  const [
    processorMessage,
    setProcessorMessage,
  ] = useState<string | null>(null);

  function synchronizeDueTransactions(
    recurringItems: readonly RecurringTransaction[]
  ): string | null {
    const transactionResult =
      readStoredTransactions([]);

    if (
      transactionResult.status === "invalid" ||
      transactionResult.status === "unavailable"
    ) {
      return "Due recurring transactions could not be synchronized because the normal transaction storage is unavailable or invalid.";
    }

    const processed =
      processDueRecurringTransactions(
        recurringItems,
        transactionResult.value,
        formatLocalDate(new Date())
      );

    if (
      processed.createdTransactions.length === 0
    ) {
      if (
        processed.skippedOccurrences.length > 0
      ) {
        return `${processed.skippedOccurrences.length} due occurrence${
          processed.skippedOccurrences.length === 1
            ? ""
            : "s"
        } could not be converted to normal transactions.`;
      }

      return null;
    }

    const writeResult =
      writeStoredTransactions(
        processed.transactions
      );

    if (writeResult.status === "written") {
      return `${processed.createdTransactions.length} due recurring transaction${
        processed.createdTransactions.length === 1
          ? ""
          : "s"
      } added to your transaction history.`;
    }

    return "Due recurring transactions were detected, but they could not be saved to the normal transaction history.";
  }

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const message =
      synchronizeDueTransactions(items);

    queueMicrotask(() => {
      setProcessorMessage(message);
    });
  }, [hasHydrated, items]);

  function persist(
    nextItems: RecurringTransaction[]
  ) {
    if (
      initialResult.status === "invalid" ||
      initialResult.status ===
        "unsupported" ||
      initialResult.status ===
        "unavailable"
    ) {
      return;
    }

    setStorageHealth(
      getWriteHealth(
        writeStoredRecurringTransactions(
          nextItems
        )
      )
    );
  }

  function handleSave(
    item: RecurringTransaction
  ) {
    let nextItems:
      RecurringTransaction[];

    try {
      nextItems = editingItem
        ? updateRecurringTransaction(
            items,
            item
          )
        : addRecurringTransaction(
            items,
            item
          );
    } catch {
      return;
    }

    setItems(nextItems);
    persist(nextItems);
    setProcessorMessage(
      synchronizeDueTransactions(nextItems)
    );
    setEditingItem(null);
    setIsFormOpen(false);
  }

  function handleDelete(itemId: string) {
    const nextItems =
      deleteRecurringTransaction(
        items,
        itemId
      );

    setItems(nextItems);
    persist(nextItems);
    setEditingItem(null);
    setIsFormOpen(false);
  }

  function openEdit(itemId: string) {
    const item = items.find(
      (candidate) =>
        candidate.id === itemId
    );

    if (!item) {
      return;
    }

    setEditingItem(item);
    setIsFormOpen(true);
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        {!hasHydrated ? (
          <div className="h-80 animate-pulse rounded-3xl bg-zinc-900" />
        ) : (
          <>
            <RecurringHero
              items={items}
              onAdd={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
            />

            <StorageNotice
              title="Recurring storage notice"
              message={getStorageMessage(
                storageHealth
              )}
            />

            {processorMessage && (
              <aside
                role="status"
                className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.07] px-4 py-3"
              >
                <p className="text-sm font-semibold text-blue-200">
                  Recurring transaction sync
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-100/75">
                  {processorMessage}
                </p>
              </aside>
            )}

            <section className="mt-10">
              {items.length === 0 ? (
                <RecurringEmptyState
                  onAdd={() => {
                    setEditingItem(null);
                    setIsFormOpen(true);
                  }}
                />
              ) : (
                <>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-white">
                      Recurring items
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Select an item to edit, pause or delete it.
                    </p>
                  </div>

                  <RecurringList
                    items={items}
                    onEdit={openEdit}
                  />
                </>
              )}
            </section>
          </>
        )}
      </section>

      {isFormOpen && (
        <RecurringFormModal
          item={editingItem ?? undefined}
          onClose={() => {
            setEditingItem(null);
            setIsFormOpen(false);
          }}
          onSave={handleSave}
          onDelete={
            editingItem
              ? handleDelete
              : undefined
          }
        />
      )}
    </main>
  );
}
