"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import {
  ArrowRightLeft,
  Trash2,
} from "lucide-react";

import type {
  Account,
} from "@/lib/account-types";
import type {
  AccountTransfer,
} from "@/lib/account-transfers";
import {
  formatLocalDate,
} from "@/lib/date";
import {
  CURRENCY_SYMBOL,
  formatCurrency,
} from "@/lib/money";
import {
  euroAmountToMinor,
  minorUnitsToEuroAmount,
} from "@/lib/transaction-amount";

type TransferActionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

type AccountTransferPanelProps = {
  accounts: readonly Account[];
  transfers: readonly AccountTransfer[];
  onCreate: (
    transfer: AccountTransfer
  ) => TransferActionResult;
  onDelete: (
    transferId: string
  ) => TransferActionResult;
};

function formatMinor(
  amountMinor: number
) {
  return formatCurrency(
    minorUnitsToEuroAmount(
      amountMinor
    ) ?? 0
  );
}

export default function AccountTransferPanel({
  accounts,
  transfers,
  onCreate,
  onDelete,
}: AccountTransferPanelProps) {
  const [
    fromAccountId,
    setFromAccountId,
  ] = useState(
    accounts[0]?.id ?? ""
  );

  const [
    toAccountId,
    setToAccountId,
  ] = useState(
    accounts[1]?.id ?? ""
  );

  const [
    amount,
    setAmount,
  ] = useState("");

  const [date, setDate] =
    useState(
      formatLocalDate(
        new Date()
      )
    );

  const [note, setNote] =
    useState("");

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const recentTransfers =
    useMemo(
      () =>
        [...transfers]
          .sort(
            (
              first,
              second
            ) =>
              second.date.localeCompare(
                first.date
              )
          )
          .slice(0, 6),
      [transfers]
    );

  const accountNames =
    useMemo(
      () =>
        new Map(
          accounts.map(
            (account) => [
              account.id,
              account.name,
            ]
          )
        ),
      [accounts]
    );

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError(null);

    const amountMinor =
      euroAmountToMinor(
        amount
      );

    if (
      amountMinor === null ||
      amountMinor <= 0
    ) {
      setError(
        "Enter a transfer amount greater than zero."
      );
      return;
    }

    if (
      !fromAccountId ||
      !toAccountId
    ) {
      setError(
        "Choose both accounts."
      );
      return;
    }

    if (
      fromAccountId ===
      toAccountId
    ) {
      setError(
        "Choose two different accounts."
      );
      return;
    }

    const result =
      onCreate({
        id:
          crypto.randomUUID(),
        fromAccountId,
        toAccountId,
        amountMinor,
        date,
        ...(note.trim()
          ? {
              note:
                note
                  .trim()
                  .slice(
                    0,
                    160
                  ),
            }
          : {}),
      });

    if (
      result.ok === false
    ) {
      setError(
        result.error
      );
      return;
    }

    setAmount("");
    setNote("");
  }

  function handleDelete(
    transferId: string
  ) {
    setError(null);

    const result =
      onDelete(
        transferId
      );

    if (
      result.ok === false
    ) {
      setError(
        result.error
      );
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-900/80 p-5 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <ArrowRightLeft
              size={14}
              className="text-violet-400"
            />
            Account transfers
          </div>

          <h2 className="mt-2 text-lg font-semibold text-white">
            Move money without creating income or expenses
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
            Transfers update both account balances, but they stay outside your spending, income and savings-rate calculations.
          </p>
        </div>

        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-3 py-2 text-xs font-medium text-violet-300">
          Net worth unchanged
        </div>
      </div>

      {accounts.length < 2 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-zinc-950/50 p-5 text-sm leading-6 text-zinc-500">
          Add at least two accounts before creating a transfer.
        </div>
      ) : (
        <form
          onSubmit={
            handleSubmit
          }
          className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_auto_1fr_0.8fr_1fr_auto]"
        >
          <div>
            <label
              htmlFor="transfer-from"
              className="mb-1.5 block text-xs font-medium text-zinc-500"
            >
              From
            </label>

            <select
              id="transfer-from"
              value={
                fromAccountId
              }
              onChange={(
                event
              ) =>
                setFromAccountId(
                  event.target
                    .value
                )
              }
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition focus:border-violet-500/50"
            >
              {accounts.map(
                (account) => (
                  <option
                    key={
                      account.id
                    }
                    value={
                      account.id
                    }
                  >
                    {
                      account.name
                    }{" "}
                    (
                    {formatMinor(
                      account.balanceMinor
                    )}
                    )
                  </option>
                )
              )}
            </select>
          </div>

          <div className="hidden items-end pb-3 text-zinc-700 xl:flex">
            →
          </div>

          <div>
            <label
              htmlFor="transfer-to"
              className="mb-1.5 block text-xs font-medium text-zinc-500"
            >
              To
            </label>

            <select
              id="transfer-to"
              value={
                toAccountId
              }
              onChange={(
                event
              ) =>
                setToAccountId(
                  event.target
                    .value
                )
              }
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition focus:border-violet-500/50"
            >
              {accounts.map(
                (account) => (
                  <option
                    key={
                      account.id
                    }
                    value={
                      account.id
                    }
                  >
                    {
                      account.name
                    }{" "}
                    (
                    {formatMinor(
                      account.balanceMinor
                    )}
                    )
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="transfer-amount"
              className="mb-1.5 block text-xs font-medium text-zinc-500"
            >
              Amount
            </label>

            <div className="flex h-11 rounded-xl border border-white/10 bg-zinc-950 focus-within:border-violet-500/50">
              <span className="flex items-center border-r border-white/10 px-3 text-zinc-500">
                {
                  CURRENCY_SYMBOL
                }
              </span>

              <input
                id="transfer-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(
                  event
                ) =>
                  setAmount(
                    event.target
                      .value
                  )
                }
                placeholder="0.00"
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-zinc-700"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="transfer-date"
              className="mb-1.5 block text-xs font-medium text-zinc-500"
            >
              Date
            </label>

            <input
              id="transfer-date"
              type="date"
              value={date}
              onChange={(
                event
              ) =>
                setDate(
                  event.target
                    .value
                )
              }
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition focus:border-violet-500/50"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500 xl:w-auto"
            >
              <ArrowRightLeft
                size={15}
              />
              Transfer
            </button>
          </div>

          <div className="md:col-span-2 xl:col-span-6">
            <label
              htmlFor="transfer-note"
              className="mb-1.5 block text-xs font-medium text-zinc-500"
            >
              Note{" "}
              <span className="text-zinc-700">
                optional
              </span>
            </label>

            <input
              id="transfer-note"
              type="text"
              maxLength={160}
              value={note}
              onChange={(
                event
              ) =>
                setNote(
                  event.target
                    .value
                )
              }
              placeholder="For example: Move money to savings"
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/50"
            />
          </div>
        </form>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2.5 text-xs leading-5 text-red-300">
          {error}
        </div>
      )}

      {recentTransfers.length >
        0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07]">
          <div className="border-b border-white/[0.07] bg-zinc-950/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-600">
            Recent transfers
          </div>

          <div className="divide-y divide-white/[0.06]">
            {recentTransfers.map(
              (transfer) => (
                <div
                  key={
                    transfer.id
                  }
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {
                        accountNames.get(
                          transfer.fromAccountId
                        ) ??
                        "Unknown account"
                      }{" "}
                      <span className="text-zinc-600">
                        →
                      </span>{" "}
                      {
                        accountNames.get(
                          transfer.toAccountId
                        ) ??
                        "Unknown account"
                      }
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {
                        transfer.date
                      }
                      {transfer.note
                        ? ` · ${transfer.note}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-sm font-bold text-violet-300">
                      {formatMinor(
                        transfer.amountMinor
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          transfer.id
                        )
                      }
                      aria-label="Delete transfer"
                      title="Delete transfer and reverse its balance movement"
                      className="rounded-lg border border-red-500/20 bg-red-500/[0.05] p-2 text-red-400 transition hover:bg-red-500/[0.12]"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}
