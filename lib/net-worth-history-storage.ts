import type {
  NetWorthSnapshot,
} from "./net-worth-history-types";
import {
  isValidNetWorthSnapshot,
  sortNetWorthSnapshots,
} from "./net-worth-history";
import type {
  StorageLike,
  StorageWriteResult,
} from "./storage";

export const NET_WORTH_HISTORY_STORAGE_KEY =
  "finovo-net-worth-history";

export const NET_WORTH_HISTORY_STORAGE_VERSION =
  1 as const;

export type PersistedNetWorthHistoryDataV1 = {
  version:
    typeof NET_WORTH_HISTORY_STORAGE_VERSION;
  snapshots: NetWorthSnapshot[];
};

export type NetWorthHistoryStorageReadStatus =
  | "missing"
  | "valid"
  | "invalid"
  | "unsupported"
  | "unavailable";

export type NetWorthHistoryStorageReadResult = {
  value: NetWorthSnapshot[];
  status:
    NetWorthHistoryStorageReadStatus;
};

function getBrowserStorage():
  | StorageLike
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function cloneSnapshots(
  snapshots: readonly NetWorthSnapshot[]
): NetWorthSnapshot[] {
  return snapshots.map((snapshot) => ({
    ...snapshot,
  }));
}

export function createPersistedNetWorthHistoryDataV1(
  snapshots: readonly NetWorthSnapshot[]
): PersistedNetWorthHistoryDataV1 {
  const ids = new Set<string>();
  const dates = new Set<string>();

  for (const snapshot of snapshots) {
    if (
      !isValidNetWorthSnapshot(snapshot) ||
      ids.has(snapshot.id) ||
      dates.has(snapshot.date)
    ) {
      throw new TypeError(
        "Cannot persist invalid or duplicate net worth snapshots"
      );
    }

    ids.add(snapshot.id);
    dates.add(snapshot.date);
  }

  return {
    version:
      NET_WORTH_HISTORY_STORAGE_VERSION,
    snapshots:
      sortNetWorthSnapshots(snapshots),
  };
}

export function validatePersistedNetWorthHistoryDataV1(
  value: unknown
): NetWorthSnapshot[] | null {
  if (
    !isRecord(value) ||
    value.version !==
      NET_WORTH_HISTORY_STORAGE_VERSION ||
    !Array.isArray(value.snapshots)
  ) {
    return null;
  }

  const snapshots: NetWorthSnapshot[] = [];
  const ids = new Set<string>();
  const dates = new Set<string>();

  for (const entry of value.snapshots) {
    if (
      !isValidNetWorthSnapshot(entry) ||
      ids.has(entry.id) ||
      dates.has(entry.date)
    ) {
      return null;
    }

    ids.add(entry.id);
    dates.add(entry.date);
    snapshots.push({ ...entry });
  }

  return sortNetWorthSnapshots(snapshots);
}

export function readStoredNetWorthHistory(
  fallback: readonly NetWorthSnapshot[] = [],
  storage: StorageLike | null =
    getBrowserStorage()
): NetWorthHistoryStorageReadResult {
  const fallbackValue = () =>
    sortNetWorthSnapshots(
      cloneSnapshots(fallback)
    );

  if (!storage) {
    return {
      value: fallbackValue(),
      status: "unavailable",
    };
  }

  let storedValue: string | null;

  try {
    storedValue = storage.getItem(
      NET_WORTH_HISTORY_STORAGE_KEY
    );
  } catch {
    return {
      value: fallbackValue(),
      status: "unavailable",
    };
  }

  if (storedValue === null) {
    return {
      value: fallbackValue(),
      status: "missing",
    };
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(
      storedValue
    ) as unknown;
  } catch {
    return {
      value: fallbackValue(),
      status: "invalid",
    };
  }

  if (
    isRecord(parsedValue) &&
    "version" in parsedValue &&
    parsedValue.version !==
      NET_WORTH_HISTORY_STORAGE_VERSION
  ) {
    return {
      value: fallbackValue(),
      status: "unsupported",
    };
  }

  const snapshots =
    validatePersistedNetWorthHistoryDataV1(
      parsedValue
    );

  if (!snapshots) {
    return {
      value: fallbackValue(),
      status: "invalid",
    };
  }

  return {
    value: snapshots,
    status: "valid",
  };
}

export function writeStoredNetWorthHistory(
  snapshots: readonly NetWorthSnapshot[],
  storage: StorageLike | null =
    getBrowserStorage()
): StorageWriteResult {
  if (!storage) {
    return { status: "unavailable" };
  }

  let persistedData:
    PersistedNetWorthHistoryDataV1;

  try {
    persistedData =
      createPersistedNetWorthHistoryDataV1(
        snapshots
      );
  } catch {
    return { status: "failed" };
  }

  try {
    storage.setItem(
      NET_WORTH_HISTORY_STORAGE_KEY,
      JSON.stringify(persistedData)
    );

    return { status: "written" };
  } catch {
    return { status: "failed" };
  }
}
