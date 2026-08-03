import type {
  NetWorthHistorySummary,
  NetWorthSnapshot,
} from "./net-worth-history-types";
import { isValidAmountMinor } from "./transaction-amount";

export function isValidSnapshotDate(
  value: unknown
): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const [yearText, monthText, dayText] =
    value.split("-");

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidNetWorthSnapshot(
  value: unknown
): value is NetWorthSnapshot {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const snapshot =
    value as Record<string, unknown>;

  return (
    typeof snapshot.id === "string" &&
    snapshot.id.trim().length > 0 &&
    isValidSnapshotDate(snapshot.date) &&
    isValidAmountMinor(
      snapshot.netWorthMinor
    )
  );
}

function cloneSnapshots(
  snapshots: readonly NetWorthSnapshot[]
): NetWorthSnapshot[] {
  return snapshots.map((snapshot) => ({
    ...snapshot,
  }));
}

function compareSnapshots(
  first: NetWorthSnapshot,
  second: NetWorthSnapshot
): number {
  return (
    first.date.localeCompare(second.date) ||
    first.id.localeCompare(second.id)
  );
}

export function sortNetWorthSnapshots(
  snapshots: readonly NetWorthSnapshot[]
): NetWorthSnapshot[] {
  return cloneSnapshots(snapshots).sort(
    compareSnapshots
  );
}

export function upsertDailyNetWorthSnapshot(
  snapshots: readonly NetWorthSnapshot[],
  snapshot: NetWorthSnapshot
): NetWorthSnapshot[] {
  if (!isValidNetWorthSnapshot(snapshot)) {
    throw new TypeError(
      "Cannot save an invalid net worth snapshot"
    );
  }

  const sameDateIndex =
    snapshots.findIndex(
      (existing) =>
        existing.date === snapshot.date
    );

  if (sameDateIndex === -1) {
    return sortNetWorthSnapshots([
      ...snapshots,
      { ...snapshot },
    ]);
  }

  return sortNetWorthSnapshots(
    snapshots.map((existing, index) =>
      index === sameDateIndex
        ? { ...snapshot }
        : { ...existing }
    )
  );
}

export function deleteNetWorthSnapshot(
  snapshots: readonly NetWorthSnapshot[],
  snapshotId: string
): NetWorthSnapshot[] {
  return snapshots
    .filter(
      (snapshot) =>
        snapshot.id !== snapshotId
    )
    .map((snapshot) => ({
      ...snapshot,
    }));
}

export function calculateNetWorthHistorySummary(
  snapshots: readonly NetWorthSnapshot[]
): NetWorthHistorySummary {
  if (snapshots.length === 0) {
    return {
      firstSnapshot: null,
      latestSnapshot: null,
      changeMinor: 0,
      changePercentage: null,
      highestSnapshot: null,
      lowestSnapshot: null,
    };
  }

  const sorted =
    sortNetWorthSnapshots(snapshots);

  const firstSnapshot = sorted[0];
  const latestSnapshot =
    sorted[sorted.length - 1];

  const changeMinor =
    latestSnapshot.netWorthMinor -
    firstSnapshot.netWorthMinor;

  const changePercentage =
    firstSnapshot.netWorthMinor === 0
      ? null
      : (changeMinor /
          Math.abs(
            firstSnapshot.netWorthMinor
          )) *
        100;

  const highestSnapshot = sorted.reduce(
    (highest, snapshot) =>
      snapshot.netWorthMinor >
      highest.netWorthMinor
        ? snapshot
        : highest,
    sorted[0]
  );

  const lowestSnapshot = sorted.reduce(
    (lowest, snapshot) =>
      snapshot.netWorthMinor <
      lowest.netWorthMinor
        ? snapshot
        : lowest,
    sorted[0]
  );

  return {
    firstSnapshot: { ...firstSnapshot },
    latestSnapshot: {
      ...latestSnapshot,
    },
    changeMinor,
    changePercentage,
    highestSnapshot: {
      ...highestSnapshot,
    },
    lowestSnapshot: {
      ...lowestSnapshot,
    },
  };
}
