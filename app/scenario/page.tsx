"use client";

import {
  useMemo,
  useState,
} from "react";

import { useHasHydrated } from "@/hooks/useHasHydrated";

import Sidebar from "@/components/layout/Sidebar";
import ScenarioPlannerCard from "@/components/scenario/ScenarioPlannerCard";
import StorageNotice from "@/components/shared/StorageNotice";

import {
  readStoredAccounts,
} from "@/lib/account-storage";

function ScenarioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-80 animate-pulse rounded-[2rem] border border-white/10 bg-zinc-900" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-3xl border border-white/10 bg-zinc-900"
          />
        ))}
      </div>

      <div className="h-96 animate-pulse rounded-[2rem] border border-white/10 bg-zinc-900" />
    </div>
  );
}

export default function ScenarioPage() {
  const hasHydrated =
    useHasHydrated();

  const [accountResult] =
    useState(() =>
      readStoredAccounts([])
    );

  const {
    startingCashMinor,
    startingInvestmentsMinor,
  } = useMemo(() => {
    let cashMinor = 0;
    let investmentsMinor = 0;

    for (const account of accountResult.value) {
      if (
        !account.includedInNetWorth
      ) {
        continue;
      }

      if (
        account.type === "investment"
      ) {
        investmentsMinor +=
          account.balanceMinor;
        continue;
      }

      if (
        account.type === "checking" ||
        account.type === "savings" ||
        account.type === "cash"
      ) {
        cashMinor +=
          account.balanceMinor;
      }
    }

    return {
      startingCashMinor:
        cashMinor,
      startingInvestmentsMinor:
        investmentsMinor,
    };
  }, [accountResult.value]);

  const storageMessage =
    accountResult.status ===
    "unavailable"
      ? "Account storage is unavailable, so the scenario starts from €0 balances."
      : accountResult.status ===
          "invalid" ||
        accountResult.status ===
          "unsupported"
        ? "Saved account data could not be read safely, so the scenario may start from incomplete balances."
        : null;

  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        {!hasHydrated ? (
          <ScenarioSkeleton />
        ) : (
          <>
            <StorageNotice
              title="Scenario data notice"
              message={
                storageMessage
              }
            />

            <ScenarioPlannerCard
              startingCashMinor={
                startingCashMinor
              }
              startingInvestmentsMinor={
                startingInvestmentsMinor
              }
            />
          </>
        )}
      </section>
    </main>
  );
}
