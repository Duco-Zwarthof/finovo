"use client";

import {
  CheckCircle2,
  Download,
  HardDriveDownload,
  ShieldCheck,
} from "lucide-react";
import {
  useState,
} from "react";

import {
  createFinovoBackupFilename,
  createFinovoLocalBackup,
  serializeFinovoLocalBackup,
} from "@/lib/local-backup";

export default function DataExportCard() {
  const [message, setMessage] =
    useState<string | null>(null);

  function handleExport() {
    try {
      const backup =
        createFinovoLocalBackup(
          window.localStorage
        );

      const serialized =
        serializeFinovoLocalBackup(
          backup
        );

      const blob = new Blob(
        [serialized],
        {
          type:
            "application/json;charset=utf-8",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      const filename =
        createFinovoBackupFilename(
          backup.exportedAt
        );

      anchor.href = url;
      anchor.download = filename;

      document.body.appendChild(
        anchor
      );
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);

      setMessage(
        `Backup downloaded as ${filename}.`
      );
    } catch {
      setMessage(
        "Finovo could not create the backup."
      );
    }
  }

  return (
    <article className="rounded-[2rem] border border-white/10 bg-zinc-900 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <HardDriveDownload
              size={17}
            />
            Local backup
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
            Export your Finovo data
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Download a JSON backup of
            Finovo data stored in this
            browser. The file stays on
            your device unless you move
            or upload it somewhere else.
          </p>
        </div>

        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 sm:flex">
          <Download size={21} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-emerald-400"
          />

          <div>
            <p className="text-sm font-semibold text-emerald-200">
              Local-first export
            </p>

            <p className="mt-1 text-sm leading-6 text-zinc-400">
              Exporting does not send
              your financial data to a
              Finovo server. Only
              browser values whose keys
              begin with
              <code className="mx-1 rounded bg-black/20 px-1.5 py-0.5 text-xs text-zinc-300">
                finovo-
              </code>
              are included.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleExport}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
      >
        <Download size={17} />
        Download backup
      </button>

      {message && (
        <div
          role="status"
          className="mt-4 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-zinc-300"
        >
          <CheckCircle2
            size={17}
            className="mt-1 shrink-0 text-emerald-400"
          />
          {message}
        </div>
      )}
    </article>
  );
}
