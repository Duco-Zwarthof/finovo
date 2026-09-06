"use client";

import {
  useRef,
  useState,
} from "react";
import {
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";

import {
  parseTransactionsCsv,
  serializeTransactionsToCsv,
  type TransactionCsvParseResult,
} from "@/lib/transaction-csv";
import type {
  Transaction,
} from "@/lib/types";

type TransactionCsvToolsProps = {
  transactions: readonly Transaction[];
  onImport: (
    transactions: Transaction[],
    parseResult: TransactionCsvParseResult
  ) => {
    addedCount: number;
    duplicateCount: number;
  };
};

type ImportMessage = {
  tone: "success" | "warning" | "error";
  text: string;
} | null;

function downloadTextFile(
  filename: string,
  text: string
) {
  const blob = new Blob(
    [text],
    {
      type:
        "text/csv;charset=utf-8",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

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
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `finovo-transactions-${year}-${month}-${day}.csv`;
}

export default function TransactionCsvTools({
  transactions,
  onImport,
}: TransactionCsvToolsProps) {
  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [
    message,
    setMessage,
  ] =
    useState<ImportMessage>(
      null
    );

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

    const text =
      await file.text();

    const parseResult =
      parseTransactionsCsv(
        text
      );

    if (
      parseResult.transactions
        .length === 0
    ) {
      setMessage({
        tone: "error",
        text:
          parseResult.errors[0] ??
          "No valid transactions were found in this file.",
      });
      return;
    }

    const mergeResult =
      onImport(
        parseResult.transactions,
        parseResult
      );

    const parts = [
      `Added ${mergeResult.addedCount} transaction${
        mergeResult.addedCount === 1
          ? ""
          : "s"
      }.`,
    ];

    if (
      mergeResult.duplicateCount >
      0
    ) {
      parts.push(
        `${mergeResult.duplicateCount} duplicate${
          mergeResult.duplicateCount ===
          1
            ? ""
            : "s"
        } skipped.`
      );
    }

    if (
      parseResult.skippedRows >
      0
    ) {
      parts.push(
        `${parseResult.skippedRows} invalid row${
          parseResult.skippedRows ===
          1
            ? ""
            : "s"
        } skipped.`
      );
    }

    setMessage({
      tone:
        parseResult.skippedRows >
          0 ||
        mergeResult.duplicateCount >
          0
          ? "warning"
          : "success",
      text: parts.join(" "),
    });

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }
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
            Local data tools
          </div>

          <p className="mt-2 text-sm font-semibold text-white">
            Import or export transactions as CSV
          </p>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-600">
            Finovo expects date, title, type, category and amount columns.
            Import runs locally in your browser and exact duplicates are skipped.
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
            <Upload size={14} />
            Import CSV
          </button>

          <button
            type="button"
            disabled={
              transactions.length ===
              0
            }
            onClick={exportCsv}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/[0.08] px-4 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download
              size={14}
            />
            Export CSV
          </button>
        </div>
      </div>

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
          {message.text}
        </div>
      )}
    </section>
  );
}
