import type { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/finance";

type RecentTransactionsProps = {
  transactions: Transaction[];
};

export default function RecentTransactions({
  transactions,
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
          </div>
        ))}
      </div>
    </div>
  );
}
