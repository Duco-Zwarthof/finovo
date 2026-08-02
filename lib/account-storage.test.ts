import { describe, expect, it } from "vitest";

import type { Account } from "./account-types";
import {
  ACCOUNT_STORAGE_KEY,
  ACCOUNT_STORAGE_VERSION,
  createPersistedAccountData,
  readStoredAccounts,
  validatePersistedAccountData,
  writeStoredAccounts,
} from "./account-storage";
import type { StorageLike } from "./storage";

const account: Account = {
  id: "account-1",
  name: "Main account",
  type: "checking",
  balanceMinor: 125_000,
  includedInNetWorth: true,
};

function createFakeStorage(
  initialValues: Record<string, string> = {},
  options: {
    getThrows?: boolean;
    setThrows?: boolean;
  } = {}
) {
  const values = new Map(Object.entries(initialValues));

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

describe("account storage", () => {
  it("creates a versioned account envelope", () => {
    expect(
      createPersistedAccountData([account])
    ).toEqual({
      version: ACCOUNT_STORAGE_VERSION,
      accounts: [account],
    });
  });

  it("validates a stored account envelope", () => {
    expect(
      validatePersistedAccountData({
        version: ACCOUNT_STORAGE_VERSION,
        accounts: [account],
      })
    ).toEqual([account]);
  });

  it("rejects malformed and duplicate data", () => {
    expect(
      validatePersistedAccountData({
        version: ACCOUNT_STORAGE_VERSION,
        accounts: [{ ...account, name: "" }],
      })
    ).toBeNull();

    expect(
      validatePersistedAccountData({
        version: ACCOUNT_STORAGE_VERSION,
        accounts: [account, account],
      })
    ).toBeNull();
  });

  it("reads missing and valid storage", () => {
    const empty = createFakeStorage();

    expect(
      readStoredAccounts([], empty.storage)
    ).toEqual({
      value: [],
      status: "missing",
    });

    const valid = createFakeStorage({
      [ACCOUNT_STORAGE_KEY]: JSON.stringify(
        createPersistedAccountData([account])
      ),
    });

    expect(
      readStoredAccounts([], valid.storage)
    ).toEqual({
      value: [account],
      status: "valid",
    });
  });

  it("rejects invalid and unsupported storage", () => {
    const invalid = createFakeStorage({
      [ACCOUNT_STORAGE_KEY]: "{broken",
    });

    expect(
      readStoredAccounts([], invalid.storage)
    ).toEqual({
      value: [],
      status: "invalid",
    });

    const unsupported = createFakeStorage({
      [ACCOUNT_STORAGE_KEY]: JSON.stringify({
        version: ACCOUNT_STORAGE_VERSION + 1,
        accounts: [account],
      }),
    });

    expect(
      readStoredAccounts([], unsupported.storage)
    ).toEqual({
      value: [],
      status: "unsupported",
    });
  });

  it("writes accounts and reports failures", () => {
    const writable = createFakeStorage();

    expect(
      writeStoredAccounts(
        [account],
        writable.storage
      )
    ).toEqual({ status: "written" });

    expect(
      writable.values.get(ACCOUNT_STORAGE_KEY)
    ).toBe(
      JSON.stringify(
        createPersistedAccountData([account])
      )
    );

    expect(
      writeStoredAccounts([account], null)
    ).toEqual({ status: "unavailable" });

    const failing = createFakeStorage(
      {},
      { setThrows: true }
    );

    expect(
      writeStoredAccounts(
        [account],
        failing.storage
      )
    ).toEqual({ status: "failed" });
  });
});
