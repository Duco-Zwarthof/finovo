import {
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type AccountsHeroProps = {
  netWorthMinor: number;
  totalAccounts: number;
  includedAccounts: number;
  onAddAccount: () => void;
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

export default function AccountsHero({
  netWorthMinor,
  totalAccounts,
  includedAccounts,
  onAddAccount,
}: AccountsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 px-6 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18),transparent_68%)]" />

      <div className="relative grid gap-8 xl:grid-cols-[1.3fr_1fr] xl:items-end">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <Landmark size={17} />
            <span>Account management</span>
          </div>

          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Your complete financial position, in one place.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Manage the balances that contribute to your net worth and
            see how your money is distributed across account types.
          </p>

          <button
            type="button"
            onClick={onAddAccount}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            <WalletCards size={17} />
            Add account
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Net worth
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {formatMinorCurrency(netWorthMinor)}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Accounts
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {totalAccounts}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              <ShieldCheck size={14} />
              <span>Included</span>
            </div>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {includedAccounts}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
