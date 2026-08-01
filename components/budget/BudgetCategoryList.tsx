import BudgetCategoryCard from "./BudgetCategoryCard";
import BudgetEmptyState from "./BudgetEmptyState";

import type { BudgetProgress } from "@/lib/budget-types";

type BudgetCategoryListProps = {
  progress: BudgetProgress[];
  hasTransactions: boolean;
  onEditBudget?: (budgetId: string) => void;
};

export default function BudgetCategoryList({
  progress,
  hasTransactions,
  onEditBudget,
}: BudgetCategoryListProps) {
  if (progress.length === 0) {
    return (
      <BudgetEmptyState
        hasTransactions={hasTransactions}
      />
    );
  }

  return (
    <div className="space-y-3">
      {progress.map((item) => (
        <BudgetCategoryCard
          key={item.budgetId}
          progress={item}
          onEdit={onEditBudget}
        />
      ))}
    </div>
  );
}