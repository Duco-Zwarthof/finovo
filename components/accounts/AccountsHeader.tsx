"use client";

import { Landmark, Plus } from "lucide-react";

type AccountsHeaderProps = {
  onAddAccount: () => void;
};

export default function AccountsHeader({
  onAddAccount,
}: AccountsHeaderProps) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-blue-400">
          <Landmark size={17} />

          <span>Account management</span>
        </div>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Accounts
        </h1>

        <p className="mt-3 max-w-2xl text-zinc-400">
          Add your financial accounts to calculate your real net worth
          and create a complete overview of your money.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddAccount}
        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <Plus size={17} />

        Add account
      </button>
    </header>
  );
}