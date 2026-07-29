import {
  Pencil,
  Trash2,
} from "lucide-react";

import type { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/finance";

type RecentTransactionsProps = {
  transactions: Transaction[];
  onEditTransaction: (
    transaction: Transaction
  ) => void;
  onDeleteTransaction: (id: string) => void;
};

export default function RecentTransactions({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
}: RecentTransactionsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <h2 className="text-xl font-bold">
        Recent Transactions
      </h2>

      {transactions.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-400">
          No transactions recorded yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between border-b border-white/5 pb-3 last:border-b-0"
            >
              <div>
                <p className="font-medium">
                  {transaction.title}
                </p>

                <p className="text-sm text-zinc-400">
                  {transaction.category}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p
                  className={`min-w-24 text-right font-semibold ${
                    transaction.type === "income"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {transaction.type === "income"
                    ? "+"
                    : "-"}
                  {formatCurrency(
                    transaction.amount
                  )}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    onEditTransaction(transaction)
                  }
                  aria-label={`Edit ${transaction.title}`}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onDeleteTransaction(
                      transaction.id
                    )
                  }
                  aria-label={`Delete ${transaction.title}`}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}