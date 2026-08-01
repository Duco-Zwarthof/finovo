import { describe, expect, it } from "vitest";

import {
  BUDGET_STORAGE_KEY,
  BUDGET_STORAGE_VERSION,
  createPersistedBudgetDataV1,
  readStoredBudgets,
  validatePersistedBudgetDataV1,
  writeStoredBudgets,
} from "./budget-storage";
import type { Budget } from "./budget-types";
import type { StorageLike } from "./storage";

function createBudget(
  overrides: Partial<Budget> = {}
): Budget {
  return {
    id: "budget-groceries-2026-08",
    month: "2026-08",
    category: "Groceries",
    limitMinor: 30_000,
    ...overrides,
  };
}

type FakeStorageOptions = {
  getThrows?: boolean;
  setThrows?: boolean;
};

function createFakeStorage(
  initialValues: Record<string, string> = {},
  options: FakeStorageOptions = {}
) {
  const values = new Map(Object.entries(initialValues));
  let writeCount = 0;

  const storage: StorageLike = {
    getItem(key) {
      if (options.getThrows) {
        throw new DOMException("Storage unavailable");
      }

      return values.get(key) ?? null;
    },
    setItem(key, value) {
      if (options.setThrows) {
        throw new DOMException("Storage quota exceeded");
      }

      writeCount += 1;
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };

  return {
    storage,
    values,
    getWriteCount: () => writeCount,
  };
}

describe("budget persistence V1", () => {
  it("creates the current V1 envelope", () => {
    const budget = createBudget();

    expect(createPersistedBudgetDataV1([budget])).toEqual({
      version: 1,
      budgets: [budget],
    });
    expect(BUDGET_STORAGE_VERSION).toBe(1);
  });

  it("creates a valid empty envelope", () => {
    expect(createPersistedBudgetDataV1([])).toEqual({
      version: 1,
      budgets: [],
    });
  });

  it("rejects invalid budgets before persistence", () => {
    expect(() =>
      createPersistedBudgetDataV1([
        createBudget({ limitMinor: 0 }),
      ])
    ).toThrow(/invalid or duplicate/i);
  });

  it("rejects duplicate IDs before persistence", () => {
    expect(() =>
      createPersistedBudgetDataV1([
        createBudget(),
        createBudget({ category: "Transport" }),
      ])
    ).toThrow(/invalid or duplicate/i);
  });

  it("rejects duplicate category and month pairs before persistence", () => {
    expect(() =>
      createPersistedBudgetDataV1([
        createBudget(),
        createBudget({ id: "duplicate" }),
      ])
    ).toThrow(/invalid or duplicate/i);
  });
});

describe("budget persistence validation", () => {
  it("validates a complete V1 envelope", () => {
    const budget = createBudget();

    expect(
      validatePersistedBudgetDataV1({
        version: 1,
        budgets: [budget],
      })
    ).toEqual({
      value: [budget],
      recovered: false,
    });
  });

  it("rejects a malformed envelope", () => {
    expect(
      validatePersistedBudgetDataV1({
        version: 1,
        budgets: "not-an-array",
      })
    ).toBeNull();
  });

  it("recovers valid entries from a partially malformed array", () => {
    const budget = createBudget();

    expect(
      validatePersistedBudgetDataV1({
        version: 1,
        budgets: [budget, null, { id: "broken" }],
      })
    ).toEqual({
      value: [budget],
      recovered: true,
    });
  });

  it("keeps the first duplicate ID deterministically", () => {
    const first = createBudget();
    const duplicate = createBudget({
      category: "Transport",
    });

    expect(
      validatePersistedBudgetDataV1({
        version: 1,
        budgets: [first, duplicate],
      })
    ).toEqual({
      value: [first],
      recovered: true,
    });
  });

  it("keeps the first duplicate category and month deterministically", () => {
    const first = createBudget();
    const duplicate = createBudget({ id: "duplicate" });

    expect(
      validatePersistedBudgetDataV1({
        version: 1,
        budgets: [first, duplicate],
      })
    ).toEqual({
      value: [first],
      recovered: true,
    });
  });
});

describe("reading stored budgets", () => {
  it("returns missing without writing when no value exists", () => {
    const { storage, getWriteCount } = createFakeStorage();

    expect(readStoredBudgets([], storage)).toEqual({
      value: [],
      status: "missing",
    });
    expect(getWriteCount()).toBe(0);
  });

  it("preserves a supplied fallback for missing storage", () => {
    const fallback = createBudget();
    const { storage } = createFakeStorage();
    const result = readStoredBudgets([fallback], storage);

    expect(result).toEqual({
      value: [fallback],
      status: "missing",
    });
    expect(result.value).not.toBe([fallback]);
    expect(result.value[0]).not.toBe(fallback);
  });

  it("reads a valid empty envelope as intentional empty data", () => {
    const rawValue = JSON.stringify({
      version: 1,
      budgets: [],
    });
    const { storage } = createFakeStorage({
      [BUDGET_STORAGE_KEY]: rawValue,
    });

    expect(readStoredBudgets([], storage)).toEqual({
      value: [],
      status: "valid",
    });
  });

  it("reads valid budgets", () => {
    const budget = createBudget();
    const rawValue = JSON.stringify(
      createPersistedBudgetDataV1([budget])
    );
    const { storage } = createFakeStorage({
      [BUDGET_STORAGE_KEY]: rawValue,
    });

    expect(readStoredBudgets([], storage)).toEqual({
      value: [budget],
      status: "valid",
    });
  });

  it("returns recovered for partially malformed records", () => {
    const budget = createBudget();
    const rawValue = JSON.stringify({
      version: 1,
      budgets: [budget, { id: "broken" }],
    });
    const { storage, values, getWriteCount } =
      createFakeStorage({
        [BUDGET_STORAGE_KEY]: rawValue,
      });

    expect(readStoredBudgets([], storage)).toEqual({
      value: [budget],
      status: "recovered",
    });
    expect(values.get(BUDGET_STORAGE_KEY)).toBe(rawValue);
    expect(getWriteCount()).toBe(0);
  });

  it("returns invalid for malformed JSON without overwriting it", () => {
    const rawValue = "{not-json";
    const { storage, values, getWriteCount } =
      createFakeStorage({
        [BUDGET_STORAGE_KEY]: rawValue,
      });

    expect(readStoredBudgets([], storage)).toEqual({
      value: [],
      status: "invalid",
    });
    expect(values.get(BUDGET_STORAGE_KEY)).toBe(rawValue);
    expect(getWriteCount()).toBe(0);
  });

  it("returns invalid for a malformed V1 envelope", () => {
    const rawValue = JSON.stringify({
      version: 1,
      budgets: "invalid",
    });
    const { storage } = createFakeStorage({
      [BUDGET_STORAGE_KEY]: rawValue,
    });

    expect(readStoredBudgets([], storage)).toEqual({
      value: [],
      status: "invalid",
    });
  });

  it("returns unsupported without overwriting a future version", () => {
    const rawValue = JSON.stringify({
      version: 2,
      budgets: [],
    });
    const { storage, values, getWriteCount } =
      createFakeStorage({
        [BUDGET_STORAGE_KEY]: rawValue,
      });

    expect(readStoredBudgets([], storage)).toEqual({
      value: [],
      status: "unsupported",
    });
    expect(values.get(BUDGET_STORAGE_KEY)).toBe(rawValue);
    expect(getWriteCount()).toBe(0);
  });

  it("returns unavailable when localStorage cannot be read", () => {
    const fallback = createBudget();
    const { storage } = createFakeStorage({}, {
      getThrows: true,
    });

    expect(readStoredBudgets([fallback], storage)).toEqual({
      value: [fallback],
      status: "unavailable",
    });
  });

  it("returns unavailable when no storage implementation exists", () => {
    expect(readStoredBudgets([], null)).toEqual({
      value: [],
      status: "unavailable",
    });
  });
});

describe("writing stored budgets", () => {
  it("writes the V1 envelope to the budget storage key", () => {
    const budget = createBudget();
    const { storage, values } = createFakeStorage();

    expect(writeStoredBudgets([budget], storage)).toEqual({
      status: "written",
    });
    expect(
      JSON.parse(values.get(BUDGET_STORAGE_KEY) ?? "")
    ).toEqual({
      version: 1,
      budgets: [budget],
    });
  });

  it("writes an intentional empty budget array", () => {
    const { storage, values } = createFakeStorage();

    expect(writeStoredBudgets([], storage)).toEqual({
      status: "written",
    });
    expect(
      JSON.parse(values.get(BUDGET_STORAGE_KEY) ?? "")
    ).toEqual({
      version: 1,
      budgets: [],
    });
  });

  it("does not write invalid budgets", () => {
    const { storage, values, getWriteCount } =
      createFakeStorage();

    expect(
      writeStoredBudgets(
        [createBudget({ limitMinor: 0 })],
        storage
      )
    ).toEqual({ status: "failed" });
    expect(values.has(BUDGET_STORAGE_KEY)).toBe(false);
    expect(getWriteCount()).toBe(0);
  });

  it("does not write duplicate budgets", () => {
    const { storage, getWriteCount } = createFakeStorage();

    expect(
      writeStoredBudgets(
        [createBudget(), createBudget({ id: "duplicate" })],
        storage
      )
    ).toEqual({ status: "failed" });
    expect(getWriteCount()).toBe(0);
  });

  it("reports failed when storage rejects the write", () => {
    const { storage } = createFakeStorage({}, {
      setThrows: true,
    });

    expect(
      writeStoredBudgets([createBudget()], storage)
    ).toEqual({ status: "failed" });
  });

  it("reports unavailable without a storage implementation", () => {
    expect(writeStoredBudgets([], null)).toEqual({
      status: "unavailable",
    });
  });
});
