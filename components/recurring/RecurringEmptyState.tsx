import {
  CalendarClock,
  Plus,
} from "lucide-react";

type RecurringEmptyStateProps = {
  onAdd: () => void;
};

export default function RecurringEmptyState({
  onAdd,
}: RecurringEmptyStateProps) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
        <CalendarClock size={27} />
      </div>

      <h2 className="mt-6 text-xl font-semibold text-white">
        No recurring transactions yet
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Add salary, rent, subscriptions or other repeating payments.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        <Plus size={17} />
        Add recurring transaction
      </button>
    </div>
  );
}
