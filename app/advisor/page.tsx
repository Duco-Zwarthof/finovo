"use client";

import {
  useMemo,
  useState,
} from "react";

import { useHasHydrated } from "@/hooks/useHasHydrated";

import AdvisorChat from "@/components/advisor/AdvisorChat";
import AdvisorContextSummary from "@/components/advisor/AdvisorContextSummary";
import Sidebar from "@/components/layout/Sidebar";
import StorageNotice from "@/components/shared/StorageNotice";

import { readStoredAccounts } from "@/lib/account-storage";
import {
  createAdvisorContext,
} from "@/lib/advisor";
import {
  calculateAdvisorScenarioContext,
} from "@/lib/advisor-scenario";
import { calculateCashflowForecast } from "@/lib/cashflow-forecast";
import { calculateFinancialHealth } from "@/lib/financial-health";
import { readStoredGoals } from "@/lib/goal-storage";
import { readStoredInvestments } from "@/lib/investment-storage";
import {
  calculateNetWorthHistorySummary,
} from "@/lib/net-worth-history";
import {
  readStoredNetWorthHistory,
} from "@/lib/net-worth-history-storage";
import { calculateFinancialOverview } from "@/lib/net-worth";
import { readStoredRecurringTransactions } from "@/lib/recurring-transaction-storage";
import { generateSmartFinancialInsights } from "@/lib/smart-insights";
import {
  readScenarioSettings,
} from "@/lib/scenario-settings";
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

function addDays(
  date: Date,
  days: number
) {
  const next = new Date(date);
  next.setDate(
    next.getDate() + days
  );

  return next;
}

function getStorageMessage(
  statuses: readonly string[]
) {
  if (
    statuses.includes("unavailable")
  ) {
    return "Some local financial data is unavailable, so the advisor context may be incomplete.";
  }

  if (
    statuses.includes("invalid") ||
    statuses.includes("unsupported")
  ) {
    return "Some saved financial data could not be read safely, so the advisor context may be incomplete.";
  }

  return null;
}

function AdvisorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-3xl border border-white/10 bg-zinc-900"
          />
        ))}
      </div>

      <div className="h-[42rem] animate-pulse rounded-[2rem] border border-white/10 bg-zinc-900" />
    </div>
  );
}

export default function AdvisorPage() {
  const hasHydrated =
    useHasHydrated();

  const [accountResult] =
    useState(() =>
      readStoredAccounts([])
    );

  const [investmentResult] =
    useState(() =>
      readStoredInvestments([])
    );

  const [goalResult] =
    useState(() =>
      readStoredGoals([])
    );

  const [recurringResult] =
    useState(() =>
      readStoredRecurringTransactions(
        []
      )
    );

  const [transactionResult] =
    useState(() =>
      readStoredTransactions([])
    );

  const [historyResult] =
    useState(() =>
      readStoredNetWorthHistory([])
    );

  const [scenarioSettings] =
    useState(() =>
      readScenarioSettings()
    );

  const [transactionData] =
    useState(() =>
      createTransactionDataState(
        transactionResult
      )
    );

  const transactions =
    getDisplayedTransactions(
      transactionData
    );

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

  const financialHealth =
    useMemo(
      () =>
        calculateFinancialHealth(
          overview
        ),
      [overview]
    );

  const historySummary =
    useMemo(
      () =>
        calculateNetWorthHistorySummary(
          historyResult.value
        ),
      [historyResult.value]
    );

  const startDate = useMemo(
    () =>
      formatLocalDate(new Date()),
    []
  );

  const endDate = useMemo(
    () =>
      formatLocalDate(
        addDays(new Date(), 30)
      ),
    []
  );

  const forecast = useMemo(
    () =>
      calculateCashflowForecast(
        accountResult.value,
        recurringResult.value,
        startDate,
        endDate
      ),
    [
      accountResult.value,
      recurringResult.value,
      startDate,
      endDate,
    ]
  );

  const smartInsights =
    useMemo(
      () =>
        generateSmartFinancialInsights(
          overview,
          financialHealth,
          historySummary,
          forecast
        ),
      [
        overview,
        financialHealth,
        historySummary,
        forecast,
      ]
    );

  const advisorScenario =
    useMemo(
      () =>
        calculateAdvisorScenarioContext(
          overview.liquidAssetsMinor,
          overview.investmentAssetsMinor,
          scenarioSettings
        ),
      [
        overview.liquidAssetsMinor,
        overview.investmentAssetsMinor,
        scenarioSettings,
      ]
    );

  const advisorContext =
    useMemo(
      () =>
        createAdvisorContext(
          overview,
          financialHealth,
          forecast,
          smartInsights,
          advisorScenario
        ),
      [
        overview,
        financialHealth,
        forecast,
        smartInsights,
        advisorScenario,
      ]
    );

  const storageMessage =
    getStorageMessage([
      accountResult.status,
      investmentResult.status,
      goalResult.status,
      recurringResult.status,
      transactionResult.status,
      historyResult.status,
    ]);

  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        {!hasHydrated ? (
          <AdvisorSkeleton />
        ) : (
          <>
            <AdvisorContextSummary
              context={advisorContext}
            />

            <StorageNotice
              title="Advisor data notice"
              message={storageMessage}
            />

            {transactionData.source ===
              "demo" && (
              <aside className="mt-4 rounded-2xl border border-blue-500/25 bg-blue-500/[0.08] px-4 py-3">
                <p className="text-sm font-semibold text-blue-200">
                  Demo transaction data
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-100/80">
                  Some advisor calculations currently use example transactions.
                  Add your own transaction to switch to personal transaction data.
                </p>
              </aside>
            )}

            <div className="mt-6">
              <AdvisorChat
                context={
                  advisorContext
                }
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
