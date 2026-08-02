"use client";

import {
  useMemo,
  useState,
} from "react";

import { useHasHydrated } from "@/hooks/useHasHydrated";

import HoldingFormModal from "@/components/investments/HoldingFormModal";
import HoldingList from "@/components/investments/HoldingList";
import InvestmentEmptyState from "@/components/investments/InvestmentEmptyState";
import InvestmentsHero from "@/components/investments/InvestmentsHero";
import Sidebar from "@/components/layout/Sidebar";

import {
  readStoredInvestments,
  writeStoredInvestments,
  type InvestmentStorageReadStatus,
} from "@/lib/investment-storage";
import type { InvestmentHolding } from "@/lib/investment-types";
import {
  addInvestmentHolding,
  calculatePortfolioCostMinor,
  calculatePortfolioGainMinor,
  calculatePortfolioGainPercentage,
  calculatePortfolioValueMinor,
  deleteInvestmentHolding,
  updateInvestmentHolding,
} from "@/lib/investments";
import type { StorageWriteResult } from "@/lib/storage";

type InvestmentStorageHealth =
  | InvestmentStorageReadStatus
  | "write-failed";

function getStorageNotice(
  status: InvestmentStorageHealth
) {
  switch (status) {
    case "unavailable":
      return "Investment storage is unavailable. Changes may be lost when you reload this page.";

    case "write-failed":
      return "Your investment changes are visible for this session, but they could not be saved.";

    case "unsupported":
      return "Your saved investment data uses an unsupported version and has not been changed.";

    case "invalid":
      return "Saved investment data could not be read. The original value has not been overwritten.";

    default:
      return null;
  }
}

function getWriteHealth(
  result: StorageWriteResult
): InvestmentStorageHealth {
  if (result.status === "written") {
    return "valid";
  }

  if (result.status === "unavailable") {
    return "unavailable";
  }

  return "write-failed";
}

function InvestmentsSkeleton() {
  return (
    <div className="space-y-10">
      <div className="h-[28rem] animate-pulse rounded-[2rem] border border-white/10 bg-zinc-900 xl:h-80" />

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

export default function InvestmentsPage() {
  const hasHydrated = useHasHydrated();

  const [initialResult] = useState(() =>
    readStoredInvestments([])
  );

  const [holdings, setHoldings] =
    useState<InvestmentHolding[]>(
      initialResult.value
    );

  const [storageHealth, setStorageHealth] =
    useState<InvestmentStorageHealth>(
      initialResult.status
    );

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingHolding, setEditingHolding] =
    useState<InvestmentHolding | null>(null);

  const portfolioValueMinor = useMemo(
    () => calculatePortfolioValueMinor(holdings),
    [holdings]
  );

  const investedMinor = useMemo(
    () => calculatePortfolioCostMinor(holdings),
    [holdings]
  );

  const gainMinor = useMemo(
    () => calculatePortfolioGainMinor(holdings),
    [holdings]
  );

  const gainPercentage = useMemo(
    () =>
      calculatePortfolioGainPercentage(holdings),
    [holdings]
  );

  const storageNotice =
    getStorageNotice(storageHealth);

  function openAddForm() {
    setEditingHolding(null);
    setIsFormOpen(true);
  }

  function openEditForm(holdingId: string) {
    const holding = holdings.find(
      (candidate) => candidate.id === holdingId
    );

    if (!holding) {
      return;
    }

    setEditingHolding(holding);
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingHolding(null);
    setIsFormOpen(false);
  }

  function persistHoldings(
    nextHoldings: InvestmentHolding[]
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
        writeStoredInvestments(nextHoldings)
      )
    );
  }

  function handleSave(
    holding: InvestmentHolding
  ) {
    let nextHoldings: InvestmentHolding[];

    try {
      nextHoldings = editingHolding
        ? updateInvestmentHolding(
            holdings,
            holding
          )
        : addInvestmentHolding(
            holdings,
            holding
          );
    } catch {
      return;
    }

    setHoldings(nextHoldings);
    persistHoldings(nextHoldings);
    closeForm();
  }

  function handleDelete(holdingId: string) {
    const nextHoldings =
      deleteInvestmentHolding(
        holdings,
        holdingId
      );

    setHoldings(nextHoldings);
    persistHoldings(nextHoldings);
    closeForm();
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        {!hasHydrated ? (
          <InvestmentsSkeleton />
        ) : (
          <>
            <InvestmentsHero
              portfolioValueMinor={
                portfolioValueMinor
              }
              investedMinor={investedMinor}
              gainMinor={gainMinor}
              gainPercentage={gainPercentage}
              onAddHolding={openAddForm}
            />

            {storageNotice && (
              <aside
                role="status"
                className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3"
              >
                <p className="text-sm font-semibold text-amber-200">
                  Investment storage notice
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-100/75">
                  {storageNotice}
                </p>
              </aside>
            )}

            <section
              aria-labelledby="holdings-title"
              className="mt-10"
            >
              {holdings.length === 0 ? (
                <InvestmentEmptyState
                  onAddHolding={openAddForm}
                />
              ) : (
                <>
                  <div className="mb-4">
                    <h2
                      id="holdings-title"
                      className="text-lg font-semibold"
                    >
                      Holdings
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Select a holding to update its quantity or prices.
                    </p>
                  </div>

                  <HoldingList
                    holdings={holdings}
                    onEditHolding={openEditForm}
                  />
                </>
              )}
            </section>
          </>
        )}
      </section>

      {isFormOpen && (
        <HoldingFormModal
          holding={editingHolding ?? undefined}
          onClose={closeForm}
          onSave={handleSave}
          onDelete={
            editingHolding
              ? handleDelete
              : undefined
          }
        />
      )}
    </main>
  );
}
