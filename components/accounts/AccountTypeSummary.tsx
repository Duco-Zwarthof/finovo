import {
  Banknote,
  Landmark,
  PiggyBank,
  TrendingUp,
} from "lucide-react";

import type {
  Account,
  AccountType,
} from "@/lib/account-types";
import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type AccountTypeSummaryProps = {
  accounts: readonly Account[];
};

const accountTypes: {
  type: AccountType;
  label: string;
  icon: typeof Landmark;
}[] = [
  {
    type: "checking",
    label: "Checking",
    icon: Landmark,
  },
  {
    type: "savings",
    label: "Savings",
    icon: PiggyBank,
  },
  {
    type: "investment",
    label: "Investments",
    icon: TrendingUp,
  },
  {
    type: "cash",
    label: "Cash",
    icon: Banknote,
  },
];

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function AccountTypeSummary({
  accounts,
}: AccountTypeSummaryProps) {
  const totals = accountTypes.map((item) => {
    const matchingAccounts = accounts.filter(
      (account) => account.type === item.type
    );

    const totalMinor = matchingAccounts.reduce(
      (total, account) => {
        const nextTotal = total + account.balanceMinor;

        if (!Number.isSafeInteger(nextTotal)) {
          throw new RangeError(
            "Account type total exceeds the safe minor-unit range"
          );
        }

        return nextTotal;
      },
      0
    );

    return {
      ...item,
      totalMinor,
      accountCount: matchingAccounts.length,
    };
  });

  return (
    <section aria-labelledby="account-type-summary-title">
      <div className="mb-4">
        <h2
          id="account-type-summary-title"
          className="text-lg font-semibold text-white"
        >
          Balance by account type
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          See how your money is distributed across your accounts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {totals.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.type}
              className="rounded-3xl border border-white/10 bg-zinc-900 p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Icon size={18} />
                </div>

                <span className="text-xs text-zinc-500">
                  {item.accountCount}{" "}
                  {item.accountCount === 1
                    ? "account"
                    : "accounts"}
                </span>
              </div>

              <p className="mt-5 text-sm text-zinc-400">
                {item.label}
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-white">
                {formatMinorCurrency(item.totalMinor)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}