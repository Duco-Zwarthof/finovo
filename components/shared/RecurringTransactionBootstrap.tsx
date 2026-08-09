"use client";

import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

import {
  synchronizeDueRecurringTransactions,
} from "@/lib/recurring-sync";

type RecurringTransactionBootstrapProps = {
  children: ReactNode;
};

export default function RecurringTransactionBootstrap({
  children,
}: RecurringTransactionBootstrapProps) {
  const [isReady, setIsReady] =
    useState(false);

  useEffect(() => {
    synchronizeDueRecurringTransactions();

    queueMicrotask(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <div
        aria-hidden="true"
        className="min-h-dvh bg-zinc-950"
      />
    );
  }

  return children;
}
