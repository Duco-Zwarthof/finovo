import type { RecurringTransaction } from "@/lib/recurring-transaction-types";

import RecurringCard from "./RecurringCard";

type RecurringListProps = {
  items: readonly RecurringTransaction[];
  onEdit: (itemId: string) => void;
};

export default function RecurringList({
  items,
  onEdit,
}: RecurringListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <RecurringCard
          key={item.id}
          item={item}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
