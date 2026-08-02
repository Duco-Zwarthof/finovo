"use client";

import {
  useMemo,
  useState,
} from "react";

import { useHasHydrated } from "@/hooks/useHasHydrated";

import AccountFormModal from "@/components/accounts/AccountFormModal";
import AccountList from "@/components/accounts/AccountList";
import AccountTypeSummary from "@/components/accounts/AccountTypeSummary";
import AccountsHero from "@/components/accounts/AccountsHero";
import AssetAllocation from "@/components/accounts/AssetAllocation";
import Sidebar from "@/components/layout/Sidebar";

import {
  readStoredAccounts,
  writeStoredAccounts,
  type AccountStorageReadStatus,
} from "@/lib/account-storage";
import type { Account } from "@/lib/account-types";
import {
  addAccount,
  calculateNetWorthMinor,
  deleteAccount,
  updateAccount,
} from "@/lib/accounts";
import type { StorageWriteResult } from "@/lib/storage";

type AccountStorageHealth =
  | AccountStorageReadStatus
  | "write-failed";

function getStorageNotice(
  status: AccountStorageHealth
) {
  switch (status) {
    case "unavailable":
      return "Account storage is unavailable. Changes may be lost when you reload this page.";

    case "write-failed":
      return "Your account changes are visible for this session, but they could not be saved.";

    case "unsupported":
      return "Your saved account data uses an unsupported version and has not been changed.";

    case "invalid":
      return "Saved account data could not be read. The original value has not been overwritten.";

    default:
      return null;
  }
}

function getWriteHealth(
  result: StorageWriteResult
): AccountStorageHealth {
  if (result.status === "written") {
    return "valid";
  }

  if (result.status === "unavailable") {
    return "unavailable";
  }

  return "write-failed";
}

function AccountsSkeleton() {
  return (
    <div className="space-y-10">
      <div className="h-[28rem] animate-pulse rounded-[2rem] border border-white/10 bg-zinc-900 xl:h-80" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-3xl border border-white/10 bg-zinc-900"
          />
        ))}
      </div>

      <div className="h-80 animate-pulse rounded-3xl border border-white/10 bg-zinc-900" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-52 animate-pulse rounded-3xl border border-white/10 bg-zinc-900"
          />
        ))}
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const hasHydrated = useHasHydrated();

  const [initialResult] = useState(() =>
    readStoredAccounts([])
  );

  const [accounts, setAccounts] = useState<Account[]>(
    initialResult.value
  );

  const [storageHealth, setStorageHealth] =
    useState<AccountStorageHealth>(
      initialResult.status
    );

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingAccount, setEditingAccount] =
    useState<Account | null>(null);

  const netWorthMinor = useMemo(
    () => calculateNetWorthMinor(accounts),
    [accounts]
  );

  const includedAccountCount = accounts.filter(
    (account) => account.includedInNetWorth
  ).length;

  const storageNotice =
    getStorageNotice(storageHealth);

  function openAddForm() {
    setEditingAccount(null);
    setIsFormOpen(true);
  }

  function openEditForm(accountId: string) {
    const account = accounts.find(
      (candidate) => candidate.id === accountId
    );

    if (!account) {
      return;
    }

    setEditingAccount(account);
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingAccount(null);
    setIsFormOpen(false);
  }

  function persistAccounts(
    nextAccounts: Account[]
  ) {
    if (
      initialResult.status === "invalid" ||
      initialResult.status === "unsupported" ||
      initialResult.status === "unavailable"
    ) {
      return;
    }

    setStorageHealth(
      getWriteHealth(
        writeStoredAccounts(nextAccounts)
      )
    );
  }

  function handleSave(account: Account) {
    let nextAccounts: Account[];

    try {
      nextAccounts = editingAccount
        ? updateAccount(accounts, account)
        : addAccount(accounts, account);
    } catch {
      return;
    }

    setAccounts(nextAccounts);
    persistAccounts(nextAccounts);
    closeForm();
  }

  function handleDelete(accountId: string) {
    const nextAccounts = deleteAccount(
      accounts,
      accountId
    );

    setAccounts(nextAccounts);
    persistAccounts(nextAccounts);
    closeForm();
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        {!hasHydrated ? (
          <AccountsSkeleton />
        ) : (
          <>
            <AccountsHero
              netWorthMinor={netWorthMinor}
              totalAccounts={accounts.length}
              includedAccounts={
                includedAccountCount
              }
              onAddAccount={openAddForm}
            />

            {storageNotice && (
              <aside
                role="status"
                className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3"
              >
                <p className="text-sm font-semibold text-amber-200">
                  Account storage notice
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-100/75">
                  {storageNotice}
                </p>
              </aside>
            )}

            <div className="mt-10">
              <AccountTypeSummary
                accounts={accounts}
              />
            </div>

            <div className="mt-10">
              <AssetAllocation
                accounts={accounts}
              />
            </div>

            <section
              aria-labelledby="accounts-list-title"
              className="mt-10"
            >
              <div className="mb-4">
                <h2
                  id="accounts-list-title"
                  className="text-lg font-semibold"
                >
                  Your accounts
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Select an account to update its balance or settings.
                </p>
              </div>

              <AccountList
                accounts={accounts}
                onEditAccount={openEditForm}
              />
            </section>
          </>
        )}
      </section>

      {isFormOpen && (
        <AccountFormModal
          account={editingAccount ?? undefined}
          onClose={closeForm}
          onSave={handleSave}
          onDelete={
            editingAccount
              ? handleDelete
              : undefined
          }
        />
      )}
    </main>
  );
}
