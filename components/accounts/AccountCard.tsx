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

type AccountCardProps = {
  account: Account;
  onEdit?: (accountId: string) => void;
};

const accountTypeLabels: Record<AccountType, string> = {
  checking: "Checking account",
  savings: "Savings account",
  investment: "Investment account",
  cash: "Cash",
};

const accountTypeIcons = {
  checking: Landmark,
  savings: PiggyBank,
  investment: TrendingUp,
  cash: Banknote,
} satisfies Record<AccountType, typeof Landmark>;

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function AccountCard({
  account,
  onEdit,
}: AccountCardProps) {
  const Icon = accountTypeIcons[account.type];

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Icon size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-white">
              {account.name}
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              {accountTypeLabels[account.type]}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            account.includedInNetWorth
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {account.includedInNetWorth
            ? "Included"
            : "Excluded"}
        </span>
      </div>

      <div className="mt-7">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
          Balance
        </p>

        <p className="mt-2 text-3xl font-bold tracking-tight text-white">
          {formatMinorCurrency(account.balanceMinor)}
        </p>
      </div>
    </>
  );

  if (!onEdit) {
    return (
      <article className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
        {content}
      </article>
    );
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-zinc-900 p-6 transition hover:border-blue-500/25 hover:bg-zinc-900/90">
      <button
        type="button"
        onClick={() => onEdit(account.id)}
        aria-label={`Edit ${account.name}`}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-900"
      >
        {content}
      </button>
    </article>
  );
}