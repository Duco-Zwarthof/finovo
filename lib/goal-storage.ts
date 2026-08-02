import type { Goal } from "./goal-types";
import { isValidGoal } from "./goals";
import type {
  StorageLike,
  StorageWriteResult,
} from "./storage";

export const GOAL_STORAGE_KEY =
  "finovo-goals";
export const GOAL_STORAGE_VERSION = 1 as const;

export type PersistedGoalDataV1 = {
  version: typeof GOAL_STORAGE_VERSION;
  goals: Goal[];
};

export type GoalStorageReadStatus =
  | "missing"
  | "valid"
  | "invalid"
  | "unsupported"
  | "unavailable";

export type GoalStorageReadResult = {
  value: Goal[];
  status: GoalStorageReadStatus;
};

function getBrowserStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function cloneGoals(
  goals: readonly Goal[]
): Goal[] {
  return goals.map((goal) => ({ ...goal }));
}

export function createPersistedGoalDataV1(
  goals: readonly Goal[]
): PersistedGoalDataV1 {
  const goalIds = new Set<string>();

  for (const goal of goals) {
    if (
      !isValidGoal(goal) ||
      goalIds.has(goal.id)
    ) {
      throw new TypeError(
        "Cannot persist invalid or duplicate goals"
      );
    }

    goalIds.add(goal.id);
  }

  return {
    version: GOAL_STORAGE_VERSION,
    goals: cloneGoals(goals),
  };
}

export function validatePersistedGoalDataV1(
  value: unknown
): Goal[] | null {
  if (
    !isRecord(value) ||
    value.version !== GOAL_STORAGE_VERSION ||
    !Array.isArray(value.goals)
  ) {
    return null;
  }

  const goals: Goal[] = [];
  const goalIds = new Set<string>();

  for (const entry of value.goals) {
    if (
      !isValidGoal(entry) ||
      goalIds.has(entry.id)
    ) {
      return null;
    }

    goalIds.add(entry.id);
    goals.push({ ...entry });
  }

  return goals;
}

export function readStoredGoals(
  fallback: readonly Goal[] = [],
  storage: StorageLike | null = getBrowserStorage()
): GoalStorageReadResult {
  const fallbackValue = () =>
    cloneGoals(fallback);

  if (!storage) {
    return {
      value: fallbackValue(),
      status: "unavailable",
    };
  }

  let storedValue: string | null;

  try {
    storedValue = storage.getItem(
      GOAL_STORAGE_KEY
    );
  } catch {
    return {
      value: fallbackValue(),
      status: "unavailable",
    };
  }

  if (storedValue === null) {
    return {
      value: fallbackValue(),
      status: "missing",
    };
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(
      storedValue
    ) as unknown;
  } catch {
    return {
      value: fallbackValue(),
      status: "invalid",
    };
  }

  if (
    isRecord(parsedValue) &&
    "version" in parsedValue &&
    parsedValue.version !==
      GOAL_STORAGE_VERSION
  ) {
    return {
      value: fallbackValue(),
      status: "unsupported",
    };
  }

  const goals =
    validatePersistedGoalDataV1(
      parsedValue
    );

  if (!goals) {
    return {
      value: fallbackValue(),
      status: "invalid",
    };
  }

  return {
    value: goals,
    status: "valid",
  };
}

export function writeStoredGoals(
  goals: readonly Goal[],
  storage: StorageLike | null = getBrowserStorage()
): StorageWriteResult {
  if (!storage) {
    return { status: "unavailable" };
  }

  let persistedData: PersistedGoalDataV1;

  try {
    persistedData =
      createPersistedGoalDataV1(goals);
  } catch {
    return { status: "failed" };
  }

  try {
    storage.setItem(
      GOAL_STORAGE_KEY,
      JSON.stringify(persistedData)
    );

    return { status: "written" };
  } catch {
    return { status: "failed" };
  }
}
