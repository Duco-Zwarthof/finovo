import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RecurringTransaction,
} from "./recurring-transaction-types";
import {
  RECURRING_TRANSACTION_STORAGE_KEY,
  RECURRING_TRANSACTION_STORAGE_VERSION,
  createPersistedRecurringTransactionDataV1,
  readStoredRecurringTransactions,
  validatePersistedRecurringTransactionDataV1,
  writeStoredRecurringTransactions,
} from "./recurring-transaction-storage";
import type { StorageLike } from "./storage";

const salary: RecurringTransaction = {
  id: "salary",
  title: "Salary",
  category: "Salary",
  amountMinor: 250_000,
  type: "income",
  frequency: "monthly",
  startDate: "2026-01-25",
  endDate: null,
  dayOfMonth: 25,
  isActive: true,
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

describe(
  "recurring transaction storage",
  () => {
    it("creates a versioned envelope", () => {
      expect(
        createPersistedRecurringTransactionDataV1(
          [salary]
        )
      ).toEqual({
        version:
          RECURRING_TRANSACTION_STORAGE_VERSION,
        items: [salary],
      });
    });

    it("validates stored items", () => {
      expect(
        validatePersistedRecurringTransactionDataV1({
          version:
            RECURRING_TRANSACTION_STORAGE_VERSION,
          items: [salary],
        })
      ).toEqual([salary]);
    });

    it("rejects duplicate ids", () => {
      expect(
        validatePersistedRecurringTransactionDataV1({
          version:
            RECURRING_TRANSACTION_STORAGE_VERSION,
          items: [salary, salary],
        })
      ).toBeNull();
    });

    it("reads missing and valid data", () => {
      const empty = createFakeStorage();

      expect(
        readStoredRecurringTransactions(
          [],
          empty.storage
        )
      ).toEqual({
        value: [],
        status: "missing",
      });

      const valid = createFakeStorage({
        [RECURRING_TRANSACTION_STORAGE_KEY]:
          JSON.stringify(
            createPersistedRecurringTransactionDataV1(
              [salary]
            )
          ),
      });

      expect(
        readStoredRecurringTransactions(
          [],
          valid.storage
        )
      ).toEqual({
        value: [salary],
        status: "valid",
      });
    });

    it("reports invalid and unsupported data", () => {
      const invalid = createFakeStorage({
        [RECURRING_TRANSACTION_STORAGE_KEY]:
          "{broken",
      });

      expect(
        readStoredRecurringTransactions(
          [],
          invalid.storage
        )
      ).toEqual({
        value: [],
        status: "invalid",
      });

      const unsupported =
        createFakeStorage({
          [RECURRING_TRANSACTION_STORAGE_KEY]:
            JSON.stringify({
              version:
                RECURRING_TRANSACTION_STORAGE_VERSION +
                1,
              items: [salary],
            }),
        });

      expect(
        readStoredRecurringTransactions(
          [],
          unsupported.storage
        )
      ).toEqual({
        value: [],
        status: "unsupported",
      });
    });

    it("writes data and reports failures", () => {
      const writable =
        createFakeStorage();

      expect(
        writeStoredRecurringTransactions(
          [salary],
          writable.storage
        )
      ).toEqual({
        status: "written",
      });

      expect(
        writable.values.get(
          RECURRING_TRANSACTION_STORAGE_KEY
        )
      ).toBe(
        JSON.stringify(
          createPersistedRecurringTransactionDataV1(
            [salary]
          )
        )
      );

      expect(
        writeStoredRecurringTransactions(
          [salary],
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
        writeStoredRecurringTransactions(
          [salary],
          failing.storage
        )
      ).toEqual({
        status: "failed",
      });
    });
  }
);
