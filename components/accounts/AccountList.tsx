import { Landmark } from "lucide-react";

import AccountCard from "./AccountCard";

import type { Account } from "@/lib/account-types";

type AccountListProps = {
  accounts: readonly Account[];
  onEditAccount?: (accountId: string) => void;
};

export default function AccountList({
  accounts,
  onEditAccount,
}: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
          <Landmark size={24} />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-white">
          No accounts yet
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
          Add your checking, savings, investment or cash accounts to
          calculate your real net worth.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={onEditAccount}
        />
      ))}
    </div>
  );
}