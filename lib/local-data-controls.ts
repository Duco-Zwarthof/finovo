import {
  FINOVO_STORAGE_PREFIX,
  type LocalBackupWritableStorage,
} from "./local-backup";
import {
  LOCAL_SNAPSHOT_STORAGE_KEY,
} from "./local-snapshots";

export const LOCAL_DATA_DELETE_CONFIRMATION =
  "DELETE";

export type LocalDataDeleteResult = {
  removedKeys: string[];
};

function collectFinovoLocalKeys(
  storage: Pick<
    LocalBackupWritableStorage,
    "length" | "key"
  >
): string[] {
  const keys: string[] = [];

  for (
    let index = 0;
    index < storage.length;
    index += 1
  ) {
    const key = storage.key(index);

    if (key === null) {
      continue;
    }

    if (
      key.startsWith(
        FINOVO_STORAGE_PREFIX
      ) ||
      key ===
        LOCAL_SNAPSHOT_STORAGE_KEY
    ) {
      keys.push(key);
    }
  }

  return keys.sort(
    (first, second) =>
      first.localeCompare(second)
  );
}

export function countFinovoLocalKeys(
  storage: Pick<
    LocalBackupWritableStorage,
    "length" | "key"
  >
): number {
  return collectFinovoLocalKeys(
    storage
  ).length;
}

export function deleteAllFinovoLocalData(
  storage: Pick<
    LocalBackupWritableStorage,
    "length" | "key" | "removeItem"
  >
): LocalDataDeleteResult {
  const keys =
    collectFinovoLocalKeys(
      storage
    );

  const removedKeys: string[] = [];

  try {
    for (const key of keys) {
      storage.removeItem(key);
      removedKeys.push(key);
    }
  } catch {
    throw new Error(
      "Finovo could not remove all local data. Some browser data may still remain."
    );
  }

  return {
    removedKeys,
  };
}
