"use client";

import {
  useMemo,
  useState,
} from "react";

import { useHasHydrated } from "@/hooks/useHasHydrated";

import ForecastChart from "@/components/forecast/ForecastChart";
import ForecastHero from "@/components/forecast/ForecastHero";
import UpcomingPayments from "@/components/forecast/UpcomingPayments";
import Sidebar from "@/components/layout/Sidebar";
import StorageNotice from "@/components/shared/StorageNotice";

import { readStoredAccounts } from "@/lib/account-storage";
import { calculateCashflowForecast } from "@/lib/cashflow-forecast";
import { readStoredRecurringTransactions } from "@/lib/recurring-transaction-storage";

const FORECAST_HORIZONS = [
  30,
  60,
  90,
] as const;

type ForecastHorizon =
  (typeof FORECAST_HORIZONS)[number];

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
  next.setDate(next.getDate() + days);

  return next;
}

function getStorageMessage(
  statuses: readonly string[]
) {
  if (statuses.includes("unavailable")) {
    return "Some local financial data is unavailable, so this forecast may be incomplete.";
  }

  if (
    statuses.includes("invalid") ||
    statuses.includes("unsupported")
  ) {
    return "Some saved financial data could not be read safely, so this forecast may be incomplete.";
  }

  return null;
}

function ForecastSkeleton() {
  return (
    <div className="space-y-10">
      <div className="h-[28rem] animate-pulse rounded-[2rem] border border-white/10 bg-zinc-900 xl:h-80" />

      <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-zinc-900" />

      <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-zinc-900" />
    </div>
  );
}

export default function ForecastPage() {
  const hasHydrated = useHasHydrated();

  const [horizon, setHorizon] =
    useState<ForecastHorizon>(30);

  const [accountResult] = useState(() =>
    readStoredAccounts([])
  );

  const [recurringResult] = useState(() =>
    readStoredRecurringTransactions([])
  );

  const startDate = useMemo(
    () => formatLocalDate(new Date()),
    []
  );

  const endDate = useMemo(
    () =>
      formatLocalDate(
        addDays(new Date(), horizon)
      ),
    [horizon]
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

  const storageMessage =
    getStorageMessage([
      accountResult.status,
      recurringResult.status,
    ]);

  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        {!hasHydrated ? (
          <ForecastSkeleton />
        ) : (
          <>
            <ForecastHero
              forecast={forecast}
              horizonDays={horizon}
            />

            <StorageNotice
              title="Forecast data notice"
              message={storageMessage}
            />

            <div className="mt-8 flex flex-wrap gap-2">
              {FORECAST_HORIZONS.map(
                (days) => {
                  const isActive =
                    horizon === days;

                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() =>
                        setHorizon(days)
                      }
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "border border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      {days} days
                    </button>
                  );
                }
              )}
            </div>

            <div className="mt-8">
              <ForecastChart
                points={forecast.points}
              />
            </div>

            <div className="mt-8">
              <UpcomingPayments
                events={forecast.events}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
