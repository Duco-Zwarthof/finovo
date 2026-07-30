import { describe, expect, it } from "vitest";

import type { Transaction } from "./types";
import {
  STORAGE_KEYS,
  mergeDashboardLayoutsPreservingHidden,
  readStoredDashboardLayouts,
  readStoredTransactions,
  readStoredWidgetSettings,
  removeStoredValue,
  validateStoredTransactions,
  writeStoredTransactions,
  type DashboardLayouts,
  type StorageLike,
  type WidgetSettings,
} from "./storage";

const validTransaction: Transaction = {
  id: "salary-1",
  title: "Salary",
  amount: 3_250.5,
  type: "income",
  category: "Salary",
  date: "2026-07-31",
};

const fallbackTransactions: Transaction[] = [
  {
    id: "fallback-1",
    title: "Fallback transaction",
    amount: 10,
    type: "expense",
    category: "Other",
    date: "2026-07-01",
  },
];

const defaultWidgetSettings: WidgetSettings = {
  netWorth: true,
  monthlyIncome: true,
  monthlyExpenses: true,
  monthlySavings: true,
  cashflow: true,
  savingsGoal: true,
  recentTransactions: true,
};

const defaultLayouts: DashboardLayouts = {
  lg: [
    {
      i: "netWorth",
      x: 0,
      y: 0,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
    },
    {
      i: "monthlyIncome",
      x: 3,
      y: 0,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
    },
  ],
  md: [
    {
      i: "netWorth",
      x: 0,
      y: 0,
      w: 4,
      h: 2,
      minW: 2,
      minH: 2,
    },
  ],
  sm: [],
  xs: [],
};

type FakeStorageOptions = {
  getThrows?: boolean;
  setThrows?: boolean;
  removeThrows?: boolean;
};

function createFakeStorage(
  initialValues: Record<string, string> = {},
  options: FakeStorageOptions = {}
) {
  const values = new Map(Object.entries(initialValues));

  const storage: StorageLike = {
    getItem(key) {
      if (options.getThrows) {
        throw new DOMException("Storage is unavailable");
      }

      return values.get(key) ?? null;
    },
    setItem(key, value) {
      if (options.setThrows) {
        throw new DOMException("Storage quota exceeded");
      }

      values.set(key, value);
    },
    removeItem(key) {
      if (options.removeThrows) {
        throw new DOMException("Storage is unavailable");
      }

      values.delete(key);
    },
  };

  return { storage, values };
}

describe("stored transaction validation", () => {
  it("accepts valid transactions without changing their values", () => {
    expect(
      validateStoredTransactions([validTransaction])
    ).toEqual({
      value: [validTransaction],
      recovered: false,
    });
  });

  it("accepts an empty transaction array", () => {
    expect(validateStoredTransactions([])).toEqual({
      value: [],
      recovered: false,
    });
  });

  it.each(["transfer", "Income", ""])(
    "rejects the unsupported transaction type %s",
    (type) => {
      const result = validateStoredTransactions([
        validTransaction,
        { ...validTransaction, id: "invalid", type },
      ]);

      expect(result).toEqual({
        value: [validTransaction],
        recovered: true,
      });
    }
  );

  it.each([Number.NaN, Infinity, -Infinity])(
    "rejects the non-finite amount %s",
    (amount) => {
      const result = validateStoredTransactions([
        validTransaction,
        { ...validTransaction, id: "invalid", amount },
      ]);

      expect(result).toEqual({
        value: [validTransaction],
        recovered: true,
      });
    }
  );

  it("rejects malformed and impossible local dates", () => {
    const result = validateStoredTransactions([
      validTransaction,
      {
        ...validTransaction,
        id: "invalid-format",
        date: "31-07-2026",
      },
      {
        ...validTransaction,
        id: "invalid-calendar-date",
        date: "2026-02-30",
      },
    ]);

    expect(result).toEqual({
      value: [validTransaction],
      recovered: true,
    });
  });

  it.each([
    { ...validTransaction, title: " " },
    { ...validTransaction, category: "Unknown" },
    { ...validTransaction, amount: 0 },
    { ...validTransaction, amount: -1 },
  ])("rejects transactions with invalid required fields", (entry) => {
    expect(validateStoredTransactions([entry])).toEqual({
      value: [],
      recovered: true,
    });
  });

  it("preserves valid entries in order within a partially malformed array", () => {
    const secondValidTransaction: Transaction = {
      ...validTransaction,
      id: "groceries-1",
      title: "Groceries",
      amount: 82.4,
      type: "expense",
      category: "Groceries",
    };

    const result = validateStoredTransactions([
      validTransaction,
      { ...validTransaction, id: "", amount: 25 },
      secondValidTransaction,
      { ...secondValidTransaction },
    ]);

    expect(result).toEqual({
      value: [validTransaction, secondValidTransaction],
      recovered: true,
    });
  });
});

describe("transaction storage reads", () => {
  it("reads valid stored transactions", () => {
    const { storage } = createFakeStorage({
      [STORAGE_KEYS.transactions]: JSON.stringify([
        validTransaction,
      ]),
    });

    expect(
      readStoredTransactions(fallbackTransactions, storage)
    ).toEqual({
      value: [validTransaction],
      status: "valid",
    });
  });

  it("preserves a stored empty transaction array", () => {
    const { storage } = createFakeStorage({
      [STORAGE_KEYS.transactions]: "[]",
    });

    expect(
      readStoredTransactions(fallbackTransactions, storage)
    ).toEqual({
      value: [],
      status: "valid",
    });
  });

  it("returns a deterministic fallback for malformed JSON", () => {
    const rawValue = "{broken-json";
    const { storage, values } = createFakeStorage({
      [STORAGE_KEYS.transactions]: rawValue,
    });

    const firstResult = readStoredTransactions(
      fallbackTransactions,
      storage
    );
    const secondResult = readStoredTransactions(
      fallbackTransactions,
      storage
    );

    expect(firstResult).toEqual({
      value: fallbackTransactions,
      status: "invalid",
    });
    expect(secondResult).toEqual(firstResult);
    expect(secondResult.value).not.toBe(firstResult.value);
    expect(values.get(STORAGE_KEYS.transactions)).toBe(
      rawValue
    );
  });

  it("reports partial recovery without rewriting stored data", () => {
    const rawValue = JSON.stringify([
      validTransaction,
      { ...validTransaction, id: "invalid", type: "transfer" },
    ]);
    const { storage, values } = createFakeStorage({
      [STORAGE_KEYS.transactions]: rawValue,
    });

    expect(
      readStoredTransactions(fallbackTransactions, storage)
    ).toEqual({
      value: [validTransaction],
      status: "recovered",
    });
    expect(values.get(STORAGE_KEYS.transactions)).toBe(
      rawValue
    );
  });

  it("rejects a parsed value that is not an array", () => {
    const { storage } = createFakeStorage({
      [STORAGE_KEYS.transactions]: JSON.stringify({
        transaction: validTransaction,
      }),
    });

    expect(
      readStoredTransactions(fallbackTransactions, storage)
    ).toEqual({
      value: fallbackTransactions,
      status: "invalid",
    });
  });

  it("distinguishes a missing value from an invalid one", () => {
    const { storage, values } = createFakeStorage();

    expect(
      readStoredTransactions(fallbackTransactions, storage)
    ).toEqual({
      value: fallbackTransactions,
      status: "missing",
    });
    expect(values.has(STORAGE_KEYS.transactions)).toBe(false);
  });

  it("falls back without throwing when storage reads fail", () => {
    const { storage } = createFakeStorage(
      {},
      { getThrows: true }
    );

    expect(
      readStoredTransactions(fallbackTransactions, storage)
    ).toEqual({
      value: fallbackTransactions,
      status: "unavailable",
    });
  });
});

describe("storage writes and removal", () => {
  it("writes the existing transaction payload shape", () => {
    const { storage, values } = createFakeStorage();

    expect(
      writeStoredTransactions([validTransaction], storage)
    ).toEqual({ status: "written" });
    expect(values.get(STORAGE_KEYS.transactions)).toBe(
      JSON.stringify([validTransaction])
    );
  });

  it("reports write failures without throwing", () => {
    const { storage } = createFakeStorage(
      {},
      { setThrows: true }
    );

    expect(
      writeStoredTransactions([validTransaction], storage)
    ).toEqual({ status: "failed" });
  });

  it("reports unavailable storage without throwing", () => {
    expect(
      writeStoredTransactions([validTransaction], null)
    ).toEqual({ status: "unavailable" });
  });

  it("removes a known stored value safely", () => {
    const { storage, values } = createFakeStorage({
      [STORAGE_KEYS.layouts]: "{}",
    });

    expect(
      removeStoredValue(STORAGE_KEYS.layouts, storage)
    ).toEqual({ status: "removed" });
    expect(values.has(STORAGE_KEYS.layouts)).toBe(false);
  });

  it("reports removal failures without throwing", () => {
    const { storage } = createFakeStorage(
      {},
      { removeThrows: true }
    );

    expect(
      removeStoredValue(STORAGE_KEYS.layouts, storage)
    ).toEqual({ status: "failed" });
  });
});

describe("dashboard preference validation", () => {
  it("preserves valid widget settings and defaults only invalid fields", () => {
    const { storage } = createFakeStorage({
      [STORAGE_KEYS.widgetSettings]: JSON.stringify({
        ...defaultWidgetSettings,
        netWorth: false,
        monthlyIncome: "hidden",
      }),
    });

    const result = readStoredWidgetSettings(
      defaultWidgetSettings,
      storage
    );

    expect(result.status).toBe("recovered");
    expect(result.value.netWorth).toBe(false);
    expect(result.value.monthlyIncome).toBe(true);
    expect(result.value.monthlyExpenses).toBe(true);
  });

  it("preserves valid saved layout positions and restores a missing widget layout", () => {
    const { storage } = createFakeStorage({
      [STORAGE_KEYS.layouts]: JSON.stringify({
        lg: [
          {
            i: "netWorth",
            x: 6,
            y: 4,
            w: 4,
            h: 3,
          },
        ],
        md: [],
        sm: [],
        xs: [],
      }),
    });

    const result = readStoredDashboardLayouts(
      defaultLayouts,
      storage
    );

    expect(result.status).toBe("recovered");
    expect(result.value.lg).toEqual([
      {
        i: "netWorth",
        x: 6,
        y: 4,
        w: 4,
        h: 3,
        minW: 2,
        minH: 2,
      },
      defaultLayouts.lg?.[1],
    ]);
  });

  it("keeps hidden layouts when visible layouts change", () => {
    const nextLayouts: DashboardLayouts = {
      lg: [
        {
          i: "netWorth",
          x: 4,
          y: 2,
          w: 4,
          h: 3,
        },
      ],
    };

    const mergedLayouts =
      mergeDashboardLayoutsPreservingHidden(
        defaultLayouts,
        nextLayouts
      );

    expect(mergedLayouts.lg).toEqual([
      nextLayouts.lg?.[0],
      defaultLayouts.lg?.[1],
    ]);
    expect(mergedLayouts.md).toEqual(defaultLayouts.md);
    expect(mergedLayouts.sm).toEqual(defaultLayouts.sm);
    expect(mergedLayouts.xs).toEqual(defaultLayouts.xs);
  });

  it("recovers one malformed breakpoint without resetting another", () => {
    const { storage } = createFakeStorage({
      [STORAGE_KEYS.layouts]: JSON.stringify({
        lg: [
          {
            i: "netWorth",
            x: 6,
            y: 4,
            w: 4,
            h: 3,
          },
          defaultLayouts.lg?.[1],
        ],
        md: "invalid",
        sm: [],
        xs: [],
      }),
    });

    const result = readStoredDashboardLayouts(
      defaultLayouts,
      storage
    );

    expect(result.status).toBe("recovered");
    expect(result.value.lg?.[0]).toMatchObject({
      i: "netWorth",
      x: 6,
      y: 4,
      w: 4,
      h: 3,
    });
    expect(result.value.md).toEqual(defaultLayouts.md);
  });
});
