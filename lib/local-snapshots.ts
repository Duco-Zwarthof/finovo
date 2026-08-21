import {
  collectFinovoStorageEntries,
  restoreFinovoLocalBackup,
  type LocalBackupWritableStorage,
} from "./local-backup";

export const LOCAL_SNAPSHOT_STORAGE_KEY =
  "__finovo-local-snapshots-v1";

export const LOCAL_SNAPSHOT_VERSION =
  1 as const;

export const MAX_LOCAL_SNAPSHOTS =
  5;

export type FinovoLocalSnapshot = {
  id: string;
  version: typeof LOCAL_SNAPSHOT_VERSION;
  createdAt: string;
  entries: Record<string, string>;
};

type PersistedLocalSnapshotsV1 = {
  version: typeof LOCAL_SNAPSHOT_VERSION;
  snapshots: FinovoLocalSnapshot[];
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isValidDate(
  value: string
): boolean {
  return Number.isFinite(
    Date.parse(value)
  );
}

function validateEntries(
  value: unknown
): Record<string, string> | null {
  if (!isRecord(value)) {
    return null;
  }

  const entries: Record<string, string> = {};

  for (
    const [key, entryValue]
    of Object.entries(value)
  ) {
    if (
      !key.startsWith("finovo-") ||
      typeof entryValue !== "string"
    ) {
      return null;
    }

    entries[key] = entryValue;
  }

  return Object.fromEntries(
    Object.entries(entries).sort(
      ([firstKey], [secondKey]) =>
        firstKey.localeCompare(secondKey)
    )
  );
}

function validateSnapshot(
  value: unknown
): FinovoLocalSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    value.version !==
      LOCAL_SNAPSHOT_VERSION ||
    typeof value.createdAt !==
      "string" ||
    !isValidDate(value.createdAt)
  ) {
    return null;
  }

  const entries =
    validateEntries(value.entries);

  if (entries === null) {
    return null;
  }

  return {
    id: value.id,
    version:
      LOCAL_SNAPSHOT_VERSION,
    createdAt: value.createdAt,
    entries,
  };
}

function serializeEntries(
  entries: Record<string, string>
): string {
  return JSON.stringify(entries);
}

export function readLocalSnapshots(
  storage: Pick<
    Storage,
    "getItem"
  >
): FinovoLocalSnapshot[] {
  let rawValue: string | null;

  try {
    rawValue =
      storage.getItem(
        LOCAL_SNAPSHOT_STORAGE_KEY
      );
  } catch {
    return [];
  }

  if (rawValue === null) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(rawValue);
  } catch {
    return [];
  }

  if (
    !isRecord(parsed) ||
    parsed.version !==
      LOCAL_SNAPSHOT_VERSION ||
    !Array.isArray(
      parsed.snapshots
    )
  ) {
    return [];
  }

  const snapshots =
    parsed.snapshots
      .map(validateSnapshot)
      .filter(
        (
          snapshot
        ): snapshot is FinovoLocalSnapshot =>
          snapshot !== null
      );

  return snapshots
    .sort(
      (first, second) =>
        Date.parse(
          second.createdAt
        ) -
        Date.parse(
          first.createdAt
        )
    )
    .slice(
      0,
      MAX_LOCAL_SNAPSHOTS
    );
}

function writeLocalSnapshots(
  storage: Pick<
    Storage,
    "setItem"
  >,
  snapshots: FinovoLocalSnapshot[]
): void {
  const payload: PersistedLocalSnapshotsV1 = {
    version:
      LOCAL_SNAPSHOT_VERSION,
    snapshots:
      snapshots.slice(
        0,
        MAX_LOCAL_SNAPSHOTS
      ),
  };

  storage.setItem(
    LOCAL_SNAPSHOT_STORAGE_KEY,
    JSON.stringify(payload)
  );
}

export function createAutomaticLocalSnapshot(
  storage: LocalBackupWritableStorage,
  createdAt =
    new Date().toISOString()
): FinovoLocalSnapshot | null {
  if (!isValidDate(createdAt)) {
    throw new TypeError(
      "Snapshot creation date must be valid"
    );
  }

  const entries =
    collectFinovoStorageEntries(
      storage
    );

  if (
    Object.keys(entries).length === 0
  ) {
    return null;
  }

  const existing =
    readLocalSnapshots(storage);

  const latest =
    existing[0] ?? null;

  if (
    latest !== null &&
    serializeEntries(
      latest.entries
    ) ===
      serializeEntries(entries)
  ) {
    return null;
  }

  const snapshot: FinovoLocalSnapshot = {
    id: `snapshot-${createdAt}`,
    version:
      LOCAL_SNAPSHOT_VERSION,
    createdAt,
    entries,
  };

  writeLocalSnapshots(
    storage,
    [
      snapshot,
      ...existing,
    ]
  );

  return snapshot;
}

export function restoreLocalSnapshot(
  storage: LocalBackupWritableStorage,
  snapshot: FinovoLocalSnapshot
): void {
  const validated =
    validateSnapshot(snapshot);

  if (validated === null) {
    throw new TypeError(
      "Snapshot is invalid"
    );
  }

  restoreFinovoLocalBackup(
    storage,
    {
      version: 1,
      exportedAt:
        validated.createdAt,
      entries:
        validated.entries,
    }
  );
}
