"use client";

import { useState } from "react";
import { Bell, Search, UserCircle2 } from "lucide-react";
import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import type { Transaction } from "@/lib/types";

type HeaderProps = {
  onAddTransaction: (transaction: Transaction) => void;
};

export default function Header({
  onAddTransaction,
}: HeaderProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <header className="mb-10 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-blue-500">
          Tuesday, 29 July
        </p>

        <h1 className="mt-2 text-5xl font-bold">
          Welcome back, Duco 👋
        </h1>

        <p className="mt-2 text-zinc-400">
          Here&apos;s your financial overview.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
        >
          + Add transaction
        </button>

        <button
          type="button"
          className="rounded-xl border border-white/10 bg-zinc-900 p-3 transition hover:border-blue-500"
        >
          <Search size={20} />
        </button>

        <button
          type="button"
          className="rounded-xl border border-white/10 bg-zinc-900 p-3 transition hover:border-blue-500"
        >
          <Bell size={20} />
        </button>

        <button
          type="button"
          className="rounded-xl border border-white/10 bg-zinc-900 p-2 transition hover:border-blue-500"
        >
          <UserCircle2 size={28} />
        </button>
      </div>

      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onSave={(transaction) => {
            onAddTransaction(transaction);
            setShowModal(false);
          }}
        />
      )}
    </header>
  );
}