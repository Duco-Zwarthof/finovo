import {
  Banknote,
  Landmark,
  PiggyBank,
  TrendingUp,
} from "lucide-react";

import type { NetWorthBreakdown as NetWorthBreakdownData } from "@/lib/net-worth-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type NetWorthBreakdownProps = {
  breakdown: NetWorthBreakdownData;
};

const rows = [
  {
    key: "checkingMinor",
    label: "Checking",
    icon: Landmark,
  },
  {
    key: "savingsMinor",
    label: "Savings",
    icon: PiggyBank,
  },
  {
    key: "cashMinor",
    label: "Cash",
    icon: Banknote,
  },
  {
    key: "investmentAccountsMinor",
    label: "Investment accounts",
    icon: TrendingUp,
  },
] as const;

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function NetWorthBreakdown({
  breakdown,
}: NetWorthBreakdownProps) {
  const total =
    breakdown.totalIncludedAccountsMinor;

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Net worth breakdown
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Only accounts marked as included contribute to this total.
        </p>
      </div>

      <div className="mt-7 space-y-5">
        {rows.map((row) => {
          const Icon = row.icon;
          const amountMinor = breakdown[row.key];
          const percentage =
            total === 0
              ? 0
              : (amountMinor / total) * 100;

          return (
            <div key={row.key}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      {row.label}
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      {Math.round(percentage * 10) / 10}%
                    </p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-white">
                  {formatMinorCurrency(amountMinor)}
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
