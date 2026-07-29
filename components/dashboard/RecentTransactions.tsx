import type { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/finance";

type RecentTransactionsProps = {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
};

export default function RecentTransactions({
  transactions,
  onDeleteTransaction,
}: RecentTransactionsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <h2 className="text-xl font-bold">Recent Transactions</h2>

      <div className="mt-6 space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between border-b border-white/5 pb-3 last:border-b-0"
          >
            <div>
              <p className="font-medium">{transaction.title}</p>

              <p className="text-sm text-zinc-400">
                {transaction.category}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <p
                className={`font-semibold ${
                  transaction.type === "income"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>

              <button
                type="button"
                onClick={() =>
                  onDeleteTransaction(transaction.id)
                }
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                aria-label={`Delete ${transaction.title}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}