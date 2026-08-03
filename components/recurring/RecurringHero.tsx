import {
  CalendarClock,
  Plus,
} from "lucide-react";

import type { RecurringTransaction } from "@/lib/recurring-transaction-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type RecurringHeroProps = {
  items: readonly RecurringTransaction[];
  onAdd: () => void;
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function RecurringHero({
  items,
  onAdd,
}: RecurringHeroProps) {
  const activeItems = items.filter(
    (item) => item.isActive
  );

  const monthlyIncomeMinor = activeItems
    .filter(
      (item) =>
        item.type === "income" &&
        item.frequency === "monthly"
    )
    .reduce(
      (total, item) =>
        total + item.amountMinor,
      0
    );

  const monthlyExpenseMinor = activeItems
    .filter(
      (item) =>
        item.type === "expense" &&
        item.frequency === "monthly"
    )
    .reduce(
      (total, item) =>
        total + item.amountMinor,
      0
    );

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 px-6 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.2),transparent_68%)]" />

      <div className="relative grid gap-8 xl:grid-cols-[1.25fr_1fr] xl:items-end">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <CalendarClock size={17} />
            <span>Recurring transactions</span>
          </div>

          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Plan repeating income and expenses ahead of time.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Track salary, rent, subscriptions and other repeating payments
            without entering the same information every month.
          </p>

          <button
            type="button"
            onClick={onAdd}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Plus size={17} />
            Add recurring transaction
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Active
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {activeItems.length}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Monthly income
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-400">
              {formatMinorCurrency(monthlyIncomeMinor)}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Monthly expenses
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-red-400">
              {formatMinorCurrency(monthlyExpenseMinor)}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
