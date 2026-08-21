"use client";

import {
  Clock3,
  History,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import {
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import {
  LOCAL_SNAPSHOT_STORAGE_KEY,
  readLocalSnapshots,
  restoreLocalSnapshot,
} from "@/lib/local-snapshots";

function subscribe(
  callback: () => void
) {
  window.addEventListener(
    "storage",
    callback
  );

  window.addEventListener(
    "finovo:snapshots-changed",
    callback
  );

  return () => {
    window.removeEventListener(
      "storage",
      callback
    );

    window.removeEventListener(
      "finovo:snapshots-changed",
      callback
    );
  };
}

function getSnapshot() {
  return (
    window.localStorage.getItem(
      LOCAL_SNAPSHOT_STORAGE_KEY
    ) ?? ""
  );
}

function getServerSnapshot() {
  return "";
}

function formatSnapshotDate(
  createdAt: string
) {
  return new Intl.DateTimeFormat(
    "en-IE",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(
    new Date(createdAt)
  );
}

export default function LocalSnapshotsCard() {
  const rawSnapshots =
    useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const snapshots =
    useMemo(() => {
      if (rawSnapshots === "") {
        return [];
      }

      return readLocalSnapshots(
        window.localStorage
      );
    }, [rawSnapshots]);

  const selectedSnapshot =
    selectedId === null
      ? null
      : snapshots.find(
          (item) =>
            item.id === selectedId
        ) ?? null;

  function handleRestoreConfirm() {
    if (!selectedSnapshot) {
      return;
    }

    try {
      restoreLocalSnapshot(
        window.localStorage,
        selectedSnapshot
      );

      window.location.reload();
    } catch (caughtError) {
      setSelectedId(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The snapshot could not be restored."
      );
    }
  }

  return (
    <>
      <article className="rounded-[2rem] border border-white/10 bg-zinc-900 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
              <History size={17} />
              Automatic restore points
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
              Restore a previous version
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Finovo automatically keeps
              up to five recent local
              snapshots when your saved
              financial data changes.
            </p>
          </div>

          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 sm:flex">
            <Clock3 size={21} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <p className="text-sm leading-6 text-zinc-400">
              Restore points stay in this
              browser. They are not sent
              to a Finovo server.
            </p>
          </div>
        </div>

        {snapshots.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-5 py-7 text-center">
            <p className="text-sm font-medium text-zinc-300">
              No restore points yet
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Finovo will create one
              automatically after local
              financial data is available.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {snapshots.map(
              (
                snapshot,
                index
              ) => (
                <div
                  key={snapshot.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">
                        {formatSnapshotDate(
                          snapshot.createdAt
                        )}
                      </p>

                      {index === 0 && (
                        <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-300">
                          Latest
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-zinc-500">
                      {
                        Object.keys(
                          snapshot.entries
                        ).length
                      }{" "}
                      local data entries
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSelectedId(
                        snapshot.id
                      );
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-cyan-500/25 hover:bg-cyan-500/[0.06] hover:text-white"
                  >
                    <RotateCcw
                      size={15}
                    />
                    Restore
                  </button>
                </div>
              )
            )}
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

      <ConfirmationDialog
        open={
          selectedSnapshot !== null
        }
        title="Restore this version?"
        description={
          selectedSnapshot
            ? `Finovo will restore your local data to ${formatSnapshotDate(
                selectedSnapshot.createdAt
              )}. Your current Finovo data in this browser will be replaced.`
            : ""
        }
        confirmLabel="Restore version"
        tone="warning"
        onCancel={() =>
          setSelectedId(null)
        }
        onConfirm={
          handleRestoreConfirm
        }
      />
    </>
  );
}
