"use client";

import { useMemo, useState } from "react";

import { useHasHydrated } from "@/hooks/useHasHydrated";

import Sidebar from "@/components/layout/Sidebar";
import FinancialHealthCard from "@/components/net-worth/FinancialHealthCard";
import FinancialInsights from "@/components/net-worth/FinancialInsights";
import FinancialSignals from "@/components/net-worth/FinancialSignals";
import NetWorthBreakdown from "@/components/net-worth/NetWorthBreakdown";
import NetWorthHero from "@/components/net-worth/NetWorthHero";
import NetWorthHistoryChart from "@/components/net-worth/NetWorthHistoryChart";
import NetWorthHistoryOverview from "@/components/net-worth/NetWorthHistoryOverview";
import PortfolioCoverageCard from "@/components/net-worth/PortfolioCoverageCard";
import StorageNotice from "@/components/shared/StorageNotice";

import { readStoredAccounts } from "@/lib/account-storage";
import { calculateFinancialHealth } from "@/lib/financial-health";
import { generateFinancialInsights } from "@/lib/insights";
import { readStoredGoals } from "@/lib/goal-storage";
import { readStoredInvestments } from "@/lib/investment-storage";
import { calculateFinancialOverview } from "@/lib/net-worth";
import {
  calculateNetWorthHistorySummary,
  upsertDailyNetWorthSnapshot,
} from "@/lib/net-worth-history";
import {
  readStoredNetWorthHistory,
  writeStoredNetWorthHistory,
} from "@/lib/net-worth-history-storage";
import { readStoredTransactions } from "@/lib/storage";
import {
  createTransactionDataState,
  getDisplayedTransactions,
} from "@/lib/transaction-data";

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

function NetWorthSkeleton() {
  return (
    <div className="space-y-10">
      <div className="h-[28rem] animate-pulse rounded-[2rem] border border-white/10 bg-zinc-900 xl:h-80" />

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-3xl border border-white/10 bg-zinc-900"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-zinc-900" />
        <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-zinc-900" />
      </div>
    </div>
  );
}

function getStorageMessage(
  statuses: readonly string[]
) {
  if (statuses.includes("unavailable")) {
    return "Some browser storage is unavailable. The overview may be incomplete and changes elsewhere may not persist.";
  }

  if (
    statuses.includes("invalid") ||
    statuses.includes("unsupported")
  ) {
    return "Some saved financial data could not be read, so the overview may be incomplete.";
  }

  if (statuses.includes("recovered")) {
    return "Some invalid saved entries were ignored while valid financial data was preserved.";
  }

  return null;
}

export default function NetWorthPage() {
  const hasHydrated = useHasHydrated();

  const [accountResult] = useState(() =>
    readStoredAccounts([])
  );
  const [investmentResult] = useState(() =>
    readStoredInvestments([])
  );
  const [goalResult] = useState(() =>
    readStoredGoals([])
  );
  const [transactionResult] = useState(() =>
    readStoredTransactions([])
  );

  const [transactionData] = useState(() =>
    createTransactionDataState(transactionResult)
  );

  const transactions =
    getDisplayedTransactions(transactionData);

  const overview = useMemo(
    () =>
      calculateFinancialOverview(
        accountResult.value,
        investmentResult.value,
        goalResult.value,
        transactions
      ),
    [
      accountResult.value,
      investmentResult.value,
      goalResult.value,
      transactions,
    ]
  );

  const [historyResult] = useState(() => {
    const stored =
      readStoredNetWorthHistory([]);
    const today = formatLocalDate(
      new Date()
    );

    const snapshots =
      upsertDailyNetWorthSnapshot(
        stored.value,
        {
          id: `net-worth-${today}`,
          date: today,
          netWorthMinor:
            overview.netWorthMinor,
        }
      );

    const canWrite =
      stored.status !== "invalid" &&
      stored.status !== "unsupported" &&
      stored.status !== "unavailable";

    if (canWrite) {
      const writeResult =
        writeStoredNetWorthHistory(
          snapshots
        );

      if (
        writeResult.status === "failed" ||
        writeResult.status ===
          "unavailable"
      ) {
        return {
          value: snapshots,
          status: writeResult.status,
        };
      }
    }

    return {
      value: snapshots,
      status: stored.status,
    };
  });

  const historySummary = useMemo(
    () =>
      calculateNetWorthHistorySummary(
        historyResult.value
      ),
    [historyResult.value]
  );

  const financialHealth = useMemo(
    () =>
      calculateFinancialHealth(
        overview
      ),
    [overview]
  );

  const financialInsights = useMemo(
    () =>
      generateFinancialInsights(
        overview,
        financialHealth,
        historySummary
      ),
    [
      overview,
      financialHealth,
      historySummary,
    ]
  );

  const storageMessage = getStorageMessage([
    accountResult.status,
    investmentResult.status,
    goalResult.status,
    transactionResult.status,
    historyResult.status,
  ]);

  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        {!hasHydrated ? (
          <NetWorthSkeleton />
        ) : (
          <>
            <NetWorthHero overview={overview} />

            <StorageNotice
              title="Financial data notice"
              message={storageMessage}
            />

            {transactionData.source === "demo" && (
              <aside className="mt-6 rounded-2xl border border-blue-500/25 bg-blue-500/[0.08] px-4 py-3">
                <p className="text-sm font-semibold text-blue-200">
                  Demo cash flow
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-100/80">
                  Monthly income and expenses currently use example transactions.
                  Net worth, accounts, holdings and goals remain based on your saved data.
                </p>
              </aside>
            )}

            <div className="mt-10">
              <FinancialSignals overview={overview} />
            </div>

            <div className="mt-10">
              <FinancialHealthCard
                result={financialHealth}
              />
            </div>

            <div className="mt-10">
              <FinancialInsights
                insights={financialInsights}
              />
            </div>

            <div className="mt-10">
              <NetWorthHistoryChart
                snapshots={historyResult.value}
              />
            </div>

            <div className="mt-10">
              <NetWorthHistoryOverview
                snapshots={historyResult.value}
                summary={historySummary}
              />
            </div>

            <div className="mt-10 grid gap-6 xl:grid-cols-2">
              <NetWorthBreakdown
                breakdown={overview.accountBreakdown}
              />

              <PortfolioCoverageCard
                coverage={overview.portfolioCoverage}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
