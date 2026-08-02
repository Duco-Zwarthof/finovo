import { describe, expect, it } from "vitest";

import type { InvestmentHolding } from "./investment-types";
import {
  INVESTMENT_STORAGE_KEY,
  INVESTMENT_STORAGE_VERSION,
  createPersistedInvestmentDataV1,
  readStoredInvestments,
  validatePersistedInvestmentDataV1,
  writeStoredInvestments,
} from "./investment-storage";
import type { StorageLike } from "./storage";

const holding: InvestmentHolding = {
  id: "holding-1",
  name: "Vanguard FTSE All-World",
  symbol: "VWCE",
  assetType: "etf",
  quantity: 10,
  averageBuyPriceMinor: 10_000,
  currentPriceMinor: 12_000,
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

describe("investment storage", () => {
  it("creates a versioned investment envelope", () => {
    expect(
      createPersistedInvestmentDataV1([holding])
    ).toEqual({
      version: INVESTMENT_STORAGE_VERSION,
      holdings: [holding],
    });
  });

  it("validates stored investments", () => {
    expect(
      validatePersistedInvestmentDataV1({
        version: INVESTMENT_STORAGE_VERSION,
        holdings: [holding],
      })
    ).toEqual([holding]);
  });

  it("rejects malformed and duplicate holdings", () => {
    expect(
      validatePersistedInvestmentDataV1({
        version: INVESTMENT_STORAGE_VERSION,
        holdings: [
          {
            ...holding,
            quantity: 0,
          },
        ],
      })
    ).toBeNull();

    expect(
      validatePersistedInvestmentDataV1({
        version: INVESTMENT_STORAGE_VERSION,
        holdings: [holding, holding],
      })
    ).toBeNull();
  });

  it("reads missing and valid storage", () => {
    const empty = createFakeStorage();

    expect(
      readStoredInvestments([], empty.storage)
    ).toEqual({
      value: [],
      status: "missing",
    });

    const valid = createFakeStorage({
      [INVESTMENT_STORAGE_KEY]: JSON.stringify(
        createPersistedInvestmentDataV1([
          holding,
        ])
      ),
    });

    expect(
      readStoredInvestments([], valid.storage)
    ).toEqual({
      value: [holding],
      status: "valid",
    });
  });

  it("rejects invalid and unsupported storage", () => {
    const invalid = createFakeStorage({
      [INVESTMENT_STORAGE_KEY]: "{broken",
    });

    expect(
      readStoredInvestments([], invalid.storage)
    ).toEqual({
      value: [],
      status: "invalid",
    });

    const unsupported = createFakeStorage({
      [INVESTMENT_STORAGE_KEY]: JSON.stringify({
        version: INVESTMENT_STORAGE_VERSION + 1,
        holdings: [holding],
      }),
    });

    expect(
      readStoredInvestments(
        [],
        unsupported.storage
      )
    ).toEqual({
      value: [],
      status: "unsupported",
    });
  });

  it("writes investments and reports failures", () => {
    const writable = createFakeStorage();

    expect(
      writeStoredInvestments(
        [holding],
        writable.storage
      )
    ).toEqual({ status: "written" });

    expect(
      writable.values.get(
        INVESTMENT_STORAGE_KEY
      )
    ).toBe(
      JSON.stringify(
        createPersistedInvestmentDataV1([
          holding,
        ])
      )
    );

    expect(
      writeStoredInvestments([holding], null)
    ).toEqual({ status: "unavailable" });

    const failing = createFakeStorage(
      {},
      { setThrows: true }
    );

    expect(
      writeStoredInvestments(
        [holding],
        failing.storage
      )
    ).toEqual({ status: "failed" });
  });
});
