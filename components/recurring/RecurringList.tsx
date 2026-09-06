import type {
  Account,
} from "@/lib/account-types";
import type { RecurringTransaction } from "@/lib/recurring-transaction-types";

import RecurringCard from "./RecurringCard";

type RecurringListProps = {
  items: readonly RecurringTransaction[];
  accounts: readonly Account[];
  onEdit: (itemId: string) => void;
};

export default function RecurringList({
  items,
  accounts,
  onEdit,
}: RecurringListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <RecurringCard
          key={item.id}
          item={item}
          accountName={
            item.accountId
              ? accounts.find(
                  (account) =>
                    account.id ===
                    item.accountId
                )?.name
              : undefined
          }
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
