import { describe, expect, it } from "vitest";

import { sampleTransactions } from "./sample-transactions";
import {
  TRANSACTION_STORAGE_VERSION,
  createPersistedTransactionDataV1,
  createPersistedTransactionDataV2,
} from "./persisted-transactions";
import {
  STORAGE_KEYS,
  readStoredTransactions,
  writeStoredTransactions,
  type StorageLike,
  type StorageReadResult,
} from "./storage";
import {
  addTransactionToData,
  canPersistTransactionMutation,
  createTransactionDataState,
  deleteTransactionFromData,
  getDashboardWidgetDataSource,
  getDisplayedTransactions,
  updateTransactionInData,
} from "./transaction-data";
import type { Transaction } from "./types";

const userTransaction: Transaction = {
  id: "user-transaction-1",
  title: "Consulting income",
  amountMinor: 45_000,
  type: "income",
  category: "Other",
  date: "2026-07-29",
};

type FakeStorageOptions = {
  getThrows?: boolean;
  setThrows?: boolean;
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
      values.delete(key);
    },
  };

  return { storage, values };
}

function storedTransactions(
  value: Transaction[],
  status: StorageReadResult<Transaction[]>["status"]
): StorageReadResult<Transaction[]> {
  return { value, status };
}

describe("transaction data initialization", () => {
  it("uses explicitly marked demo data when storage is missing", () => {
    const state = createTransactionDataState(
      storedTransactions([], "missing")
    );

    expect(state.source).toBe("demo");
    expect(getDisplayedTransactions(state)).toEqual(
      sampleTransactions
    );
  });

  it("preserves a valid stored empty array as empty user data", () => {
    const state = createTransactionDataState(
      storedTransactions([], "valid")
    );

    expect(state.source).toBe("user");
    expect(getDisplayedTransactions(state)).toEqual([]);
  });

  it("gives valid stored user transactions priority over demo data", () => {
    const state = createTransactionDataState(
      storedTransactions([userTransaction], "valid")
    );

    expect(state.source).toBe("user");
    expect(getDisplayedTransactions(state)).toEqual([
      userTransaction,
    ]);
  });

  it.each(["invalid", "unavailable"] as const)(
    "uses honest empty user data when storage is %s",
    (status) => {
      const state = createTransactionDataState(
        storedTransactions([], status)
      );

      expect(state.source).toBe("user");
      expect(getDisplayedTransactions(state)).toEqual([]);
    }
  );

  it("keeps valid recovered user transactions", () => {
    const state = createTransactionDataState(
      storedTransactions([userTransaction], "recovered")
    );

    expect(state.source).toBe("user");
    expect(getDisplayedTransactions(state)).toEqual([
      userTransaction,
    ]);
  });

  it.each(["valid", "recovered"] as const)(
    "recognizes seed-only %s storage as legacy demo data",
    (status) => {
      const state = createTransactionDataState(
        storedTransactions(
          sampleTransactions.slice(0, 2),
          status
        )
      );

      expect(state.source).toBe("demo");
      expect(getDisplayedTransactions(state)).toEqual(
        sampleTransactions
      );
    }
  );

  it("removes exact legacy demo records from mixed stored data", () => {
    const state = createTransactionDataState(
      storedTransactions(
        [sampleTransactions[0], userTransaction],
        "valid"
      )
    );

    expect(state.source).toBe("user");
    expect(getDisplayedTransactions(state)).toEqual([
      userTransaction,
    ]);
  });

  it("preserves a user-edited record that reuses a sample ID", () => {
    const editedSample: Transaction = {
      ...sampleTransactions[0],
      title: "My corrected salary",
    };
    const state = createTransactionDataState(
      storedTransactions([editedSample], "valid")
    );

    expect(state.source).toBe("user");
    expect(getDisplayedTransactions(state)).toEqual([
      editedSample,
    ]);
  });
});

describe("demo-to-user transaction transitions", () => {
  const demoState = createTransactionDataState(
    storedTransactions([], "missing")
  );

  it("adds the first user transaction without mixing in demo records", () => {
    const nextState = addTransactionToData(
      demoState,
      userTransaction
    );

    expect(nextState.source).toBe("user");
    expect(getDisplayedTransactions(nextState)).toEqual([
      userTransaction,
    ]);
  });

  it("converts a demo edit into only the supplied user transaction", () => {
    const editedTransaction: Transaction = {
      ...sampleTransactions[0],
      id: "user-edited-salary",
      title: "My salary",
    };
    const nextState = updateTransactionInData(
      demoState,
      editedTransaction
    );

    expect(nextState.source).toBe("user");
    expect(getDisplayedTransactions(nextState)).toEqual([
      editedTransaction,
    ]);
  });

  it("deletes from demo mode by transitioning to empty user data", () => {
    const nextState = deleteTransactionFromData(
      demoState,
      sampleTransactions[0].id
    );

    expect(nextState.source).toBe("user");
    expect(getDisplayedTransactions(nextState)).toEqual([]);
  });

  it("keeps normal CRUD behavior after data becomes user-owned", () => {
    const initialState = createTransactionDataState(
      storedTransactions([userTransaction], "valid")
    );
    const secondTransaction: Transaction = {
      ...userTransaction,
      id: "user-transaction-2",
      title: "Groceries",
      amountMinor: 8_500,
      type: "expense",
      category: "Groceries",
    };
    const addedState = addTransactionToData(
      initialState,
      secondTransaction
    );
    const updatedTransaction = {
      ...secondTransaction,
      amountMinor: 9_000,
    };
    const updatedState = updateTransactionInData(
      addedState,
      updatedTransaction
    );
    const deletedState = deleteTransactionFromData(
      updatedState,
      userTransaction.id
    );

    expect(getDisplayedTransactions(addedState)).toEqual([
      secondTransaction,
      userTransaction,
    ]);
    expect(getDisplayedTransactions(updatedState)).toEqual([
      updatedTransaction,
      userTransaction,
    ]);
    expect(deletedState.source).toBe("user");
    expect(getDisplayedTransactions(deletedState)).toEqual([
      updatedTransaction,
    ]);
  });

  it("does not restore demo data after deleting the final user transaction", () => {
    const userState = createTransactionDataState(
      storedTransactions([userTransaction], "valid")
    );
    const emptyState = deleteTransactionFromData(
      userState,
      userTransaction.id
    );
    const reloadedState = createTransactionDataState(
      storedTransactions(
        getDisplayedTransactions(emptyState),
        "valid"
      )
    );

    expect(emptyState.source).toBe("user");
    expect(getDisplayedTransactions(emptyState)).toEqual([]);
    expect(reloadedState.source).toBe("user");
    expect(getDisplayedTransactions(reloadedState)).toEqual(
      []
    );
  });
});

describe("transaction data persistence boundary", () => {
  function persistMutation(
    initialRead: StorageReadResult<Transaction[]>,
    transactions: readonly Transaction[],
    storage: StorageLike
  ) {
    return canPersistTransactionMutation(initialRead.status)
      ? writeStoredTransactions(transactions, storage)
      : null;
  }

  it("does not persist demo data during an initial missing read", () => {
    const { storage, values } = createFakeStorage();
    const state = createTransactionDataState(
      readStoredTransactions([], storage)
    );

    expect(state.source).toBe("demo");
    expect(values.has(STORAGE_KEYS.transactions)).toBe(false);
  });

  it("does not disguise malformed stored data as demo data", () => {
    const rawValue = "{broken-json";
    const { storage, values } = createFakeStorage({
      [STORAGE_KEYS.transactions]: rawValue,
    });
    const state = createTransactionDataState(
      readStoredTransactions([], storage)
    );

    expect(state.source).toBe("user");
    expect(getDisplayedTransactions(state)).toEqual([]);
    expect(values.get(STORAGE_KEYS.transactions)).toBe(
      rawValue
    );
  });

  it("persists and reloads only explicit user data", () => {
    const { storage, values } = createFakeStorage();
    const demoState = createTransactionDataState(
      readStoredTransactions([], storage)
    );
    const userState = addTransactionToData(
      demoState,
      userTransaction
    );

    expect(
      writeStoredTransactions(
        getDisplayedTransactions(userState),
        storage
      )
    ).toEqual({ status: "written" });
    expect(values.get(STORAGE_KEYS.transactions)).toBe(
      JSON.stringify(
        createPersistedTransactionDataV2([userTransaction])
      )
    );

    const reloadedState = createTransactionDataState(
      readStoredTransactions([], storage)
    );

    expect(reloadedState.source).toBe("user");
    expect(getDisplayedTransactions(reloadedState)).toEqual([
      userTransaction,
    ]);
  });

  it("keeps the explicit user state in memory when a write fails", () => {
    const { storage, values } = createFakeStorage(
      {},
      { setThrows: true }
    );
    const demoState = createTransactionDataState(
      readStoredTransactions([], storage)
    );
    const userState = addTransactionToData(
      demoState,
      userTransaction
    );

    expect(
      writeStoredTransactions(
        getDisplayedTransactions(userState),
        storage
      )
    ).toEqual({ status: "failed" });
    expect(userState.source).toBe("user");
    expect(getDisplayedTransactions(userState)).toEqual([
      userTransaction,
    ]);
    expect(values.has(STORAGE_KEYS.transactions)).toBe(false);

    const reloadedState = createTransactionDataState(
      readStoredTransactions([], storage)
    );
    expect(reloadedState.source).toBe("demo");
  });

  it.each([
    ["add", (state: ReturnType<typeof createTransactionDataState>) =>
      addTransactionToData(state, {
        ...userTransaction,
        id: "added-transaction",
      })],
    ["edit", (state: ReturnType<typeof createTransactionDataState>) =>
      updateTransactionInData(state, {
        ...userTransaction,
        amountMinor: 50_000,
      })],
    ["delete", (state: ReturnType<typeof createTransactionDataState>) =>
      deleteTransactionFromData(state, userTransaction.id)],
  ] as const)(
    "writes V2 after the first successful legacy %s mutation",
    (_operation, mutate) => {
      const rawValue = JSON.stringify(
        createPersistedTransactionDataV1([userTransaction])
          .transactions
      );
      const { storage, values } = createFakeStorage({
        [STORAGE_KEYS.transactions]: rawValue,
      });
      const initialRead = readStoredTransactions([], storage);
      const state = createTransactionDataState(initialRead);
      const nextState = mutate(state);

      expect(values.get(STORAGE_KEYS.transactions)).toBe(rawValue);
      expect(
        persistMutation(
          initialRead,
          nextState.transactions,
          storage
        )
      ).toEqual({ status: "written" });
      expect(
        JSON.parse(values.get(STORAGE_KEYS.transactions) ?? "")
      ).toEqual(
        createPersistedTransactionDataV2(
          nextState.transactions
        )
      );
    }
  );

  it("migrates only user-owned records from mixed legacy data", () => {
    const rawValue = JSON.stringify(
      createPersistedTransactionDataV1([
        sampleTransactions[0],
        userTransaction,
      ]).transactions
    );
    const { storage, values } = createFakeStorage({
      [STORAGE_KEYS.transactions]: rawValue,
    });
    const initialRead = readStoredTransactions([], storage);
    const state = createTransactionDataState(initialRead);
    const nextState = addTransactionToData(state, {
      ...userTransaction,
      id: "new-user-transaction",
    });

    persistMutation(initialRead, nextState.transactions, storage);

    expect(
      JSON.parse(values.get(STORAGE_KEYS.transactions) ?? "")
    ).toEqual(
      createPersistedTransactionDataV2(
        nextState.transactions
      )
    );
    expect(nextState.transactions).not.toContainEqual(
      sampleTransactions[0]
    );
  });

  it("does not persist exact demo-only legacy data during initialization", () => {
  const legacySampleTransactions =
    createPersistedTransactionDataV1(
      sampleTransactions
    ).transactions;

  const rawValue = JSON.stringify(
    legacySampleTransactions
  );

  const { storage, values } = createFakeStorage({
    [STORAGE_KEYS.transactions]: rawValue,
  });

  const state = createTransactionDataState(
    readStoredTransactions([], storage)
  );

  expect(state.source).toBe("demo");
  expect(values.get(STORAGE_KEYS.transactions)).toBe(
    rawValue
  );
});

  it("leaves the original legacy payload unchanged when its first mutation write fails", () => {
    const rawValue = JSON.stringify(
      createPersistedTransactionDataV1([userTransaction])
        .transactions
    );
    const { storage, values } = createFakeStorage(
      { [STORAGE_KEYS.transactions]: rawValue },
      { setThrows: true }
    );
    const initialRead = readStoredTransactions([], storage);
    const nextState = addTransactionToData(
      createTransactionDataState(initialRead),
      { ...userTransaction, id: "new-user-transaction" }
    );

    expect(
      persistMutation(
        initialRead,
        nextState.transactions,
        storage
      )
    ).toEqual({ status: "failed" });
    expect(values.get(STORAGE_KEYS.transactions)).toBe(rawValue);
  });

  it("leaves the original V1 payload unchanged when its migration write fails", () => {
    const rawValue = JSON.stringify(
      createPersistedTransactionDataV1([userTransaction])
    );
    const { storage, values } = createFakeStorage(
      { [STORAGE_KEYS.transactions]: rawValue },
      { setThrows: true }
    );
    const initialRead = readStoredTransactions([], storage);
    const nextState = addTransactionToData(
      createTransactionDataState(initialRead),
      { ...userTransaction, id: "new-user-transaction" }
    );

    expect(
      persistMutation(
        initialRead,
        nextState.transactions,
        storage
      )
    ).toEqual({ status: "failed" });
    expect(values.get(STORAGE_KEYS.transactions)).toBe(rawValue);
  });

  it.each([
    ["malformed", "{broken-json"],
    [
      "unsupported-version",
      JSON.stringify({
        version: TRANSACTION_STORAGE_VERSION + 1,
        transactions:
          createPersistedTransactionDataV1([
            userTransaction,
          ]).transactions,
      }),
    ],
  ])(
    "does not overwrite a %s payload after a user mutation",
    (_kind, rawValue) => {
      const { storage, values } = createFakeStorage({
        [STORAGE_KEYS.transactions]: rawValue,
      });
      const initialRead = readStoredTransactions([], storage);
      const nextState = addTransactionToData(
        createTransactionDataState(initialRead),
        userTransaction
      );

      expect(initialRead.status).toBe("invalid");
      expect(
        persistMutation(
          initialRead,
          nextState.transactions,
          storage
        )
      ).toBeNull();
      expect(values.get(STORAGE_KEYS.transactions)).toBe(rawValue);
    }
  );

  it("migrates V1 data to V2 through the normal mutation path", () => {
    const rawValue = JSON.stringify(
      createPersistedTransactionDataV1([userTransaction])
    );
    const { storage, values } = createFakeStorage({
      [STORAGE_KEYS.transactions]: rawValue,
    });
    const initialRead = readStoredTransactions([], storage);

    expect(values.get(STORAGE_KEYS.transactions)).toBe(rawValue);

    const nextState = addTransactionToData(
      createTransactionDataState(initialRead),
      { ...userTransaction, id: "second-user-transaction" }
    );
    persistMutation(initialRead, nextState.transactions, storage);

    expect(
      JSON.parse(values.get(STORAGE_KEYS.transactions) ?? "")
    ).toEqual(
      createPersistedTransactionDataV2(
        nextState.transactions
      )
    );
  });
});

describe("dashboard widget data sources", () => {
  const demoState = createTransactionDataState(
    storedTransactions([], "missing")
  );
  const userState = createTransactionDataState(
    storedTransactions([userTransaction], "valid")
  );

  it.each(["netWorth", "savingsGoal"] as const)(
    "marks the static %s widget as sample data in every state",
    (widgetId) => {
      expect(
        getDashboardWidgetDataSource(widgetId, demoState)
      ).toBe("sample");
      expect(
        getDashboardWidgetDataSource(widgetId, userState)
      ).toBe("sample");
    }
  );

  it.each([
    "monthlyIncome",
    "monthlyExpenses",
    "monthlySavings",
    "cashflow",
    "recentTransactions",
  ] as const)(
    "marks the transaction-backed %s widget from the active data source",
    (widgetId) => {
      expect(
        getDashboardWidgetDataSource(widgetId, demoState)
      ).toBe("demo");
      expect(
        getDashboardWidgetDataSource(widgetId, userState)
      ).toBe("user");
    }
  );
});
