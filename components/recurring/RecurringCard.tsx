import {
  CalendarDays,
  CirclePause,
  CirclePlay,
} from "lucide-react";

import type {
  RecurringFrequency,
  RecurringTransaction,
} from "@/lib/recurring-transaction-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type RecurringCardProps = {
  item: RecurringTransaction;
  onEdit: (itemId: string) => void;
};

const frequencyLabels: Record<
  RecurringFrequency,
  string
> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function RecurringCard({
  item,
  onEdit,
}: RecurringCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-zinc-900 p-6 transition hover:border-blue-500/25">
      <button
        type="button"
        onClick={() => onEdit(item.id)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                item.isActive
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {item.isActive ? (
                <CirclePlay size={22} />
              ) : (
                <CirclePause size={22} />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-semibold text-white">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                {item.category} ·{" "}
                {frequencyLabels[item.frequency]}
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              item.isActive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {item.isActive ? "Active" : "Paused"}
          </span>
        </div>

        <div className="mt-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">
              Amount
            </p>

            <p
              className={`mt-2 text-2xl font-bold tracking-tight ${
                item.type === "income"
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {item.type === "income" ? "+" : "-"}
              {formatMinorCurrency(item.amountMinor)}
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">
              <CalendarDays size={14} />
              <span>Starts</span>
            </div>

            <p className="mt-2 text-sm font-semibold text-white">
              {item.startDate}
            </p>
          </div>
        </div>
      </button>
    </article>
  );
}
