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
import AccountTransferPanel from "@/components/transactions/AccountTransferPanel";
import TransactionCsvTools from "@/components/transactions/TransactionCsvTools";
import TransactionPeriodControls from "@/components/transactions/TransactionPeriodControls";
import TransactionsAnalytics from "@/components/transactions/TransactionsAnalytics";
import TransactionsHero from "@/components/transactions/TransactionsHero";
import TransactionsTrend from "@/components/transactions/TransactionsTrend";

import {
  readStoredAccounts,
  writeStoredAccounts,
} from "@/lib/account-storage";
import type {
  Account,
} from "@/lib/account-types";
import {
  readStoredAccountTransfers,
  writeStoredAccountTransfers,
} from "@/lib/account-transfer-storage";
import {
  applyAccountTransfer,
  reverseAccountTransfer,
  type AccountTransfer,
} from "@/lib/account-transfers";
import {
  applyTransactionBalanceMutation,
} from "@/lib/transaction-balance-impact";
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
    initialAccountResult,
  ] = useState(() =>
    readStoredAccounts([])
  );

  const [
    accounts,
    setAccounts,
  ] = useState<Account[]>(
    initialAccountResult.value
  );

  const [
    initialTransferResult,
  ] = useState(() =>
    readStoredAccountTransfers(
      []
    )
  );

  const [
    transfers,
    setTransfers,
  ] = useState<
    AccountTransfer[]
  >(
    initialTransferResult.value
  );

  const [
    accountActivityNotice,
    setAccountActivityNotice,
  ] = useState<
    string | null
  >(() => {
    if (
      initialAccountResult.status ===
        "invalid" ||
      initialAccountResult.status ===
        "unsupported"
    ) {
      return "Saved account data could not be used safely, so balance-changing actions are disabled on this page.";
    }

    if (
      initialAccountResult.status ===
      "unavailable"
    ) {
      return "Account storage is unavailable, so balance-changing actions cannot be saved.";
    }

    if (
      initialTransferResult.status ===
        "invalid" ||
      initialTransferResult.status ===
        "unsupported"
    ) {
      return "Saved transfer data could not be used safely, so new account transfers are disabled.";
    }

    if (
      initialTransferResult.status ===
      "unavailable"
    ) {
      return "Transfer storage is unavailable, so account transfers cannot be saved.";
    }

    return null;
  });

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

  function canWriteAccountStorage() {
    return (
      initialAccountResult.status ===
        "missing" ||
      initialAccountResult.status ===
        "valid"
    );
  }

  function canWriteTransferStorage() {
    return (
      initialTransferResult.status ===
        "missing" ||
      initialTransferResult.status ===
        "valid"
    );
  }

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
      return false;
    }

    const result =
      writeStoredTransactions(
        nextData.transactions
      );

    setStorageHealth(
      getWriteHealth(
        result
      )
    );

    return (
      result.status ===
        "written" ||
      result.status ===
        "removed"
    );
  }

  function commitTransactionWithBalances(
    nextData: Extract<
      typeof transactionData,
      { source: "user" }
    >,
    nextAccounts: Account[]
  ) {
    if (
      !canPersistTransactionMutation(
        initialResult.status
      ) ||
      !canWriteAccountStorage()
    ) {
      return false;
    }

    const accountWrite =
      writeStoredAccounts(
        nextAccounts
      );

    if (
      accountWrite.status !==
      "written"
    ) {
      setAccountActivityNotice(
        "Finovo could not save the account balance change, so the transaction was not changed."
      );
      return false;
    }

    const transactionWrite =
      writeStoredTransactions(
        nextData.transactions
      );

    setStorageHealth(
      getWriteHealth(
        transactionWrite
      )
    );

    if (
      transactionWrite.status !==
        "written" &&
      transactionWrite.status !==
        "removed"
    ) {
      writeStoredAccounts(
        accounts
      );

      setAccountActivityNotice(
        "Finovo could not save the transaction. The account balance change was rolled back."
      );

      return false;
    }

    setAccounts(
      nextAccounts
    );
    setTransactionData(
      nextData
    );
    setAccountActivityNotice(
      null
    );

    return true;
  }

  function getBalanceImpactError(
    status:
      | "missing-account"
      | "negative-balance"
      | "overflow"
  ): string {
    switch (status) {
      case "missing-account":
        return "The linked account no longer exists.";

      case "negative-balance":
        return "This change would make the selected account balance negative. Update the account balance first or save this transaction as history only.";

      case "overflow":
        return "This balance change is too large to store safely.";

      default:
        return "The account balance could not be updated safely.";
    }
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
    const savedTransaction =
      editingTransaction &&
      isDemo
        ? {
            ...transaction,
            id:
              crypto.randomUUID(),
          }
        : transaction;

    const previousTransaction =
      editingTransaction &&
      !isDemo
        ? editingTransaction
        : null;

    const balanceResult =
      applyTransactionBalanceMutation(
        accounts,
        previousTransaction,
        savedTransaction
      );

    if (
      balanceResult.status ===
        "missing-account" ||
      balanceResult.status ===
        "negative-balance" ||
      balanceResult.status ===
        "overflow"
    ) {
      return {
        ok: false as const,
        error:
          getBalanceImpactError(
            balanceResult.status
          ),
      };
    }

    let nextData: Extract<
      typeof transactionData,
      { source: "user" }
    >;

    if (
      editingTransaction
    ) {
      nextData =
        updateTransactionInData(
          transactionData,
          savedTransaction
        );
    } else {
      nextData =
        addTransactionToData(
          transactionData,
          savedTransaction
        );
    }

    if (
      balanceResult.status ===
      "applied"
    ) {
      if (
        !commitTransactionWithBalances(
          nextData,
          balanceResult.accounts
        )
      ) {
        return {
          ok: false as const,
          error:
            "Finovo could not safely save both the transaction and account balance. Nothing was changed.",
        };
      }
    } else {
      setTransactionData(
        nextData
      );
      persist(nextData);
      setAccountActivityNotice(
        null
      );
    }

    closeForm();

    return {
      ok: true as const,
    };
  }

  function handleDelete(
    id: string
  ) {
    const deletedTransaction =
      transactionData.source ===
      "user"
        ? transactionData.transactions.find(
            (transaction) =>
              transaction.id ===
              id
          ) ?? null
        : null;

    const nextData =
      deleteTransactionFromData(
        transactionData,
        id
      );

    const balanceResult =
      applyTransactionBalanceMutation(
        accounts,
        deletedTransaction,
        null
      );

    if (
      balanceResult.status ===
        "missing-account" ||
      balanceResult.status ===
        "negative-balance" ||
      balanceResult.status ===
        "overflow"
    ) {
      setAccountActivityNotice(
        `The transaction was not deleted. ${getBalanceImpactError(
          balanceResult.status
        )}`
      );
      return;
    }

    if (
      balanceResult.status ===
      "applied"
    ) {
      if (
        !commitTransactionWithBalances(
          nextData,
          balanceResult.accounts
        )
      ) {
        return;
      }
    } else {
      setTransactionData(
        nextData
      );
      persist(nextData);
    }

    setAccountActivityNotice(
      null
    );

    if (
      editingTransaction?.id === id
    ) {
      closeForm();
    }
  }

  function getTransferError(
    status:
      | "invalid"
      | "missing-account"
      | "same-account"
      | "insufficient-funds"
      | "overflow"
  ): string {
    switch (status) {
      case "invalid":
        return "The transfer details are invalid.";

      case "missing-account":
        return "One of the selected accounts no longer exists.";

      case "same-account":
        return "Choose two different accounts.";

      case "insufficient-funds":
        return "The source account does not have enough balance for this transfer.";

      case "overflow":
        return "This transfer is too large to store safely.";

      default:
        return "The transfer could not be applied safely.";
    }
  }

  function commitTransferChange(
    nextTransfers:
      AccountTransfer[],
    nextAccounts: Account[]
  ) {
    if (
      !canWriteAccountStorage() ||
      !canWriteTransferStorage()
    ) {
      return false;
    }

    const accountWrite =
      writeStoredAccounts(
        nextAccounts
      );

    if (
      accountWrite.status !==
      "written"
    ) {
      return false;
    }

    const transferWrite =
      writeStoredAccountTransfers(
        nextTransfers
      );

    if (
      transferWrite.status !==
        "written" &&
      transferWrite.status !==
        "removed"
    ) {
      writeStoredAccounts(
        accounts
      );
      return false;
    }

    setAccounts(
      nextAccounts
    );
    setTransfers(
      nextTransfers
    );
    setAccountActivityNotice(
      null
    );

    return true;
  }

  function handleCreateTransfer(
    transfer: AccountTransfer
  ) {
    const result =
      applyAccountTransfer(
        accounts,
        transfer
      );

    if (
      result.status !==
      "applied"
    ) {
      return {
        ok: false as const,
        error:
          getTransferError(
            result.status
          ),
      };
    }

    const nextTransfers = [
      transfer,
      ...transfers,
    ];

    if (
      !commitTransferChange(
        nextTransfers,
        result.accounts
      )
    ) {
      return {
        ok: false as const,
        error:
          "Finovo could not safely save the transfer and both account balances. Nothing was changed.",
      };
    }

    return {
      ok: true as const,
    };
  }

  function handleDeleteTransfer(
    transferId: string
  ) {
    const transfer =
      transfers.find(
        (candidate) =>
          candidate.id ===
          transferId
      );

    if (!transfer) {
      return {
        ok: false as const,
        error:
          "This transfer could not be found.",
      };
    }

    const result =
      reverseAccountTransfer(
        accounts,
        transfer
      );

    if (
      result.status !==
      "applied"
    ) {
      return {
        ok: false as const,
        error:
          getTransferError(
            result.status
          ),
      };
    }

    const nextTransfers =
      transfers.filter(
        (candidate) =>
          candidate.id !==
          transferId
      );

    if (
      !commitTransferChange(
        nextTransfers,
        result.accounts
      )
    ) {
      return {
        ok: false as const,
        error:
          "Finovo could not safely reverse and delete this transfer. Nothing was changed.",
      };
    }

    return {
      ok: true as const,
    };
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

            <StorageNotice
              title="Account activity notice"
              message={
                accountActivityNotice
              }
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
              accounts={accounts}
              onImport={
                handleCsvImport
              }
            />

            <AccountTransferPanel
              accounts={accounts}
              transfers={
                transfers
              }
              onCreate={
                handleCreateTransfer
              }
              onDelete={
                handleDeleteTransfer
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
                accounts={accounts}
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
          accounts={accounts}
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
