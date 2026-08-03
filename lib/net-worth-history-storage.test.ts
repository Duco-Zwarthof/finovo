import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  NetWorthSnapshot,
} from "./net-worth-history-types";
import {
  NET_WORTH_HISTORY_STORAGE_KEY,
  NET_WORTH_HISTORY_STORAGE_VERSION,
  createPersistedNetWorthHistoryDataV1,
  readStoredNetWorthHistory,
  validatePersistedNetWorthHistoryDataV1,
  writeStoredNetWorthHistory,
} from "./net-worth-history-storage";
import type { StorageLike } from "./storage";

const snapshot: NetWorthSnapshot = {
  id: "snapshot-1",
  date: "2026-08-03",
  netWorthMinor: 4_250_000,
};

function createFakeStorage(
  initialValues: Record<string, string> = {},
  options: {
    getThrows?: boolean;
    setThrows?: boolean;
  } = {}
) {
  const values = new Map(
    Object.entries(initialValues)
  );

  const storage: StorageLike = {
    getItem(key) {
      if (options.getThrows) {
        throw new Error("read failed");
      }

      return values.get(key) ?? null;
    },

    setItem(key, value) {
      if (options.setThrows) {
        throw new Error("write failed");
      }

      values.set(key, value);
    },

    removeItem(key) {
      values.delete(key);
    },
  };

  return { storage, values };
}

describe("net worth history storage", () => {
  it("creates a versioned envelope", () => {
    expect(
      createPersistedNetWorthHistoryDataV1([
        snapshot,
      ])
    ).toEqual({
      version:
        NET_WORTH_HISTORY_STORAGE_VERSION,
      snapshots: [snapshot],
    });
  });

  it("validates snapshots", () => {
    expect(
      validatePersistedNetWorthHistoryDataV1({
        version:
          NET_WORTH_HISTORY_STORAGE_VERSION,
        snapshots: [snapshot],
      })
    ).toEqual([snapshot]);
  });

  it("rejects duplicate dates", () => {
    expect(
      validatePersistedNetWorthHistoryDataV1({
        version:
          NET_WORTH_HISTORY_STORAGE_VERSION,
        snapshots: [
          snapshot,
          {
            ...snapshot,
            id: "snapshot-2",
          },
        ],
      })
    ).toBeNull();
  });

  it("reads missing and valid data", () => {
    const empty = createFakeStorage();

    expect(
      readStoredNetWorthHistory(
        [],
        empty.storage
      )
    ).toEqual({
      value: [],
      status: "missing",
    });

    const valid = createFakeStorage({
      [NET_WORTH_HISTORY_STORAGE_KEY]:
        JSON.stringify(
          createPersistedNetWorthHistoryDataV1(
            [snapshot]
          )
        ),
    });

    expect(
      readStoredNetWorthHistory(
        [],
        valid.storage
      )
    ).toEqual({
      value: [snapshot],
      status: "valid",
    });
  });

  it("reports invalid and unsupported data", () => {
    const invalid = createFakeStorage({
      [NET_WORTH_HISTORY_STORAGE_KEY]:
        "{broken",
    });

    expect(
      readStoredNetWorthHistory(
        [],
        invalid.storage
      )
    ).toEqual({
      value: [],
      status: "invalid",
    });

    const unsupported = createFakeStorage({
      [NET_WORTH_HISTORY_STORAGE_KEY]:
        JSON.stringify({
          version:
            NET_WORTH_HISTORY_STORAGE_VERSION +
            1,
          snapshots: [snapshot],
        }),
    });

    expect(
      readStoredNetWorthHistory(
        [],
        unsupported.storage
      )
    ).toEqual({
      value: [],
      status: "unsupported",
    });
  });

  it("writes data and reports failures", () => {
    const writable = createFakeStorage();

    expect(
      writeStoredNetWorthHistory(
        [snapshot],
        writable.storage
      )
    ).toEqual({
      status: "written",
    });

    expect(
      writable.values.get(
        NET_WORTH_HISTORY_STORAGE_KEY
      )
    ).toBe(
      JSON.stringify(
        createPersistedNetWorthHistoryDataV1(
          [snapshot]
        )
      )
    );

    expect(
      writeStoredNetWorthHistory(
        [snapshot],
        null
      )
    ).toEqual({
      status: "unavailable",
    });

    const failing = createFakeStorage(
      {},
      { setThrows: true }
    );

    expect(
      writeStoredNetWorthHistory(
        [snapshot],
        failing.storage
      )
    ).toEqual({
      status: "failed",
    });
  });
});
