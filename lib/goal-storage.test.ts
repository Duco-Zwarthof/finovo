import { describe, expect, it } from "vitest";

import type { Goal } from "./goal-types";
import {
  GOAL_STORAGE_KEY,
  GOAL_STORAGE_VERSION,
  createPersistedGoalDataV1,
  readStoredGoals,
  validatePersistedGoalDataV1,
  writeStoredGoals,
} from "./goal-storage";
import type { StorageLike } from "./storage";

const goal: Goal = {
  id: "goal-1",
  name: "House deposit",
  targetAmountMinor: 3_000_000,
  currentAmountMinor: 1_200_000,
  targetDate: "2028-08-01",
  status: "active",
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

describe("goal storage", () => {
  it("creates a versioned goal envelope", () => {
    expect(
      createPersistedGoalDataV1([goal])
    ).toEqual({
      version: GOAL_STORAGE_VERSION,
      goals: [goal],
    });
  });

  it("validates stored goals", () => {
    expect(
      validatePersistedGoalDataV1({
        version: GOAL_STORAGE_VERSION,
        goals: [goal],
      })
    ).toEqual([goal]);
  });

  it("rejects malformed and duplicate goals", () => {
    expect(
      validatePersistedGoalDataV1({
        version: GOAL_STORAGE_VERSION,
        goals: [
          {
            ...goal,
            targetAmountMinor: 0,
          },
        ],
      })
    ).toBeNull();

    expect(
      validatePersistedGoalDataV1({
        version: GOAL_STORAGE_VERSION,
        goals: [goal, goal],
      })
    ).toBeNull();
  });

  it("reads missing and valid storage", () => {
    const empty = createFakeStorage();

    expect(
      readStoredGoals([], empty.storage)
    ).toEqual({
      value: [],
      status: "missing",
    });

    const valid = createFakeStorage({
      [GOAL_STORAGE_KEY]: JSON.stringify(
        createPersistedGoalDataV1([
          goal,
        ])
      ),
    });

    expect(
      readStoredGoals([], valid.storage)
    ).toEqual({
      value: [goal],
      status: "valid",
    });
  });

  it("rejects invalid and unsupported storage", () => {
    const invalid = createFakeStorage({
      [GOAL_STORAGE_KEY]: "{broken",
    });

    expect(
      readStoredGoals([], invalid.storage)
    ).toEqual({
      value: [],
      status: "invalid",
    });

    const unsupported =
      createFakeStorage({
        [GOAL_STORAGE_KEY]: JSON.stringify({
          version:
            GOAL_STORAGE_VERSION + 1,
          goals: [goal],
        }),
      });

    expect(
      readStoredGoals(
        [],
        unsupported.storage
      )
    ).toEqual({
      value: [],
      status: "unsupported",
    });
  });

  it("writes goals and reports failures", () => {
    const writable = createFakeStorage();

    expect(
      writeStoredGoals(
        [goal],
        writable.storage
      )
    ).toEqual({ status: "written" });

    expect(
      writable.values.get(
        GOAL_STORAGE_KEY
      )
    ).toBe(
      JSON.stringify(
        createPersistedGoalDataV1([
          goal,
        ])
      )
    );

    expect(
      writeStoredGoals([goal], null)
    ).toEqual({
      status: "unavailable",
    });

    const failing = createFakeStorage(
      {},
      { setThrows: true }
    );

    expect(
      writeStoredGoals(
        [goal],
        failing.storage
      )
    ).toEqual({ status: "failed" });
  });
});
