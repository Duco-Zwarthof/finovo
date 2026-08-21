import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createAutomaticLocalSnapshot,
  LOCAL_SNAPSHOT_STORAGE_KEY,
  MAX_LOCAL_SNAPSHOTS,
  readLocalSnapshots,
  restoreLocalSnapshot,
} from "./local-snapshots";
import type {
  LocalBackupWritableStorage,
} from "./local-backup";

function createStorage(
  initialValues: Record<
    string,
    string
  > = {}
) {
  const values =
    new Map(
      Object.entries(initialValues)
    );

  const storage: LocalBackupWritableStorage =
    {
      get length() {
        return values.size;
      },

      key(index) {
        return (
          Array.from(
            values.keys()
          )[index] ?? null
        );
      },

      getItem(key) {
        return (
          values.get(key) ??
          null
        );
      },

      setItem(key, value) {
        values.set(
          key,
          value
        );
      },

      removeItem(key) {
        values.delete(key);
      },
    };

  return {
    storage,
    values,
  };
}

describe("automatic local snapshots", () => {
  it("creates a snapshot from Finovo local data", () => {
    const {
      storage,
    } = createStorage({
      "finovo-accounts":
        "accounts-v1",
      unrelated:
        "ignore-me",
    });

    const snapshot =
      createAutomaticLocalSnapshot(
        storage,
        "2026-08-21T18:00:00.000Z"
      );

    expect(snapshot).toEqual({
      id:
        "snapshot-2026-08-21T18:00:00.000Z",
      version: 1,
      createdAt:
        "2026-08-21T18:00:00.000Z",
      entries: {
        "finovo-accounts":
          "accounts-v1",
      },
    });
  });

  it("does not create a duplicate snapshot when Finovo data has not changed", () => {
    const {
      storage,
    } = createStorage({
      "finovo-accounts":
        "accounts-v1",
    });

    expect(
      createAutomaticLocalSnapshot(
        storage,
        "2026-08-21T18:00:00.000Z"
      )
    ).not.toBeNull();

    expect(
      createAutomaticLocalSnapshot(
        storage,
        "2026-08-21T18:01:00.000Z"
      )
    ).toBeNull();

    expect(
      readLocalSnapshots(
        storage
      )
    ).toHaveLength(1);
  });

  it("creates a new snapshot after Finovo data changes", () => {
    const {
      storage,
      values,
    } = createStorage({
      "finovo-accounts":
        "accounts-v1",
    });

    createAutomaticLocalSnapshot(
      storage,
      "2026-08-21T18:00:00.000Z"
    );

    values.set(
      "finovo-accounts",
      "accounts-v2"
    );

    createAutomaticLocalSnapshot(
      storage,
      "2026-08-21T18:01:00.000Z"
    );

    const snapshots =
      readLocalSnapshots(
        storage
      );

    expect(
      snapshots
    ).toHaveLength(2);

    expect(
      snapshots[0].entries[
        "finovo-accounts"
      ]
    ).toBe(
      "accounts-v2"
    );
  });

  it("keeps only the latest snapshots", () => {
    const {
      storage,
      values,
    } = createStorage({
      "finovo-accounts":
        "accounts-0",
    });

    for (
      let index = 0;
      index <
      MAX_LOCAL_SNAPSHOTS + 2;
      index += 1
    ) {
      values.set(
        "finovo-accounts",
        `accounts-${index}`
      );

      createAutomaticLocalSnapshot(
        storage,
        new Date(
          Date.UTC(
            2026,
            7,
            21,
            18,
            index
          )
        ).toISOString()
      );
    }

    expect(
      readLocalSnapshots(
        storage
      )
    ).toHaveLength(
      MAX_LOCAL_SNAPSHOTS
    );
  });

  it("does not create snapshots when there is no Finovo data", () => {
    const {
      storage,
    } = createStorage({
      unrelated: "value",
    });

    expect(
      createAutomaticLocalSnapshot(
        storage,
        "2026-08-21T18:00:00.000Z"
      )
    ).toBeNull();

    expect(
      storage.getItem(
        LOCAL_SNAPSHOT_STORAGE_KEY
      )
    ).toBeNull();
  });

  it("restores a selected snapshot and preserves unrelated local storage", () => {
    const {
      storage,
      values,
    } = createStorage({
      "finovo-accounts":
        "accounts-v1",
      unrelated:
        "keep-me",
    });

    const snapshot =
      createAutomaticLocalSnapshot(
        storage,
        "2026-08-21T18:00:00.000Z"
      );

    if (snapshot === null) {
      throw new Error(
        "Expected snapshot"
      );
    }

    values.set(
      "finovo-accounts",
      "accounts-v2"
    );
    values.set(
      "finovo-goals",
      "goals-v2"
    );

    restoreLocalSnapshot(
      storage,
      snapshot
    );

    expect(
      values.get(
        "finovo-accounts"
      )
    ).toBe(
      "accounts-v1"
    );

    expect(
      values.has(
        "finovo-goals"
      )
    ).toBe(false);

    expect(
      values.get(
        "unrelated"
      )
    ).toBe(
      "keep-me"
    );
  });
});
