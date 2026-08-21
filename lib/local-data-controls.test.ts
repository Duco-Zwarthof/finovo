import {
  describe,
  expect,
  it,
} from "vitest";

import {
  countFinovoLocalKeys,
  deleteAllFinovoLocalData,
} from "./local-data-controls";
import {
  LOCAL_SNAPSHOT_STORAGE_KEY,
} from "./local-snapshots";

function createStorage(
  initialValues: Record<
    string,
    string
  > = {},
  options: {
    failOnRemoveKey?: string;
  } = {}
) {
  const values =
    new Map(
      Object.entries(initialValues)
    );

  const storage = {
    get length() {
      return values.size;
    },

    key(index: number) {
      return (
        Array.from(
          values.keys()
        )[index] ?? null
      );
    },

    removeItem(key: string) {
      if (
        key ===
        options.failOnRemoveKey
      ) {
        throw new Error(
          "remove failed"
        );
      }

      values.delete(key);
    },
  };

  return {
    storage,
    values,
  };
}

describe("local data controls", () => {
  it("counts Finovo data and snapshot storage", () => {
    const {
      storage,
    } = createStorage({
      "finovo-accounts":
        "accounts",
      "finovo-goals":
        "goals",
      [LOCAL_SNAPSHOT_STORAGE_KEY]:
        "snapshots",
      unrelated:
        "keep-me",
    });

    expect(
      countFinovoLocalKeys(
        storage
      )
    ).toBe(3);
  });

  it("deletes all Finovo local data", () => {
    const {
      storage,
      values,
    } = createStorage({
      "finovo-accounts":
        "accounts",
      "finovo-goals":
        "goals",
      [LOCAL_SNAPSHOT_STORAGE_KEY]:
        "snapshots",
      unrelated:
        "keep-me",
    });

    const result =
      deleteAllFinovoLocalData(
        storage
      );

    expect(
      result.removedKeys
    ).toEqual([
      LOCAL_SNAPSHOT_STORAGE_KEY,
      "finovo-accounts",
      "finovo-goals",
    ].sort());

    expect(
      Object.fromEntries(
        values
      )
    ).toEqual({
      unrelated:
        "keep-me",
    });
  });

  it("does not touch unrelated browser storage", () => {
    const {
      storage,
      values,
    } = createStorage({
      other:
        "value",
    });

    expect(
      deleteAllFinovoLocalData(
        storage
      )
    ).toEqual({
      removedKeys: [],
    });

    expect(
      Object.fromEntries(
        values
      )
    ).toEqual({
      other:
        "value",
    });
  });

  it("reports deletion failures", () => {
    const {
      storage,
    } = createStorage(
      {
        "finovo-accounts":
          "accounts",
      },
      {
        failOnRemoveKey:
          "finovo-accounts",
      }
    );

    expect(() =>
      deleteAllFinovoLocalData(
        storage
      )
    ).toThrow(
      "Finovo could not remove all local data."
    );
  });
});
