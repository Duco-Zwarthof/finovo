import {
  CircleGauge,
  PiggyBank,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";
import type { MonthlyBudgetSummary } from "@/lib/budget-types";

type BudgetSummaryProps = {
  summary: MonthlyBudgetSummary;
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

function formatUsagePercentage(
  value: number | null
) {
  return value === null ? "—" : `${Math.round(value)}%`;
}

const summaryItems = [
  {
    key: "budget",
    label: "Total budget",
    icon: WalletCards,
  },
  {
    key: "spent",
    label: "Budgeted spending",
    icon: ReceiptText,
  },
  {
    key: "remaining",
    label: "Remaining",
    icon: PiggyBank,
  },
  {
    key: "usage",
    label: "Budget usage",
    icon: CircleGauge,
  },
] as const;

export default function BudgetSummary({
  summary,
}: BudgetSummaryProps) {
  const values = {
    budget: formatMinorCurrency(
      summary.totalLimitMinor
    ),
    spent: formatMinorCurrency(
      summary.totalSpentMinor
    ),
    remaining: formatMinorCurrency(
      summary.totalRemainingMinor
    ),
    usage: formatUsagePercentage(
      summary.usagePercentage
    ),
  };

  return (
    <section aria-labelledby="budget-summary-title">
      <div className="mb-4">
        <h2
          id="budget-summary-title"
          className="text-lg font-semibold text-white"
        >
          Monthly overview
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Your plan and spending for the selected
          month.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          const value = values[item.key];

          return (
            <article
              key={item.key}
              className="rounded-3xl border border-white/10 bg-zinc-900 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-400">
                  {item.label}
                </p>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  <Icon size={18} />
                </div>
              </div>

              <p className="mt-5 text-2xl font-bold tracking-tight text-white">
                {value}
              </p>
            </article>
          );
        })}
      </div>

      {summary.unbudgetedSpentMinor > 0 && (
        <aside className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3">
          <p className="text-sm font-semibold text-amber-200">
            Unbudgeted spending
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-100/75">
            {formatMinorCurrency(
              summary.unbudgetedSpentMinor
            )}{" "}
            was spent in categories without a budget
            this month.
          </p>
        </aside>
      )}
    </section>
  );
}