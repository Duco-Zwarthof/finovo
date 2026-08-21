"use client";

import {
  FileJson,
  RotateCcw,
  ShieldAlert,
  Upload,
} from "lucide-react";
import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import {
  parseFinovoLocalBackup,
  restoreFinovoLocalBackup,
  type FinovoLocalBackupV1,
} from "@/lib/local-backup";

type ImportState =
  | {
      status: "idle";
    }
  | {
      status: "ready";
      fileName: string;
      backup: FinovoLocalBackupV1;
    }
  | {
      status: "error";
      message: string;
    }
  | {
      status: "restoring";
      fileName: string;
      backup: FinovoLocalBackupV1;
    };

function formatBackupDate(
  exportedAt: string
) {
  return new Intl.DateTimeFormat(
    "en-IE",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(
    new Date(exportedAt)
  );
}

export default function DataImportCard() {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [state, setState] =
    useState<ImportState>({
      status: "idle",
    });

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const backup =
        parseFinovoLocalBackup(text);

      setState({
        status: "ready",
        fileName: file.name,
        backup,
      });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "This backup could not be read.",
      });
    } finally {
      event.target.value = "";
    }
  }

  function handleRestore() {
    if (
      state.status !== "ready"
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Restore this Finovo backup? Current Finovo data in this browser will be replaced."
      );

    if (!confirmed) {
      return;
    }

    setState({
      status: "restoring",
      fileName: state.fileName,
      backup: state.backup,
    });

    try {
      restoreFinovoLocalBackup(
        window.localStorage,
        state.backup
      );

      window.location.reload();
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "The backup could not be restored.",
      });
    }
  }

  const readyBackup =
    state.status === "ready" ||
    state.status === "restoring"
      ? state.backup
      : null;

  const readyFileName =
    state.status === "ready" ||
    state.status === "restoring"
      ? state.fileName
      : null;

  return (
    <article className="rounded-[2rem] border border-white/10 bg-zinc-900 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-400">
            <RotateCcw size={17} />
            Restore backup
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
            Restore Finovo data
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Select a Finovo JSON backup.
            Finovo validates the file
            before any browser data is
            changed.
          </p>
        </div>

        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 sm:flex">
          <Upload size={21} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-4">
        <div className="flex items-start gap-3">
          <ShieldAlert
            size={18}
            className="mt-0.5 shrink-0 text-amber-400"
          />

          <div>
            <p className="text-sm font-semibold text-amber-200">
              Existing local data will
              be replaced
            </p>

            <p className="mt-1 text-sm leading-6 text-zinc-400">
              Restoring replaces current
              Finovo browser data with
              the values contained in
              the selected backup. Other
              websites&apos; local
              storage is never touched.
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={
          handleFileChange
        }
        className="hidden"
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={
            state.status ===
            "restoring"
          }
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileJson size={17} />
          Choose backup file
        </button>

        {state.status ===
          "ready" && (
          <button
            type="button"
            onClick={handleRestore}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
          >
            <RotateCcw size={17} />
            Restore backup
          </button>
        )}
      </div>

      {readyBackup &&
        readyFileName && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                File
              </p>
              <p className="mt-2 break-all text-sm font-medium text-zinc-300">
                {readyFileName}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Created
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-300">
                {formatBackupDate(
                  readyBackup.exportedAt
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Data entries
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-300">
                {
                  Object.keys(
                    readyBackup.entries
                  ).length
                }
              </p>
            </div>
          </div>
        )}

      {state.status ===
        "restoring" && (
        <p
          role="status"
          className="mt-5 text-sm text-violet-300"
        >
          Restoring backup…
        </p>
      )}

      {state.status ===
        "error" && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-sm leading-6 text-red-200"
        >
          {state.message}
        </div>
      )}
    </article>
  );
}
