import { WalletCards } from "lucide-react";

type BudgetEmptyStateProps = {
  hasTransactions: boolean;
};

export default function BudgetEmptyState({
  hasTransactions,
}: BudgetEmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
        <WalletCards size={24} />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        No budgets for this month yet
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {hasTransactions
          ? "Your transactions are ready. Create category budgets to compare your spending with a monthly plan."
          : "Add transactions first, then create category budgets to plan and monitor your monthly spending."}
      </p>
    </div>
  );
}