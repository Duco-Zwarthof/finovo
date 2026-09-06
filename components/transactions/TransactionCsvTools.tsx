"use client";

import {
  useRef,
  useState,
} from "react";
import {
  Check,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

import type {
  Account,
} from "@/lib/account-types";
import {
  parseBankTransactionsCsv,
} from "@/lib/bank-import";
import {
  createLearnedCategoryRule,
} from "@/lib/transaction-categorization";
import {
  readTransactionCategoryRules,
  saveTransactionCategoryRule,
} from "@/lib/transaction-category-rules";
import {
  mergeImportedTransactions,
  parseTransactionsCsv,
  serializeTransactionsToCsv,
} from "@/lib/transaction-csv";
import {
  formatCurrency,
} from "@/lib/money";
import {
  minorUnitsToEuroAmount,
} from "@/lib/transaction-amount";
import {
  assignAccountToTransactions,
} from "@/lib/transaction-accounts";
import {
  TRANSACTION_CATEGORIES,
  type Transaction,
  type TransactionCategory,
} from "@/lib/types";

type TransactionCsvToolsProps = {
  transactions:
    readonly Transaction[];
  accounts?: readonly Account[];
  onImport: (
    transactions: Transaction[]
  ) => {
    addedCount: number;
    duplicateCount: number;
  };
};

type PendingImport = {
  source: string;
  transactions: Transaction[];
  originalCategories: Record<
    string,
    TransactionCategory
  >;
  skippedRows: number;
  errors: string[];
  newCount: number;
  duplicateCount: number;
};

type ImportMessage = {
  tone:
    | "success"
    | "warning"
    | "error";
  text: string;
} | null;

function formatMinor(
  amountMinor: number
) {
  return formatCurrency(
    minorUnitsToEuroAmount(
      amountMinor
    ) ?? 0
  );
}

function downloadTextFile(
  filename: string,
  text: string
) {
  const blob =
    new Blob(
      [text],
      {
        type:
          "text/csv;charset=utf-8",
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const anchor =
    document.createElement(
      "a"
    );

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(
    url
  );
}

function createExportFilename() {
  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `finovo-transactions-${year}-${month}-${day}.csv`;
}

export default function TransactionCsvTools({
  transactions,
  accounts = [],
  onImport,
}: TransactionCsvToolsProps) {
  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [
    pending,
    setPending,
  ] =
    useState<PendingImport | null>(
      null
    );

  const [
    message,
    setMessage,
  ] =
    useState<ImportMessage>(
      null
    );

  const [
    importAccountId,
    setImportAccountId,
  ] = useState("");

  function exportCsv() {
    if (
      transactions.length === 0
    ) {
      return;
    }

    downloadTextFile(
      createExportFilename(),
      serializeTransactionsToCsv(
        transactions
      )
    );

    setMessage({
      tone: "success",
      text: `Exported ${transactions.length} transaction${
        transactions.length === 1
          ? ""
          : "s"
      }.`,
    });
  }

  async function handleFile(
    file: File | undefined
  ) {
    if (!file) {
      return;
    }

    setMessage(null);

    const text =
      await file.text();

    const finovoResult =
      parseTransactionsCsv(
        text
      );

    const isFinovoCsv =
      finovoResult.transactions
        .length > 0 &&
      finovoResult.errors
        .length === 0;

    const bankResult =
      isFinovoCsv
        ? null
        : parseBankTransactionsCsv(
            text,
            {
              categoryRules:
                readTransactionCategoryRules(),
            }
          );

    const parsedTransactions =
      isFinovoCsv
        ? finovoResult.transactions
        : bankResult
            ?.transactions ??
          [];

    const skippedRows =
      isFinovoCsv
        ? finovoResult.skippedRows
        : bankResult
            ?.skippedRows ??
          0;

    const errors =
      isFinovoCsv
        ? finovoResult.errors
        : bankResult?.errors ??
          [];

    const source =
      isFinovoCsv
        ? "Finovo CSV"
        : bankResult?.bank ??
          "Bank CSV";

    if (
      parsedTransactions.length ===
      0
    ) {
      setPending(null);

      setMessage({
        tone: "error",
        text:
          errors[0] ??
          "No valid transactions were found in this file.",
      });

      if (inputRef.current) {
        inputRef.current.value =
          "";
      }

      return;
    }

    const previewMerge =
      mergeImportedTransactions(
        transactions,
        parsedTransactions
      );

    setImportAccountId(
      (current) => {
        if (isFinovoCsv) {
          return "";
        }

        if (
          accounts.some(
            (account) =>
              account.id ===
              current
          )
        ) {
          return current;
        }

        return accounts.length ===
          1
          ? accounts[0].id
          : "";
      }
    );

    setPending({
      source,
      transactions:
        parsedTransactions,
      originalCategories:
        Object.fromEntries(
          parsedTransactions.map(
            (transaction) => [
              transaction.id,
              transaction.category,
            ]
          )
        ),
      skippedRows,
      errors,
      newCount:
        previewMerge.addedCount,
      duplicateCount:
        previewMerge
          .duplicateCount,
    });

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }
  }

  function updatePendingCategory(
    transactionId: string,
    category: TransactionCategory
  ) {
    setPending(
      (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          transactions:
            current.transactions.map(
              (transaction) =>
                transaction.id ===
                transactionId
                  ? {
                      ...transaction,
                      category,
                    }
                  : transaction
            ),
        };
      }
    );
  }

  function cancelImport() {
    setPending(null);
  }

  function confirmImport() {
    if (!pending) {
      return;
    }

    for (const transaction of pending.transactions) {
      const originalCategory =
        pending.originalCategories[
          transaction.id
        ];

      if (
        originalCategory &&
        originalCategory !==
          transaction.category
      ) {
        const rule =
          createLearnedCategoryRule(
            transaction.title,
            transaction.category,
            transaction.type
          );

        if (rule) {
          saveTransactionCategoryRule(
            rule
          );
        }
      }
    }

    const transactionsToImport =
      importAccountId
        ? assignAccountToTransactions(
            pending.transactions,
            importAccountId
          )
        : pending.transactions;

    const result =
      onImport(
        transactionsToImport
      );

    const parts = [
      `Added ${result.addedCount} transaction${
        result.addedCount === 1
          ? ""
          : "s"
      }.`,
    ];

    if (
      result.duplicateCount >
      0
    ) {
      parts.push(
        `${result.duplicateCount} duplicate${
          result.duplicateCount ===
          1
            ? ""
            : "s"
        } skipped.`
      );
    }

    if (
      pending.skippedRows >
      0
    ) {
      parts.push(
        `${pending.skippedRows} invalid row${
          pending.skippedRows ===
          1
            ? ""
            : "s"
        } skipped.`
      );
    }

    setMessage({
      tone:
        pending.skippedRows >
          0 ||
        result.duplicateCount >
          0
          ? "warning"
          : "success",
      text: parts.join(" "),
    });

    setPending(null);
  }

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <FileSpreadsheet
              size={14}
              className="text-emerald-400"
            />
            Bank import
          </div>

          <p className="mt-2 text-sm font-semibold text-white">
            Import bank transactions with a preview
          </p>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-600">
            Upload a Finovo CSV or a common Dutch bank CSV. Finovo analyses
            the file locally and nothing is saved until you confirm.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) =>
              void handleFile(
                event.target
                  .files?.[0]
              )
            }
          />

          <button
            type="button"
            onClick={() =>
              inputRef.current?.click()
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-4 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            <Upload
              size={14}
            />
            Import bank CSV
          </button>

          <button
            type="button"
            disabled={
              transactions.length ===
              0
            }
            onClick={
              exportCsv
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/[0.08] px-4 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download
              size={14}
            />
            Export CSV
          </button>
        </div>
      </div>

      {pending && (
        <div className="mt-5 rounded-2xl border border-blue-500/20 bg-zinc-950/70 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck
                  size={17}
                  className="text-blue-400"
                />
                Import preview
              </div>

              <p className="mt-1 text-xs text-zinc-500">
                Detected source:{" "}
                <span className="font-semibold text-zinc-300">
                  {
                    pending.source
                  }
                </span>
              </p>

              <div className="mt-3">
                <label
                  htmlFor="bank-import-account"
                  className="mb-1.5 block text-xs font-medium text-zinc-400"
                >
                  Import into account
                </label>

                <select
                  id="bank-import-account"
                  value={
                    importAccountId
                  }
                  onChange={(event) =>
                    setImportAccountId(
                      event.target.value
                    )
                  }
                  className="min-w-56 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 outline-none transition focus:border-blue-500/50"
                >
                  <option value="">
                    File account / unassigned
                  </option>

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
                        }
                      </option>
                    )
                  )}
                </select>

                <p className="mt-1.5 text-[11px] leading-4 text-zinc-600">
                  {accounts.length > 0
                    ? "Choose an account to apply it to every imported transaction, or keep the file account when available."
                    : "Create an account first if you want bank imports linked automatically."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                cancelImport
              }
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs font-semibold text-zinc-400 transition hover:text-white"
            >
              <X size={13} />
              Cancel
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-3">
              <p className="text-xs text-zinc-600">
                Found
              </p>

              <p className="mt-1 text-lg font-bold text-white">
                {
                  pending
                    .transactions
                    .length
                }
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] p-3">
              <p className="text-xs text-zinc-600">
                New
              </p>

              <p className="mt-1 text-lg font-bold text-emerald-400">
                {
                  pending.newCount
                }
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.05] p-3">
              <p className="text-xs text-zinc-600">
                Duplicates
              </p>

              <p className="mt-1 text-lg font-bold text-amber-300">
                {
                  pending
                    .duplicateCount
                }
              </p>
            </div>

            <div className="rounded-xl border border-red-500/15 bg-red-500/[0.05] p-3">
              <p className="text-xs text-zinc-600">
                Invalid
              </p>

              <p className="mt-1 text-lg font-bold text-red-300">
                {
                  pending
                    .skippedRows
                }
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
            <div className="border-b border-white/10 bg-zinc-900 px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
              Transaction preview
            </div>

            <div className="divide-y divide-white/5">
              {pending.transactions
                .slice(0, 8)
                .map(
                  (
                    transaction
                  ) => (
                    <div
                      key={
                        transaction.id
                      }
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {
                            transaction.title
                          }
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-zinc-600">
                            {
                              transaction.date
                            }
                          </span>

                          <select
                            value={
                              transaction.category
                            }
                            onChange={(event) =>
                              updatePendingCategory(
                                transaction.id,
                                event.target
                                  .value as TransactionCategory
                              )
                            }
                            className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-[11px] font-medium text-zinc-300 outline-none transition focus:border-blue-500/50"
                            aria-label={`Category for ${transaction.title}`}
                          >
                            {TRANSACTION_CATEGORIES.map(
                              (
                                category
                              ) => (
                                <option
                                  key={
                                    category
                                  }
                                  value={
                                    category
                                  }
                                >
                                  {
                                    category
                                  }
                                </option>
                              )
                            )}
                          </select>

                          {pending
                            .originalCategories[
                            transaction.id
                          ] !==
                            transaction.category && (
                            <span className="rounded-full border border-violet-500/20 bg-violet-500/[0.08] px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                              Will learn
                            </span>
                          )}
                        </div>
                      </div>

                      <p
                        className={`shrink-0 text-sm font-semibold ${
                          transaction.type ===
                          "income"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}
                        {formatMinor(
                          transaction.amountMinor
                        )}
                      </p>
                    </div>
                  )
                )}
            </div>
          </div>

          {pending.transactions
            .length > 8 && (
            <p className="mt-2 text-xs text-zinc-600">
              Showing the first 8 of{" "}
              {
                pending
                  .transactions
                  .length
              }{" "}
              detected transactions.
            </p>
          )}

          {pending.errors.length >
            0 && (
            <p className="mt-3 text-xs leading-5 text-amber-300">
              {
                pending
                  .errors[0]
              }
            </p>
          )}

          <p className="mt-3 text-xs leading-5 text-zinc-600">
            Choose the destination account and adjust categories before
            confirming. Finovo remembers merchant category corrections locally.
          </p>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={
                pending.newCount ===
                0
              }
              onClick={
                confirmImport
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check
                size={16}
              />
              Confirm import
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mt-4 rounded-xl border px-3 py-2.5 text-xs leading-5 ${
            message.tone ===
            "success"
              ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300"
              : message.tone ===
                  "warning"
                ? "border-amber-500/20 bg-amber-500/[0.07] text-amber-300"
                : "border-red-500/20 bg-red-500/[0.07] text-red-300"
          }`}
        >
          {
            message.text
          }
        </div>
      )}
    </section>
  );
}
