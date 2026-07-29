"use client";

import { useEffect, useState } from "react";

import type { Transaction } from "@/lib/types";

import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import CashflowChart from "@/components/dashboard/CashflowChart";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import StatCard from "@/components/dashboard/StatCard";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

import {
  calculateExpenses,
  calculateIncome,
  calculateSavings,
  formatCurrency,
} from "@/lib/finance";

import { sampleTransactions } from "@/lib/sample-transactions";

export default function Home() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(
      sampleTransactions
    );

  const [hasLoaded, setHasLoaded] =
    useState(false);

  const [
    editingTransaction,
    setEditingTransaction,
  ] = useState<Transaction | null>(null);

  useEffect(() => {
    const savedTransactions =
      localStorage.getItem(
        "finovo-transactions"
      );

    if (savedTransactions) {
      try {
        const parsedTransactions =
          JSON.parse(
            savedTransactions
          ) as Transaction[];

        setTransactions(parsedTransactions);
      } catch (error) {
        console.error(
          "Could not load saved transactions:",
          error
        );
      }
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    localStorage.setItem(
      "finovo-transactions",
      JSON.stringify(transactions)
    );
  }, [transactions, hasLoaded]);

  const monthlyIncome =
    calculateIncome(transactions);

  const monthlyExpenses =
    calculateExpenses(transactions);

  const monthlySavings =
    calculateSavings(transactions);

  function handleAddTransaction(
    transaction: Transaction
  ) {
    setTransactions(
      (currentTransactions) => [
        transaction,
        ...currentTransactions,
      ]
    );
  }

  function handleEditTransaction(
    transaction: Transaction
  ) {
    setEditingTransaction(transaction);
  }

  function handleSaveEditedTransaction(
    updatedTransaction: Transaction
  ) {
    setTransactions(
      (currentTransactions) =>
        currentTransactions.map(
          (transaction) =>
            transaction.id ===
            updatedTransaction.id
              ? updatedTransaction
              : transaction
        )
    );

    setEditingTransaction(null);
  }

  function handleDeleteTransaction(
    id: string
  ) {
    setTransactions(
      (currentTransactions) =>
        currentTransactions.filter(
          (transaction) =>
            transaction.id !== id
        )
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="flex-1 p-10">
        <Header
          onAddTransaction={
            handleAddTransaction
          }
        />

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Net worth"
            value="£41,283"
            description="Your total financial position"
          />

          <StatCard
            title="Monthly income"
            value={formatCurrency(
              monthlyIncome
            )}
            description="Income received this month"
          />

          <StatCard
            title="Monthly expenses"
            value={formatCurrency(
              monthlyExpenses
            )}
            description="Expenses recorded this month"
          />

          <StatCard
            title="Monthly savings"
            value={formatCurrency(
              monthlySavings
            )}
            description="Income minus expenses"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <DashboardPanel
              title="Monthly cash flow"
              description="Income and expenses over the last six months"
            >
              <CashflowChart
                transactions={transactions}
              />
            </DashboardPanel>
          </div>

          <DashboardPanel
            title="Savings goal"
            description="Your progress towards a house deposit"
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">
                  £11,000
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  of £30,000 saved
                </p>
              </div>

              <p className="text-sm font-semibold text-blue-500">
                37%
              </p>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-[37%] rounded-full bg-blue-600" />
            </div>

            <p className="mt-4 text-sm text-zinc-400">
              £19,000 remaining
            </p>
          </DashboardPanel>
        </section>

        <section className="mt-6">
          <RecentTransactions
            transactions={transactions}
            onEditTransaction={
              handleEditTransaction
            }
            onDeleteTransaction={
              handleDeleteTransaction
            }
          />
        </section>
      </section>

      {editingTransaction && (
        <AddTransactionModal
          transaction={editingTransaction}
          onClose={() =>
            setEditingTransaction(null)
          }
          onSave={
            handleSaveEditedTransaction
          }
        />
      )}
    </main>
  );
}