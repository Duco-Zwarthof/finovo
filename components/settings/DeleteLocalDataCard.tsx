"use client";

import {
  AlertTriangle,
  DatabaseZap,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  useState,
  useSyncExternalStore,
} from "react";

import {
  countFinovoLocalKeys,
  deleteAllFinovoLocalData,
  LOCAL_DATA_DELETE_CONFIRMATION,
} from "@/lib/local-data-controls";

function subscribeToLocalStorage(
  callback: () => void
) {
  window.addEventListener(
    "storage",
    callback
  );

  window.addEventListener(
    "finovo:local-data-changed",
    callback
  );

  return () => {
    window.removeEventListener(
      "storage",
      callback
    );

    window.removeEventListener(
      "finovo:local-data-changed",
      callback
    );
  };
}

function getLocalDataCountSnapshot() {
  return countFinovoLocalKeys(
    window.localStorage
  );
}

function getServerSnapshot() {
  return 0;
}

export default function DeleteLocalDataCard() {
  const [confirmation, setConfirmation] =
    useState("");

  const [error, setError] =
    useState<string | null>(
      null
    );

  const storedItemCount =
    useSyncExternalStore(
      subscribeToLocalStorage,
      getLocalDataCountSnapshot,
      getServerSnapshot
    );

  const canDelete =
    confirmation.trim() ===
      LOCAL_DATA_DELETE_CONFIRMATION &&
    storedItemCount > 0;

  function handleDelete() {
    if (!canDelete) {
      return;
    }

    const confirmed =
      window.confirm(
        "Permanently delete all Finovo data stored in this browser? This also removes automatic restore points."
      );

    if (!confirmed) {
      return;
    }

    try {
      deleteAllFinovoLocalData(
        window.localStorage
      );

      window.dispatchEvent(
        new Event(
          "finovo:local-data-changed"
        )
      );

      window.location.reload();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Finovo could not remove the local data."
      );
    }
  }

  return (
    <article className="rounded-[2rem] border border-red-500/20 bg-zinc-900 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
            <DatabaseZap size={17} />
            Delete local data
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
            Permanently clear this browser
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Remove Finovo financial
            data, dashboard preferences
            and automatic restore points
            stored in this browser.
          </p>
        </div>

        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 sm:flex">
          <Trash2 size={21} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-amber-400"
            />

            <div>
              <p className="text-sm font-semibold text-amber-200">
                This cannot be undone
                inside Finovo
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Download a backup first
                if you may want the data
                again later.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <div>
              <p className="text-sm font-semibold text-emerald-200">
                Only Finovo data
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Other websites&apos;
                browser storage is not
                removed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/50 p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-400">
            Finovo local storage items
          </p>

          <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs font-semibold text-zinc-300">
            {storedItemCount}
          </span>
        </div>
      </div>

      {storedItemCount > 0 ? (
        <>
          <label className="mt-6 block">
            <span className="text-sm font-medium text-zinc-300">
              Type{" "}
              <span className="font-bold text-red-300">
                {
                  LOCAL_DATA_DELETE_CONFIRMATION
                }
              </span>{" "}
              to confirm
            </span>

            <input
              value={confirmation}
              onChange={(event) => {
                setConfirmation(
                  event.target.value
                );

                if (error) {
                  setError(null);
                }
              }}
              autoComplete="off"
              spellCheck={false}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-red-500/50"
              placeholder={
                LOCAL_DATA_DELETE_CONFIRMATION
              }
            />
          </label>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={17} />
            Delete all local data
          </button>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-5 py-6 text-center">
          <p className="text-sm font-medium text-zinc-300">
            No Finovo local data found
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            There is currently nothing
            to remove from this browser.
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-sm leading-6 text-red-200"
        >
          {error}
        </div>
      )}
    </article>
  );
}
