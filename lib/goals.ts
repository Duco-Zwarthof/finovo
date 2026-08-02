import type {
  Goal,
  GoalProgress,
  GoalStatus,
} from "./goal-types";
import { GOAL_STATUSES } from "./goal-types";
import { isValidAmountMinor } from "./transaction-amount";

export function isGoalStatus(
  value: unknown
): value is GoalStatus {
  return (
    typeof value === "string" &&
    GOAL_STATUSES.includes(value as GoalStatus)
  );
}

export function isValidGoalDate(
  value: unknown
): value is string | null {
  if (value === null) {
    return true;
  }

  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const [yearText, monthText, dayText] =
    value.split("-");

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidGoal(
  value: unknown
): value is Goal {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const goal = value as Record<string, unknown>;

  return (
    typeof goal.id === "string" &&
    goal.id.trim().length > 0 &&
    typeof goal.name === "string" &&
    goal.name.trim().length > 0 &&
    isValidAmountMinor(goal.targetAmountMinor) &&
    goal.targetAmountMinor > 0 &&
    isValidAmountMinor(goal.currentAmountMinor) &&
    goal.currentAmountMinor >= 0 &&
    isValidGoalDate(goal.targetDate) &&
    isGoalStatus(goal.status)
  );
}

function addMinorUnits(
  first: number,
  second: number
): number {
  const result = first + second;

  if (!Number.isSafeInteger(result)) {
    throw new RangeError(
      "Goal amount exceeds the safe minor-unit range"
    );
  }

  return result;
}

function subtractMinorUnits(
  first: number,
  second: number
): number {
  const result = first - second;

  if (!Number.isSafeInteger(result)) {
    throw new RangeError(
      "Goal amount exceeds the safe minor-unit range"
    );
  }

  return result;
}

export function addGoal(
  goals: readonly Goal[],
  goal: Goal
): Goal[] {
  if (!isValidGoal(goal)) {
    throw new TypeError(
      "Cannot add an invalid goal"
    );
  }

  if (
    goals.some(
      (existing) => existing.id === goal.id
    )
  ) {
    throw new Error("Goal already exists");
  }

  return [...goals, { ...goal }];
}

export function updateGoal(
  goals: readonly Goal[],
  goal: Goal
): Goal[] {
  if (!isValidGoal(goal)) {
    throw new TypeError(
      "Cannot update an invalid goal"
    );
  }

  if (
    !goals.some(
      (existing) => existing.id === goal.id
    )
  ) {
    throw new Error(
      "Cannot update a goal that does not exist"
    );
  }

  return goals.map((existing) =>
    existing.id === goal.id
      ? { ...goal }
      : { ...existing }
  );
}

export function deleteGoal(
  goals: readonly Goal[],
  goalId: string
): Goal[] {
  return goals
    .filter((goal) => goal.id !== goalId)
    .map((goal) => ({ ...goal }));
}

export function calculateGoalProgressPercentage(
  currentAmountMinor: number,
  targetAmountMinor: number
): number {
  if (
    !isValidAmountMinor(currentAmountMinor) ||
    currentAmountMinor < 0 ||
    !isValidAmountMinor(targetAmountMinor) ||
    targetAmountMinor <= 0
  ) {
    throw new RangeError(
      "Cannot calculate progress from invalid goal amounts"
    );
  }

  return Math.min(
    (currentAmountMinor / targetAmountMinor) * 100,
    100
  );
}

export function calculateMonthsRemaining(
  targetDate: string | null,
  now: Date = new Date()
): number | null {
  if (targetDate === null) {
    return null;
  }

  if (!isValidGoalDate(targetDate)) {
    throw new RangeError(
      "Cannot calculate months for an invalid target date"
    );
  }

  const [yearText, monthText, dayText] =
    targetDate.split("-");

  const targetYear = Number(yearText);
  const targetMonth = Number(monthText);
  const targetDay = Number(dayText);

  const monthDifference =
    (targetYear - now.getFullYear()) * 12 +
    (targetMonth - 1 - now.getMonth());

  const adjustedDifference =
    targetDay > now.getDate()
      ? monthDifference + 1
      : monthDifference;

  return Math.max(adjustedDifference, 0);
}

export function calculateRequiredMonthlyContributionMinor(
  remainingAmountMinor: number,
  monthsRemaining: number | null
): number | null {
  if (
    !Number.isSafeInteger(remainingAmountMinor) ||
    remainingAmountMinor < 0
  ) {
    throw new RangeError(
      "Cannot calculate a contribution from an invalid remaining amount"
    );
  }

  if (monthsRemaining === null) {
    return null;
  }

  if (
    !Number.isInteger(monthsRemaining) ||
    monthsRemaining < 0
  ) {
    throw new RangeError(
      "Cannot calculate a contribution from invalid remaining months"
    );
  }

  if (remainingAmountMinor === 0) {
    return 0;
  }

  if (monthsRemaining === 0) {
    return null;
  }

  return Math.ceil(
    remainingAmountMinor / monthsRemaining
  );
}

export function calculateGoalProgress(
  goal: Goal,
  now: Date = new Date()
): GoalProgress {
  if (!isValidGoal(goal)) {
    throw new TypeError(
      "Cannot calculate progress for an invalid goal"
    );
  }

  const cappedCurrentAmountMinor = Math.min(
    goal.currentAmountMinor,
    goal.targetAmountMinor
  );

  const remainingAmountMinor = Math.max(
    subtractMinorUnits(
      goal.targetAmountMinor,
      cappedCurrentAmountMinor
    ),
    0
  );

  const monthsRemaining =
    calculateMonthsRemaining(
      goal.targetDate,
      now
    );

  return {
    goalId: goal.id,
    targetAmountMinor: goal.targetAmountMinor,
    currentAmountMinor:
      goal.currentAmountMinor,
    remainingAmountMinor,
    progressPercentage:
      calculateGoalProgressPercentage(
        goal.currentAmountMinor,
        goal.targetAmountMinor
      ),
    isCompleted:
      goal.currentAmountMinor >=
        goal.targetAmountMinor ||
      goal.status === "completed",
    monthsRemaining,
    requiredMonthlyContributionMinor:
      calculateRequiredMonthlyContributionMinor(
        remainingAmountMinor,
        monthsRemaining
      ),
  };
}

export function calculateTotalGoalTargetMinor(
  goals: readonly Goal[]
): number {
  return goals.reduce(
    (total, goal) =>
      addMinorUnits(
        total,
        goal.targetAmountMinor
      ),
    0
  );
}

export function calculateTotalGoalProgressMinor(
  goals: readonly Goal[]
): number {
  return goals.reduce(
    (total, goal) =>
      addMinorUnits(
        total,
        goal.currentAmountMinor
      ),
    0
  );
}
